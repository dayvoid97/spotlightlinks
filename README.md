# Quasar Probe — Operator Console

A modern, TypeScript, single-page frontend for **xsl-backend** (the Quasar Probe API — an
AI-search-visibility auditing service). This app is the operator console: sign in, onboard a
client, run an AI-engine probe cycle, watch it stream live, and read the resulting visibility
report — all against the existing Express/Postgres backend, unmodified.

> **Scope note.** This project only ever reads from and calls `xsl-backend`. Nothing under
> `xsl-backend/` was touched to build it — see [docs/00-architecture.md](docs/00-architecture.md)
> for how the two stay decoupled.

## Why Vite, not Next.js

The single feature this app is built around — [`POST /api/probe/run`](docs/04-probe-engine.md) —
is a request that can legitimately stay open for **10+ minutes**, streaming Server-Sent Events
the whole time while xsl-backend calls out to three different AI engines across every prompt and
locale in a client's question set.

That requirement ruled out Next.js for this project specifically:

- A Next.js **API route** proxying that request would inherit whatever timeout its host enforces
  (Vercel serverless functions cap out well under 10 minutes on most plans). There's no reason to
  introduce that ceiling when nothing needs a server-rendering layer here.
- This console has no SEO surface, no content that benefits from server rendering, and no
  server-only secrets to hide — every route it calls is already meant to be called from a browser
  (xsl-backend's own CORS config whitelists `localhost:5173` and `localhost:3000` explicitly).
- A plain Vite SPA lets the browser hold the long-lived `fetch` stream **directly** against
  xsl-backend, with nothing in between that could time it out. See
  [src/lib/sse.ts](src/lib/sse.ts) for exactly how that stream is read.

Vite also just starts and rebuilds faster for a project this size, which matters more than usual
here since the whole point is fast iteration against a backend that's already built.

## Stack

- **Vite 6 + React 19 + TypeScript** — strict mode, `noUnusedLocals`/`noUnusedParameters` on.
- **React Router 7** — client-side routing, one protected-route gate.
- **TanStack Query 5** — server state (client lists, reports, facts, assets); nothing is
  hand-rolled with `useEffect` + `useState` for data that the backend owns.
- **Tailwind CSS 4** — via `@tailwindcss/vite`, no PostCSS config file needed.
- **A hand-written `fetch` SSE reader** — see [docs/04-probe-engine.md](docs/04-probe-engine.md)
  for why `EventSource` doesn't work for this specific endpoint.

No component library. The UI primitives in `src/components/ui/` are small and specific to this
app's dark, "probe console" aesthetic — deliberately not a design-system dependency for an app
this size.

## Getting started

See [docs/01-getting-started.md](docs/01-getting-started.md) for the full walkthrough. Short
version:

```bash
cd xsl-frontend
cp .env.example .env      # points at http://localhost:3000 by default
npm install
npm run dev                # you run this yourself — see note below
```

xsl-backend must already be running (`npm run dev` inside `xsl-backend/`, from its own README)
with at least one AI engine key configured, or there will be nothing to probe.

> **Note:** this app doesn't start its own dev server for you as part of any automated setup —
> run `npm run dev` yourself from a terminal you control, the same way you'd run any other Vite
> project.

## Project layout

```
xsl-frontend/
├── docs/                    # this doc set — one file per backend feature area
├── public/
│   ├── 679.png              # hero art on the public homepage
│   ├── blogcopy/            # local copies of spotlightlinks.com/blogsets/:slug posts
│   └── mediasets/           # local copies of a few post images
├── src/
│   ├── lib/
│   │   ├── api.ts           # fetch wrapper — cookie auth, typed errors
│   │   ├── sse.ts           # POST-based SSE reader for probe runs
│   │   ├── blog.ts          # frontmatter parser for public/blogcopy/*.md
│   │   └── types.ts         # hand-written types mirroring xsl-backend's schema
│   ├── context/
│   │   ├── auth-context.tsx # session state (GET /api/auth/me on load)
│   │   └── toast-context.tsx
│   ├── components/          # shared UI: layout, nav, cards, ui/ primitives
│   └── pages/
│       ├── HomePage.tsx     # public landing page, "/" — see docs/11
│       ├── auth/            # login, signup, forgot/reset password, magic link, verify
│       ├── client/tabs/     # the 7 tabs on a client's detail page
│       └── *.tsx            # dashboard ("/dashboard"), new client, subdued, billing, profile
```

## Documentation set

Each doc below covers one functional area: which `xsl-backend` route(s) it calls, the exact
request/response shape, and where in this app that shows up. Written as the setup/how-to guide
for that feature — read [docs/00-architecture.md](docs/00-architecture.md) first, then whichever
feature doc is relevant.

1. [Architecture](docs/00-architecture.md)
2. [Getting started](docs/01-getting-started.md)
3. [Authentication](docs/02-authentication.md)
4. [Client onboarding](docs/03-client-onboarding.md)
5. [The probe engine (SSE)](docs/04-probe-engine.md)
6. [Reports & analytics](docs/05-reports-and-analytics.md)
7. [Facts harvesting](docs/06-facts-harvesting.md)
8. [Content assets](docs/07-content-assets.md)
9. [Billing & plans](docs/08-billing-and-plans.md)
10. [Media & Vision AI](docs/09-media-vision-ai.md)
11. [Routes intentionally not wired up](docs/10-not-wired-up.md)
12. [Homepage & blog section](docs/11-homepage-and-blog.md)
13. [Theming (light / dark / system)](docs/12-theming.md)

## Verifying changes

```bash
npx tsc -b        # typecheck — noUnusedLocals/noUnusedParameters are on
npm run build     # typecheck + production bundle
```

`npm run lint` (oxlint) needs Node `^20.19.0 || >=22.12.0`; on older Node 20.x it fails to load
its native binding (a known npm optional-dependency bug, see the error message it prints for the
tracking issue). It's not required for `build` or `dev` — only fix it if you're actually going to
use it, by bumping your local Node version.
