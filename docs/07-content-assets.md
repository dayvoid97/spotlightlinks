# Content Assets

Backend source: `xsl-backend/src/server/routes/assets.routes.ts`.
Frontend: `src/pages/client/tabs/AssetsTab.tsx`.

## What gets built

Schema markup, FAQ content briefs, citation packets — production copy meant to actually ship to a
client's live site, which is why the `assets` table schema comment draws a hard line: *"a wrong
number in a report embarrasses us; a wrong claim in schema markup on a client's live site is
public, permanent, and in some states illegal."* Every asset is built exclusively from the
[fact ledger](06-facts-harvesting.md) — nothing it asserts is model-recalled — and every asset
batch is checked for unsupported claims before it's ever shown (`claimCheck` on the row).

Same plan gate as facts: **Enterprise Suite only** (`user.planTier === 'enterprise_599'`, or
admin). `AssetsTab.tsx` handles this identically to `FactsTab.tsx` — the same `<UpgradeGate>`
component, swapped in for the **Build assets** button.

## `POST /api/assets/build`

```ts
{ slug: string, note?: string, force?: boolean } → { success: true, bundle: {...} }
```

Ownership-gated (`OWNED_ASSET_REQUIRED`) same as facts harvesting. Internally this reads the
client's fact ledger, runs a strategy analysis (`analyzeStrategy` — which prompts/locales have
coverage gaps worth writing content for), and writes a full batch of assets in one call.
`AssetsTab.tsx` doesn't need to know any of that internal shape — it just re-fetches the asset list
on success.

## `GET /api/assets/:slug`

```ts
{ assets: AssetItem[] }
```

Public, no auth. Each asset carries `kind`, `key`, `version` (assets are versioned per
`(client, kind, key)` — the third rewrite of the pricing FAQ is version 3 regardless of which
batch produced it), `status` (`draft` → `approved` → `published`, or `retired`), and the actual
`body` in whatever `format` it was written in (`json` / `markdown` / `html`).
`AssetsTab.tsx` renders the first 800 characters of `body` in a scrollable `<pre>` block per
asset — full-length rendering (with format-aware syntax highlighting) is a reasonable next step if
this becomes a primary editing surface rather than a review surface.

## `POST /api/assets/approve`

```ts
{ assetId: string, liveUrl: string } → { success: true, message: string }
```

This is the "we actually published this" step — you supply the URL where the asset now lives on
the client's real site, and the backend timestamps `publishedAt`. `AssetsTab.tsx` shows a URL input
next to any non-published asset, with **Approve** disabled until something's typed in it. There's
no unpublish/retire action exposed by this route today, so this is a one-way transition from the
UI's perspective — matches the backend, which also has no corresponding "unapprove" endpoint.
