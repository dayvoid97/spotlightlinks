# Billing & Plans

Backend source: `xsl-backend/src/server/routes/checkout.routes.ts`.
Frontend: `src/pages/BillingPage.tsx`.

## The four plans

Defined server-side in `checkout.routes.ts` as the `PLANS` constant — this app never hard-codes
prices or limits, it always renders whatever `GET /api/checkout/plans` returns, so a price change
on the backend needs zero frontend changes to take effect.

| Plan | Price | Assets | Content generation |
|---|---|---|---|
| `starter_49` | $49/mo | 3 | No |
| `growth_199` | $199/mo | 10 | No |
| `scale_299` | $299/mo | Unlimited | No |
| `enterprise_599` | $599/mo | Unlimited | Yes — unlocks [Facts](06-facts-harvesting.md) & [Assets](07-content-assets.md) |

## Two different "upgrade" endpoints, on purpose

`BillingPage.tsx` puts both on every plan card, and they're not redundant:

### `POST /api/checkout/create-session` — the real flow

```ts
{ planTier: string, email?, password?, name?, company?, directUpgrade?: boolean }
→ { success: true, isMock: boolean, sessionId, checkoutUrl, user, token }
```

If `STRIPE_SECRET_KEY` is configured on the backend, this creates an actual Stripe Checkout
session in subscription mode and returns `session.url` — `BillingPage.tsx`'s **Upgrade** button
does `window.location.href = checkoutUrl`, handing off to Stripe's own hosted page entirely. If
Stripe isn't configured (or `directUpgrade: true` is passed), the backend transparently falls back
to a mock session and updates the plan immediately — this app never has to know in advance which
mode the backend is in; it just follows whatever `checkoutUrl` comes back.

This same endpoint doubles as **signup-with-checkout** for a brand-new visitor (pass `email` +
`password` and it registers the account first) — not used from this app's `BillingPage.tsx` since
by the time a signed-in user reaches Billing they already have an account, but worth knowing if you
build a "sign up directly onto a paid plan" landing flow elsewhere.

### `POST /api/checkout/mock-activate` — instant test activation

```ts
requireAuth, { planTier?: string } → { success: true, message: string, user: SafeUser }
```

No Stripe involved at all, ever — this just sets the plan directly on the authenticated user. Built
for development and demos. `BillingPage.tsx` exposes it as a small **"Instant test activation"**
ghost-button under the main Upgrade button on every non-current plan card, specifically so you can
try the Enterprise-gated [Facts](06-facts-harvesting.md)/[Assets](07-content-assets.md) tabs
without setting up Stripe at all.

## Confirming a real checkout — `GET /api/checkout/session-status`

```ts
?session_id=...&tier=... → { success: true, status: 'complete', planTier, assetLimit, user }
```

Stripe's hosted checkout redirects back to this app at
`${appBaseUrl}/?checkout_success=true&session_id={CHECKOUT_SESSION_ID}&tier=${plan.id}` — always
root (`checkout.routes.ts` hard-codes it), never `/billing`. That's a problem for this app
specifically: `/` is the [public homepage](11-homepage-and-blog.md), not `/billing`, so those
query params would otherwise land somewhere that never reads them.

`HomePage.tsx`'s `useCheckoutRedirect()` hook exists to fix exactly this: on mount, if
`checkout_success` or `checkout_canceled` is present in the URL, it immediately forwards to
`/billing` with the same query string intact (`navigate(`/billing?${params}`, { replace: true })`).
`BillingPage.tsx` still owns the actual confirmation logic from there — it reads those same params
via `useSearchParams()` and calls `session-status` itself. Worth knowing either way: the plan
upgrade itself already happened server-side by the time any of this runs (via the webhook or the
session-status call), so this redirect is purely about landing the confirmation *banner* somewhere
that shows it — not about applying the upgrade, which doesn't depend on where the browser ends up.

`BillingPage.tsx`'s `useEffect` fires this call automatically whenever `checkout_success=true` is
present in the URL, shows a success alert, calls `refresh()` on the auth context so the new
`planTier` shows up immediately, and then strips those query params back out of the URL.

## Webhook — not called from this app, and shouldn't be

`POST /api/checkout/webhook` is Stripe calling xsl-backend directly, server-to-server, verified by
`stripe-signature` header against `STRIPE_WEBHOOK_SECRET`. There is nothing for a browser to do
here — see [docs/10-not-wired-up.md](10-not-wired-up.md).
