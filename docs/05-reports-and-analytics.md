# Reports & Analytics

Backend source: `xsl-backend/src/server/routes/reports.routes.ts`.
Frontend: `src/pages/client/tabs/ReportsTab.tsx`.

## The measurement model this is built on

Backend's own `schema.ts` comment explains the split this whole tab reads from:

> `probe_runs` = what an engine actually said. Raw, permanent, never edited.
> `detections` = what we think it means. Cheap, versioned, always recomputable.

Every number on this tab is a join across those two tables (plus `prompts`, for grouping), scored
fresh on every request — nothing here is cached client-side beyond TanStack Query's normal
request-level caching.

## `GET /api/reports/:slug`

The one call this whole tab is built from. No auth required (reports are as public as their
client). Response shape (`ReportData` in `src/lib/types.ts`):

```ts
{
  client, publicReportUrl, downloadUrls, latestReport,
  aiSummary: { headline, executiveSummary, takeaways[], recommendedActions[], score, competitorThreat, statusBadge },
  metrics: { totalRuns, mentionedCount, citedCount, rankOneCount, mentionRate, citationRate },
  engineStats: Record<engine, { total, mentioned, cited }>,
  localeStats: Record<locale, { total, mentioned, cited }>,
  competitorsLeaderboard: { name, count }[],
  topSources: { domain, count }[],
  keywordMatrix: KeywordMatrixRow[],
}
```

If `client.totalRuns` (well — `metrics.totalRuns` here) is `0`, `ReportsTab.tsx` shows an inline
prompt to run a probe cycle first rather than an empty dashboard of zeros.

### `aiSummary` is sometimes free, sometimes not

The backend checks for a pre-computed, stored report snapshot (`reports` table, written at the end
of the last probe cycle) first, and only calls the LLM to generate a fresh `aiSummary` if none
exists. That means this call is fast and free on repeat visits to an already-probed client, and
does one extra LLM call the very first time a client has data. Nothing on the frontend needs to
know which case it hit — the shape is identical either way.

### The keyword matrix

`keywordMatrix` groups every scored run by prompt, and within each prompt by engine, giving you
every individual run's `mentioned`/`cited`/`rank`/`competitors`/`answerSnippet`. `ReportsTab.tsx`
renders this as a collapsible list (`KeywordRow`) — collapsed, you see the prompt text, intent,
locale, and an aggregate mention-rate badge; expanded, every engine's individual runs with their
answer snippets. This is the view for "why does this specific search not mention the client" —
the raw answer text is right there.

## `POST /api/reports/:slug/swot`

```ts
requireAuth → { success: true, client, metrics, swot: { strengths[], weaknesses[], opportunities[], threats[], strategicVerdict } }
```

Deliberately **not** called automatically alongside the main report fetch — it's a separate LLM
call every single time it's invoked (no caching on the backend side, unlike `aiSummary`), so
`ReportsTab.tsx` puts it behind an explicit **Generate** button. If the LLM call itself fails, the
backend has a structured fallback built from the raw metrics (see the `swotResult` default in
`reports.routes.ts`) rather than erroring the whole request — so this call essentially always
succeeds with *something* useful, even without a working LLM key.

## Exports — `GET /api/reports/:slug/export?format=pdf|docx|rtf|html`

No auth required. Serves whatever was generated and stored at the end of the most recent probe
cycle (`persistClientReportArtifacts` in `runProbeCycle.ts`) — either a redirect to a Cloud Storage
URL or a local file stream, depending on how the backend is deployed. `ReportsTab.tsx` renders one
plain `<a>` per format; there's no client-side format conversion happening, this app just links to
the endpoint and lets the browser handle the download. If a client has never completed a probe
cycle, these links 404 with `{ error: "No stored ${format} report document found..." }` — expected
before the first run, not a bug.

## The public, backend-rendered report page

Separate from all of the above: `GET /report/:slug` (no `/api` prefix — mounted directly on the
Express app root, `renderReportHtmlHandler` in `reports.routes.ts`) serves a fully server-rendered
HTML report page, styled independently of this app. `ClientDetailPage.tsx` links out to it (the
"Public report" button in the header) rather than reimplementing it — it's meant to be shared with
someone who never logs into this console at all, and duplicating its rendering here would just be
two implementations to keep in sync. This app's dark "ink" color palette
(`src/index.css`) was deliberately matched to that page's own fallback-state styling so the two
don't feel like different products if someone bounces between them.
