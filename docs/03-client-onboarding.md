# Client Onboarding

Backend source: `xsl-backend/src/server/routes/clients.routes.ts`.
Frontend: `src/pages/DashboardPage.tsx`, `src/pages/NewClientPage.tsx`,
`src/pages/GetStartedPage.tsx`, `src/components/ClientOnboardingForm.tsx`,
`src/lib/onboarding-draft.ts`, `src/pages/SubduedPage.tsx`,
`src/pages/client/tabs/OverviewTab.tsx`, `src/pages/client/tabs/SettingsTab.tsx`.

A "client" in xsl-backend is a business being audited — not a user account. One user account can
own several clients (up to their plan's `assetLimit`), and a client can also be a **public case
study** anyone can view (but only its owner or an admin can re-probe).

## Listing clients — `GET /api/clients`

Visibility depends on who's asking, computed server-side:

- **Admin:** every active client.
- **Signed-in user:** every public client, plus their own private ones (`ownerUserId` or
  `ownerEmail` match).
- **Anonymous:** public clients only.

`DashboardPage.tsx` doesn't branch on any of this — it just renders whatever the array contains,
because the filtering already happened in the query. Each row in the response is pre-enriched
with everything `ClientCard.tsx` needs to render without a second request: `engineHealth`,
`engineCoverage`, `cycleHistory` (last 10 probe cycles, grouped and scored), `probesToday`,
`lastProbedByEngine`, `logoUrl`, `mediaCount`, `hasConfig`. This is a deliberately heavy endpoint —
it does the mention/citation aggregation for every client in the list, every time — worth knowing
if you ever see this route get slow with a large client roster.

## Creating a client

Two calls, chained by hand in `NewClientPage.tsx`:

### 1. `POST /api/clients/synthesize-bio` (optional)

```ts
{ storyText: string } → { success: true, synthesized: SynthesizedIntake }
```
No auth required, nothing persisted. Paste free-form prose about a business and an LLM
(`engines/model.ts`'s `complete()` + `parseJson()`) extracts `businessName`, `zip`, `categories`,
`competitors`, `description`, `foundingYear`, `highlights`. Purely a form-prefill convenience —
`handleSynthesize()` in `NewClientPage.tsx` just spreads the result into local form state.

### 2. `POST /api/clients/generate` — the real submission

```ts
// request (Intake)
{
  businessName: string, description: string, zip: string,   // required
  categories?: string[], competitors?: string[], radiusMiles?: number,
  foundingYear?: number, highlights?: string[], allowDuplicate?: boolean,
}
// response
{ success: true, slug: string, isPublic: false, generated: {...}, seeded: {...}, publicReportUrl: string }
```
`requireAuth`. This is the expensive call — it generates a full question set (prompts across
intents and locales) from the intake, seeds it into Postgres, and returns the new client's `slug`.

**`domain` is load-bearing, not decorative.** `detect.ts` decides whether an answer *cited* the
client with `Boolean(domain && run.citations.some((c) => norm(c.url).includes(domain)))` — so a
client with no domain scores `cited: false` on every run it will ever collect, and the report reads
back a 0% citation rate as a finding about the business rather than a gap in its own intake. The
onboarding form shipped without this field for a while; every client created in that window needs
one set retroactively (see **Editing configuration** below). `normalizeDomain()` in `generate.ts`
strips scheme, `www.` and any path first, because the detector does a substring match and anything
carried along narrows it.
Ownership is set automatically to the calling user (`ownerEmail`/`ownerUserId`), and the client
starts **private**.

Two error codes `NewClientPage.tsx` handles specifically:

- **403 `ASSET_LIMIT_EXCEEDED`** — the user's `assetLimit` (from their plan tier) is already used
  up. See [docs/08-billing-and-plans.md](08-billing-and-plans.md).
- **409 `DUPLICATE_CLIENT`** — the generated slug collides or overlaps with an existing client
  (checked by comparing hyphen-stripped slug stems, so "Rock N Joe" and "Rock-N-Joe" collide even
  with different punctuation). The response includes `existingSlug`; the form surfaces a "Create
  anyway" button that resubmits with `allowDuplicate: true`.

## Public onboarding funnel — `/get-started`

The two calls above have deliberately different auth requirements, and the public funnel is built
directly on that asymmetry:

- `POST /api/clients/synthesize-bio` has **no** `requireAuth` on the backend — so it's offered
  **free to logged-out visitors**.
- `POST /api/clients/generate` **does** require auth — so that's the point where a logged-out
  visitor is asked to create an account.

`GetStartedPage.tsx` (public route `/get-started`, where the homepage's "Get started free" CTA
points) renders the same intake form as the authed page — both use the shared
`ClientOnboardingForm` component, so there's one form to maintain, not two. A logged-out visitor
can fill everything in and run synthesize as many times as they like. When they hit **Create
client & question set**, the funnel does *not* call `/api/clients/generate` (it would just 401):
instead it parks the whole form in `sessionStorage` (`src/lib/onboarding-draft.ts`) and shows an
inline sign-up prompt.

After they create an account (or log in), `SignupPage`/`LoginPage` check for that parked draft and,
if present, route to `/clients/new` instead of `/dashboard`. `NewClientPage` rehydrates the draft
on mount (then clears it), so the visitor lands back on a pre-filled form and just clicks generate —
now authenticated. Nothing they typed pre-signup is lost.

A logged-in visitor who somehow lands on `/get-started` is redirected straight to `/clients/new` —
they don't need the funnel, and this keeps their experience "intact" as the authed flow.

The draft uses `sessionStorage`, not `localStorage`: it's a one-shot handoff for the current tab's
flow, not something meant to persist across sessions.

## Reading a client — `GET /api/clients/:slug`

```ts
{ client: ClientSummary & { lastProbedAt }, prompts: Prompt[], fileContent: ClientFile | null, publicReportUrl: string }
```
No auth required (public clients need to be readable by anyone). `ClientDetailPage.tsx` fetches
this once and passes slices of it down to each tab — the tabs that need more (facts, assets,
media, reports) fetch those separately, on their own `useQuery` keys, so switching tabs doesn't
re-fetch data other tabs already have.

## Editing configuration — `POST /api/clients/:slug/config`

```ts
{ competitors?: string[], prompts?: Prompt[], aliases?: string[], locales?: string[], domain?: string }
→ { success: true, slug, client, fileContent, prompts, contextVersion }
```
Owner-only (403 otherwise). `OverviewTab.tsx` exposes `domain`, `competitors`, `aliases`, and
`locales`; the three list fields are comma-separated text inputs that split/join client-side.

`domain` exists here specifically to repair clients onboarded before the intake form carried a
Website field — the config form warns in amber while it is empty. **Setting it only fixes future
cycles.** `detectFor()` skips any run that already has a detection at the current
`DETECTOR_VERSION`, so runs already scored keep `cited: false`. Re-scoring history means either
bumping `DETECTOR_VERSION` (the documented mechanism, but it re-scores every client) or deleting
that client's `detections` rows and re-running detection. **Note:** the backend's `prompts` field
lets you wholesale-replace the question set through this same endpoint — that's real, but this UI
intentionally doesn't expose it. Editing individual prompt text/intent/locale one at a time isn't
supported by the backend (it's replace-the-whole-array-or-nothing), and a raw JSON textarea for
that felt like the wrong tradeoff. Owners who don't like the questions they were given reach for
the regenerate endpoint below instead.

## Rerolling the question set — `POST /api/clients/:slug/prompts/regenerate`

```ts
{ guidance?: string }
→ { success: true, slug, client, fileContent, prompts, templateCount,
    previousTemplateCount, promptCount, notes, model, contextVersion }
```
Owner-only. Re-runs `generateClientFile()` against the client's **stored intake**
(`ClientFile.intake`, written at onboarding) and swaps the resulting questions in. The "New
question set" button in the Prompt set card on `OverviewTab.tsx` opens a panel with an optional
free-text box — whatever the owner types there ("fewer price questions, more about catering")
is appended to the intake description as explicit steering before generation.

Three deliberate constraints, each of which is load-bearing:

- **Only `prompts` change.** Markets, competitors, and aliases are carried over untouched. Those
  set a cycle's cost and its comparison baseline; a reroll of the wording must not quietly
  re-scope the audit.
- **Old questions are retired, never deleted.** `probe_runs.prompt_id` is `onDelete: 'cascade'`,
  so deleting a prompt row deletes every measurement collected from it. The route calls
  `seedClient(cfg, false, { retireGenerated: true })` — a third seed mode (see `SeedOptions` in
  `lib/seed.ts`) that flips departing prompts to `active: false` and reinstates returning ones in
  place, keeping their history attached instead of inserting an empty duplicate. Every read path
  already filters on `active`, so a retired question stops being probed and stops rendering.
- **Customer-entered prompts are untouched**, exactly as on a normal reseed.

Generation runs at a **higher temperature** than onboarding (0.8 bare, 0.5 with guidance, versus
the 0.2 default — `GenerateOptions.temperature`). At 0.2 a reroll of an unchanged intake returns
approximately the same questions, which is the one outcome a customer clicking "regenerate" has
already rejected.

`CompleteOptions.temperature` existed before this but was never read — every provider branch in
`engines/model.ts` hardcoded 0.2 (Gemini, OpenAI) or sent nothing at all and inherited the
provider default of ~1.0 (Anthropic, Perplexity). All four now honor it, which also means the
Anthropic and Perplexity **fallback** paths finally generate at the 0.2 the generator always
intended, rather than at full randomness.

### When the model drops a brace

`parseJson` in `engines/model.ts` repairs JSON that stopped before it closed, rather than failing
the whole call. This is not theoretical: a regenerate for `doner-haus` came back with every
service, locale, competitor and prompt intact and exactly one `}` missing, at 3,963 characters —
nowhere near the 8,000-token cap, so it was never a budget problem.

The repair walks backwards from the end, cuts at each position that could end a complete value,
closes whatever is still open, and parses. A document missing one brace is repaired exactly; one
cut off mid-array loses only the incomplete element. A cut *mid-string* is deliberately left
unrepairable — that is genuine truncation and should surface rather than be papered over. Every
repair logs a `[model]` warning with what it closed and discarded, and `generateClientFile` still
rejects a result with no prompts or no locales, so a bad repair fails loudly.

Returns **409 `INTAKE_MISSING`** for clients seeded by hand with no `intake` block — there is
nothing to generate from, and the UI surfaces the message inline. This is one LLM call, so it
takes tens of seconds; the frontend holds the button in its loading state and says so.

There's a smaller endpoint for competitors specifically, `POST /api/clients/:slug/competitors`,
that appends to the existing list rather than replacing it — not used here since `/config` already
covers the same field with full replace semantics from one form.

## Visibility and deletion

- **`PATCH /api/clients/:slug/visibility`** — `{ isPublic: boolean }`, owner-only. Toggled from
  `SettingsTab.tsx`. Making a client public puts it in every visitor's dashboard as a read-only
  case study; only the owner (or an admin) can still run probes on it (enforced in
  `probe.routes.ts`, see [docs/04-probe-engine.md](04-probe-engine.md)).
- **`DELETE /api/clients/:slug`** — owner-only, **soft delete**. Sets `deletedAt` and a
  `subduedUntil` 30 days out; the client stops appearing in the normal list but every probe run,
  report, and fact stays in Postgres untouched.
- **`GET /api/clients/subdued`** — lists the calling user's (or, for admins, everyone's) deleted-
  but-recoverable clients, with a computed `daysRemaining` and `canRecover`. `SubduedPage.tsx`.
- **`POST /api/clients/:slug/recover`** — clears `deletedAt`/`subduedUntil`, restores `active`.
  Same page, "Recover" button.

Nothing in this backend appears to actually enforce the 30-day window with a cron job or similar —
it's a UI/business-logic convention (`canRecover` in the response) rather than something that
purges data automatically. Worth confirming before relying on it for real data-retention
compliance.
