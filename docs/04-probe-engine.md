# The Probe Engine (SSE)

Backend source: `xsl-backend/src/server/routes/probe.routes.ts`,
`xsl-backend/src/lib/runProbeCycle.ts`.
Frontend: `src/pages/client/tabs/ProbeTab.tsx`, `src/lib/sse.ts`.

This is the feature the whole "which framework" decision in the README was made around, so it's
worth understanding in full.

## What a probe cycle actually does

`POST /api/probe/run` asks every configured AI engine (Gemini, Claude, Perplexity) every active
prompt for a client, across every target locale, `runs` times each (default 3, floored at 2 by the
backend's own config — a single run is anecdote, not signal). For a client with, say, 15 prompts ×
2 locales × 3 engines × 3 runs, that's 270 real API calls before scoring even starts. Each call has
real latency and real cost. **This is why the endpoint is authenticated, rate-limited, and gated
behind an explicit disclaimer** — see below.

## Why this can't be `EventSource`

The browser's native `EventSource` API only ever issues `GET` requests. This endpoint needs a JSON
body (`slug`, optional `engines`/`runs`/`limit`/`acceptDisclaimer`) and is a `POST`. So
`src/lib/sse.ts` implements the same wire format by hand:

```ts
const res = await fetch(url, { method: 'POST', body: JSON.stringify(body), ... })
const reader = res.body.getReader()
// read chunks, split on "\n\n", parse "event:" / "data:" lines
```

This is the standard workaround for POST-based SSE, and it's what lets a single `fetch` stay open
and keep yielding events for the full duration of a run — no polling, no reconnect logic, just one
connection read until the backend closes it. `runProbeCycleSSE()` on the backend writes frames as
plain `res.write(\`event: ${event}\ndata: ${JSON.stringify(data)}\n\n\`)` calls throughout the
cycle; `streamSSE()` here is the exact inverse of that.

### Event types

| Event | Payload | When |
|---|---|---|
| `log` | `{ message: string, level?: 'info'\|'warn'\|'error' }` | Narration throughout — engine checks, job planning, cycle progress, warnings. |
| `progress` | `{ done, failed, total, percent }` | After each job in the cycle finishes. |
| `complete` | `ProbeCompleteEvent` (see `src/lib/types.ts`) | Once, at the end of a successful or partially-failed cycle. |
| `error` | `{ message: string, code?: string }` | Either instead of `complete` (a fatal error mid-cycle), or in place of the whole stream if the request was rejected before the SSE headers were even sent (see below). |

One subtlety `sse.ts` handles explicitly: **rejections that happen before the cycle starts —
missing slug, `403`, `429`, `400` — never reach the SSE-writing code path at all.** They come back
as an ordinary JSON error response with a normal HTTP status, not as an `event: error` frame.
`streamSSE()` checks `res.ok` first and synthesizes an `error` event from the JSON body in that
case, so `ProbeTab.tsx`'s `onEvent` handler never has to know which situation it's in.

## Rate limiting

Enforced in `probe.routes.ts`, not just documented: **max 2 full probe cycles per client per
rolling 24-hour window** (admins exempt). "Full" means all engines run; the backend counts
distinct `cycleId`s within the last 24 hours to determine this. Exceeding it returns
`429 { code: 'DAILY_PROBE_LIMIT_EXCEEDED', cyclesToday, maxAllowed }`.

**Targeted re-probes are exempt.** If `engines` in the request array has fewer than 3 entries, the
backend treats it as a targeted re-probe (re-checking specific engines that failed or were never
run) and skips the quota check entirely. `ProbeTab.tsx` surfaces this directly: the engine-picker
buttons let you deselect one or two engines, and the helper text under them says exactly this —
deselecting anything turns the run into a free re-probe.

## The disclaimer gate

`POST /api/probe/run` checks `user.disclaimerAcceptedAt` before doing anything. If it's unset and
the request doesn't also include `acceptDisclaimer: true`, it returns
`400 { code: 'DISCLAIMER_REQUIRED' }` — and does **not** run the cycle. If `acceptDisclaimer` is
present and truthy, it both records the acceptance (`POST /api/auth/disclaimer`'s effect, done
inline) *and* proceeds with the run in the same request.

`ProbeTab.tsx` mirrors this: if `user.disclaimerAcceptedAt` is falsy, it renders a checkbox above
the run button and disables the button until it's checked; checking it sends
`acceptDisclaimer: true` on the next run. After a successful run, `refresh()` is called on the
auth context so `user.disclaimerAcceptedAt` updates and the checkbox doesn't reappear on the next
visit.

## Ownership on public clients

A client with `isPublic: true` is a read-only showcase for anyone who isn't its owner —
`probe.routes.ts` returns `403 { code: 'PUBLIC_CASE_STUDY_READ_ONLY' }` for a non-owner trying to
probe it. `ProbeTab.tsx` checks the same condition (`client.isPublic && !client.isOwner`)
client-side and replaces the entire run form with an explanatory message, rather than letting
someone click "Run" only to get a 403 — the check is duplicated deliberately, once for UX and once
(the one that actually matters) on the server.

## Cancelling

Closing or navigating away from the Probe tab aborts the underlying `fetch` via an
`AbortController` (`abortRef` in `ProbeTab.tsx`, cleaned up in a `useEffect` return). The backend
listens for exactly this: `res.on('close', () => { isAborted = true })` inside
`runProbeCycleSSE()`. Once that flag flips, `runCycle()` stops dispatching new engine calls — jobs
already in flight still finish, but nothing new starts. This is also wired to an explicit
**Cancel** button while a run is active, which does the same `abort()` without requiring a
navigation.

## What `complete` contains

```ts
{
  success: boolean, aborted: boolean,
  done: number, failed: number, total: number,
  benched: string[],                 // engines skipped for cost/safety this cycle
  engineStats: {...}, engineAudit: {...},   // per-engine ok/failed/skipped/model/status
  errors: unknown[],                 // first 5 job errors, for debugging
  scoredCount: number, mentionedCount: number,
  publicReportUrl: string,
  downloadUrls: { html, pdf?, docx?, rtf? } | null,
}
```

`ProbeTab.tsx` renders all of this: a stat row, a per-engine audit table with status badges, a
benched-engines warning if applicable, a link to the public report, and a PDF download link when
`downloadUrls.pdf` is present. The full analytics behind `scoredCount`/`mentionedCount` — mention
rate, citation rate, competitor leaderboard, keyword matrix — live on the **Reports** tab; see
[docs/05-reports-and-analytics.md](05-reports-and-analytics.md).
