# Facts Harvesting

Backend source: `xsl-backend/src/server/routes/facts.routes.ts`, `xsl-backend/src/lib/facts.ts`.
Frontend: `src/pages/client/tabs/FactsTab.tsx`.

## What a "fact" is, specifically

Not a model's recollection — the `facts` table schema comment is explicit about this: *"A fact
enters by being found on the open web with a URL attached — never by a model recalling it."* Every
row in the fact ledger carries `sources[]` (URL, domain, which engine surfaced it, when), a `tier`
(`self_attested` / `third_party` / `registry` / `operator` — worst to best), and a `status`
(`candidate` → `corroborated`/`confirmed`, or `rejected`). This ledger is the *only* thing the
content-asset writer ([docs/07-content-assets.md](07-content-assets.md)) is allowed to assert on a
client's behalf — which is the entire reason this feature exists as its own gated tier rather than
just being folded into probing.

## Plan gating

Both routes in this file require `user.role === 'admin' || user.planTier === 'enterprise_599'`.
Anyone else gets `403 { code: 'UPGRADE_REQUIRED', requiredPlan: 'enterprise_599', currentPlan }`.
`FactsTab.tsx` checks this client-side (`canHarvest` in the component) and swaps the **Harvest**
button for `<UpgradeGate feature="facts harvesting" />` (`src/components/UpgradeGate.tsx`) — a
small link straight to the Billing page — rather than showing a button that's guaranteed to 403.
The server-side check is still what actually enforces this; the client-side swap only avoids a
wasted, confusing round trip.

## `POST /api/facts/harvest`

```ts
{ slug: string, engines?: string[] } → { success: true, harvest: { proposed, kept, written, ... } }
```

Also ownership-gated independently of the plan check — `403 { code: 'OWNED_ASSET_REQUIRED' }` if
the client isn't yours (or is a public showcase and you're not an admin). Under the hood this
issues a batch of engine queries, checks every proposed fact's citations against its actual
answer text (the schema comment on `factClaims` tells the story of why this check exists: an
earlier version threw away 32/32 real proposals about a 45-year-old business because Gemini's
citation URLs are redirects and the naive check compared against the redirect host instead of the
real publisher in the title field), and only *then* writes survivors into `facts`.

`FactsTab.tsx`'s toast after a harvest reports exactly this funnel:
`"{written} new fact(s) written ({kept}/{proposed} proposals survived verification)"` — the gap
between `proposed` and `kept` is the harvester's own hallucination rate for that run, worth
watching if it's ever unexpectedly high.

## `GET /api/facts/:slug`

```ts
{ facts: Fact[] }
```

No auth required — reading the ledger is public, only harvesting new facts is gated. `FactsTab.tsx`
renders each fact with its value, up to 3 source-domain chips (linking out to the actual URL), a
status badge, and its tier. Facts aren't editable from this UI — the backend's append-only model
means a correction is a new row (`supersededBy` on the old one), not an edit, and there's no route
exposed for writing that transition by hand today.
