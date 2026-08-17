# Routes Intentionally Not Wired Up

xsl-backend exposes a few routes this app deliberately doesn't call from the UI. Listed here so
it's clear these were left out on purpose, not missed.

## `POST /api/checkout/webhook`

Stripe calls this directly, server-to-server, authenticated by a `stripe-signature` header and
`STRIPE_WEBHOOK_SECRET` — a browser has no legitimate reason to ever call it, and couldn't produce
a valid signature if it tried. Nothing to build here.

## `POST /api/session/cache`, `GET /api/session/cache/:key`

A generic key/value cache backed by the `session_cache` table
(`xsl-backend/src/server/routes/session.routes.ts`). No auth, no ownership model, no defined
purpose from the route itself — it reads as internal plumbing for some other part of the system
(possibly the probe-engine standalone deploy mentioned in `xsl-backend/.env.example`, under
"Probe engine (standalone deploy)") rather than something an operator console should expose
directly. Wiring a generic cache read/write into a user-facing UI without knowing what it's for
risked doing more harm than good.

## `portal.routes.ts` — `GET /api/portal/me`, `POST /api/portal/clients/:slug/probe`, `GET /api/portal/clients/:slug`

These largely duplicate functionality this app already gets from `clients.routes.ts` and
`probe.routes.ts`:

- `GET /api/portal/me` ≈ `GET /api/auth/me` + filtering `GET /api/clients` by ownership.
- `POST /api/portal/clients/:slug/probe` ≈ `POST /api/probe/run`, same `runProbeCycleSSE()`
  under the hood, just with a narrower ownership check (`ownerUserId` only, no `ownerEmail` or
  public-showcase branch) and no disclaimer gate or daily-limit check.
- `GET /api/portal/clients/:slug` ≈ `GET /api/clients/:slug`, minus prompts/config.

Reading `portal.routes.ts`'s comments and the naming, this looks like an earlier or
narrower-scoped surface — possibly meant for a stripped-down client-facing portal separate from
this operator console — that the main `clients`/`probe` routes have since grown past (they now
handle everything `portal` does, plus ownership-by-email, public showcases, disclaimer gating, and
rate limiting that `portal.routes.ts` doesn't). This app standardizes on the more complete
`clients`/`probe` routes everywhere rather than using both, to avoid two different ownership models
in one UI. If a genuinely separate, more restricted client-facing portal is ever built as its own
product surface, `portal.routes.ts` is closer to what it'd want than the console routes.

There's also a second, distinct checkout endpoint mounted inside `portal.routes.ts` itself
(`POST /api/portal/checkout/create-session` — note the `/portal` prefix, so it doesn't collide
with the real `POST /api/checkout/create-session` in `checkout.routes.ts`), returning a
hard-coded mock response regardless of Stripe configuration. This app uses the real one
exclusively (see [docs/08-billing-and-plans.md](08-billing-and-plans.md)) — the portal variant
looks like an earlier stub that predates it.
