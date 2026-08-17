# Marketing Pages (Pricing, FAQ, Comparison)

Frontend only. These are the public sales surfaces that turn "we built it" into "buy it."

Source: `src/lib/marketing.ts` (all copy + data), `src/components/marketing/*`
(`PricingSection`, `FaqSection`, `ComparisonTable`, `Differentiators`), `src/pages/ComparePage.tsx`,
plus new sections on `src/pages/HomePage.tsx`.

## One source of copy

Every marketing claim — FAQ answers, pricing, the comparison matrix, the four differentiators —
lives in **`src/lib/marketing.ts`**, so the homepage and `/compare` can never drift apart. Edit
the pitch there; both pages update.

The claims are grounded in the product docs and the company's own published blog copy
(`public/blog/how-spotlight-links-ai-audit-engine-works.md`): 30+ geo-targeted prompts, 3–5
samples per prompt across the answer engines, 300+ live calls per audit, 95% Wilson-score
confidence (a "99.4% confident" read), ~10-minute run, and the reporting/export surface from
[docs/05](05-reports-and-analytics.md).

## The $49 pricing story

The public pitch, per product direction: **$49/month → 2 managed assets, each audited up to 4×
a month.** Two businesses (or sites, or locations — a name plus a ZIP code), watched and
re-audited so the owner sees what's working, what isn't, and stays ahead as features ship. The
framing leans on "nothing here is free" — an audit really does fire 300+ paid model calls — to
justify the price rather than apologize for it. Higher tiers (Growth / Scale / Enterprise) appear
as a compact ladder beneath the flagship, the last unlocking done-for-you AEO content.

> **Heads-up on a mismatch to reconcile.** The authenticated `BillingPage` renders the *real*
> plan objects from the backend (`GET /api/checkout/plans`), where `starter_49` is described as
> **3 assets, probing-only** (see [docs/08](08-billing-and-plans.md)). The marketing copy here
> says **2 assets · 4 audits each**. That's a deliberate public framing, but the two should be
> reconciled before launch — either align the marketing numbers to the backend plan, or update the
> backend `PLANS` in `checkout.routes.ts` (which is out of scope for this frontend project) to
> match the pitch. The number lives in exactly one place on the frontend: `FLAGSHIP` in
> `src/lib/marketing.ts`.

## The comparison (`/compare`)

Positions Spotlight Links against the tools a buyer actually weighs it against: **Semrush**
(SEO suite + AI add-on), **SimilarWeb** (traffic/market intelligence), **HubSpot** (marketing
platform & CRM), and **Profound** (a pure-play enterprise answer-engine analytics tool, included
to show we know the AEO field, not just the incumbents).

Tone is deliberately **professional and fair**, not mocking: the page opens by granting that the
established platforms are excellent at what they were built for, then argues AEO/GEO is a new
discipline that needs a purpose-built tool. Competitor cells use ✓ / a "partial" dot with a short
qualifier (`Add-on`, `Limited`, `Keyword-based`) / — , and every price is hedged
(`from ~$139/mo`, `Custom / enterprise`) with a standing disclaimer
(`COMPARE_DISCLAIMER`) that the matrix reflects public positioning as of 2026 and that each tool
serves a different primary use case. This keeps it honest and defensible — no hard, falsifiable
claims about a competitor.

The four differentiators (`Differentiators`) carry the positioning: purpose-built for AI answers,
priced for real businesses ($49), local by default (ZIP-level), and measured not guessed
(Wilson-score confidence). The "New York, AI-native team" story is told in the comparison teaser
intro and the closing FAQ ("Who is behind Spotlight Links?").

## Where they render

- **Homepage** (`HomePage.tsx`): after the trust strip — `PricingSection` (`#pricing`), a
  comparison teaser (the four `Differentiators` + a "See the full comparison" link to `/compare`),
  then `FaqSection` (`#faq`), then the blog grid.
- **`/compare`** (`ComparePage.tsx`): hero → differentiators → full `ComparisonTable` → pricing →
  FAQ → closing CTA, wrapped in the shared `PublicHeader`/`PublicFooter`.

## Navigation and in-page anchors

Both public headers gained **Pricing / Compare / Blog** links (desktop). `/compare` is a plain
route. "Pricing" is an in-page anchor: on the homepage it's `#pricing`; from other pages it's a
`Link to="/#pricing"`. `HomePage`'s `useHashScroll` reads `location.hash` and smooth-scrolls to the
matching section id, and the marketing sections carry `scroll-mt-24` so the heading isn't hidden
under the header. The FAQ is a lightweight accordion (first item open); the comparison table
scrolls horizontally inside its own container on narrow screens so it never breaks the page.
