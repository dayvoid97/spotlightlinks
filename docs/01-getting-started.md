# Getting Started

This walks through running the console against a local `xsl-backend`, from nothing to a probed
client.

## 1. Get xsl-backend running first

This app has nothing to talk to without it. From `xsl-backend/`, following its own README /
`.env.example`:

1. A Postgres `DATABASE_URL` (Neon, Supabase, or local Postgres all work).
2. At least one AI engine key — `PERPLEXITY_API_KEY`, `GOOGLE_API_KEY`, or `ANTHROPIC_API_KEY`.
   Engines without a key are skipped, not failed, but you need at least one to run a probe.
3. `npm install && npm run db:migrate && npm run dev`

Confirm it's up:

```bash
curl http://localhost:3000/health
# { "status": "ok", "timestamp": "..." }
```

xsl-backend already whitelists `http://localhost:5173` and `http://localhost:3000` in its CORS
config (`xsl-backend/src/app.ts`), so nothing needs to change there for this frontend to reach it.

## 2. Configure and run xsl-frontend

```bash
cd xsl-frontend
cp .env.example .env
```

`.env` needs exactly one variable:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Point it at wherever xsl-backend actually listens — if its `PORT` env var is different, or you're
running it remotely, change this to match.

```bash
npm install
npm run dev
```

Vite will print a local URL, normally `http://localhost:5173`. Open it — you should land on the
public homepage (see [docs/11-homepage-and-blog.md](11-homepage-and-blog.md)). Its one button reads
**"Sign Up or Log In"** while you're signed out; follow it to `/login`.

> This app never starts, stops, or restarts its own dev server as a side effect of anything else
> — you run `npm run dev` yourself, in a terminal you control, the same as any other project.

## 3. Create an account

There's no seeded admin user — sign up like any other visitor would, from `/signup`. The first
account created is a normal `user`-role account on the free plan (3 managed assets, probing only,
no content generation). See [docs/02-authentication.md](02-authentication.md) for the full
signup contract, and [docs/08-billing-and-plans.md](08-billing-and-plans.md) for how to unlock
higher tiers instantly in test mode without a real card.

## 4. Onboard a client

Once signed in you're on `/dashboard` — the homepage's CTA now reads "Go to Dashboard" if you
ever navigate back to `/`. From the dashboard, **New client**. Either fill in the fields directly, or paste a paragraph
about the business into the "Synthesize from a story" box and let the backend's LLM extract
structured fields for you first. Full contract in
[docs/03-client-onboarding.md](03-client-onboarding.md).

## 5. Accept the disclaimer and run a probe

The first probe run on any client prompts you to accept the Spotlight Links LLC Generative Engine
Audit Disclaimer — every probe run spends real API budget against real AI engines, so the backend
requires an explicit, once-per-account acknowledgment before it will run one. From the client's
**Probe** tab: pick engines (default: all configured ones), optionally set a run count and prompt
limit, then **Run probe cycle**.

**Keep the tab open.** A full cycle is prompts × locales × engines × runs-per-prompt, each a real
network call to an external AI provider — this routinely takes 10+ minutes. The live console
streams progress and per-engine log lines the whole time; see
[docs/04-probe-engine.md](04-probe-engine.md) for exactly how that connection stays open that
long without timing out.

## 6. Read the results

Once a cycle completes, the **Reports** tab has mention rate, citation rate, per-engine and
per-locale breakdowns, a competitor leaderboard, and the full prompt-by-prompt keyword matrix.
Generate a SWOT analysis on demand, and export the report as PDF/DOCX/RTF/HTML. Details in
[docs/05-reports-and-analytics.md](05-reports-and-analytics.md).

## Troubleshooting

**"Could not load clients" / network errors on every page.** xsl-backend isn't running, or
`VITE_API_BASE_URL` doesn't match where it's actually listening. Check `curl $VITE_API_BASE_URL/health`.

**Signed in, but every mutating action 401s.** The `shaka_session` cookie isn't being sent —
usually means `VITE_API_BASE_URL` points at a different host/port than what's in xsl-backend's
own CORS `allowedOrigins`, or you're testing across two different origins that browsers treat as
cross-site in a way that blocks the cookie. Match the ports exactly to what's documented in
xsl-backend's `.env.example`.

**Probe run immediately errors with `DISCLAIMER_REQUIRED`.** Check the box in the Probe tab before
running, or accept it once from the Profile page — see step 5 above.

**`429 DAILY_PROBE_LIMIT_EXCEEDED`.** xsl-backend caps full probe cycles at 2 per client per
rolling 24 hours to control API spend. Selecting fewer than all 3 engines counts as a "targeted
re-probe" instead and doesn't consume that quota — see
[docs/04-probe-engine.md](04-probe-engine.md#rate-limiting).
