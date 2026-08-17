# Architecture

## Two projects, one contract, zero shared code

```
xsl/
├── xsl-backend/     ← untouched. Express + Postgres (Neon) + Drizzle ORM.
└── xsl-frontend/     ← this app. Vite + React + TypeScript SPA.
```

`xsl-frontend` talks to `xsl-backend` over plain HTTP, from the browser, exactly the way any
third-party API consumer would. There is no shared package, no code generation step, and no build
dependency between the two directories in either direction. That's a constraint this project was
built under — **xsl-backend was off-limits to edit** — and it turned out to be a reasonable one
regardless: the backend already exposes a clean, cookie-authenticated JSON API with CORS
configured for exactly this frontend's dev server port.

The cost of that decoupling is that request/response shapes are duplicated by hand in
[`src/lib/types.ts`](../src/lib/types.ts) rather than inferred from the backend's Drizzle schema.
If a route in `xsl-backend/src/server/routes/*.routes.ts` changes its response shape, the matching
type here has to be updated by hand — there's no compiler catching that drift automatically. Each
doc in this set names the exact backend file the corresponding frontend code was read from, so
that update is a grep away.

## Request flow

```
Browser (xsl-frontend, :5173)
   │
   │  fetch(..., { credentials: 'include' })
   ▼
Express app (xsl-backend, :3000)
   │  CORS: allowedOrigins includes localhost:5173  (src/app.ts)
   │  authenticateUser middleware reads the `shaka_session` cookie,
   │  attaches req.user for every route to read              (auth.middleware.ts)
   ▼
Route handler → Drizzle ORM → Neon Postgres
   │
   ▼
JSON response (or, for one route, an open SSE stream)
```

Every request from this app sets `credentials: 'include'` (see [`src/lib/api.ts`](../src/lib/api.ts)
and [`src/lib/sse.ts`](../src/lib/sse.ts)) so the `shaka_session` HttpOnly cookie set at login rides
along automatically. There is no token stored in `localStorage` or attached by hand anywhere in
this codebase — see [docs/02-authentication.md](02-authentication.md) for why that's deliberate.

## Why a plain SPA, not Next.js

Covered in the top-level [README](../README.md#why-vite-not-nextjs) — the short version is that
[the probe endpoint](04-probe-engine.md) needs an open connection for 10+ minutes, and a Vite SPA
lets the browser hold that connection directly against xsl-backend with nothing in between that
could time it out.

## State layers

| What | How | Why |
|---|---|---|
| Server data (clients, reports, facts, assets) | TanStack Query | It's the backend's data, not the app's — cache invalidation on mutation (`queryClient.invalidateQueries`) beats hand-rolled refetch logic. |
| Session (who's logged in) | React Context (`auth-context.tsx`) | Read on every page via `useAuth()`; refreshed from `GET /api/auth/me` on load and after any auth mutation. |
| A running probe cycle | Local component state in `ProbeTab.tsx` | It's a single-screen, single-session concern (logs, progress, completion) that doesn't belong in a shared cache. |
| Toasts | React Context (`toast-context.tsx`) | Fire-and-forget UI feedback, no server round-trip. |

## Folder-to-feature map

| Backend route group | Frontend location | Doc |
|---|---|---|
| `xsl-backend/src/server/routes/auth.routes.ts` | `src/pages/auth/*`, `src/context/auth-context.tsx` | [02](02-authentication.md) |
| `xsl-backend/src/server/routes/clients.routes.ts` | `src/pages/DashboardPage.tsx`, `NewClientPage.tsx`, `SubduedPage.tsx`, `client/tabs/OverviewTab.tsx`, `SettingsTab.tsx` | [03](03-client-onboarding.md) |
| `xsl-backend/src/server/routes/probe.routes.ts` + `src/lib/runProbeCycle.ts` | `src/pages/client/tabs/ProbeTab.tsx`, `src/lib/sse.ts` | [04](04-probe-engine.md) |
| `xsl-backend/src/server/routes/reports.routes.ts` | `src/pages/client/tabs/ReportsTab.tsx` | [05](05-reports-and-analytics.md) |
| `xsl-backend/src/server/routes/facts.routes.ts` | `src/pages/client/tabs/FactsTab.tsx` | [06](06-facts-harvesting.md) |
| `xsl-backend/src/server/routes/assets.routes.ts` | `src/pages/client/tabs/AssetsTab.tsx` | [07](07-content-assets.md) |
| `xsl-backend/src/server/routes/checkout.routes.ts` | `src/pages/BillingPage.tsx` | [08](08-billing-and-plans.md) |
| `clients.routes.ts` media endpoints | `src/pages/client/tabs/MediaTab.tsx` | [09](09-media-vision-ai.md) |
| `session.routes.ts`, `portal.routes.ts`, the Stripe webhook | *(not wired up)* | [10](10-not-wired-up.md) |
