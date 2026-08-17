# Authentication

Backend source: `xsl-backend/src/server/routes/auth.routes.ts`,
`xsl-backend/src/server/services/auth.service.ts`,
`xsl-backend/src/server/middleware/auth.middleware.ts`.

Frontend: `src/context/auth-context.tsx`, `src/pages/auth/*`, `src/pages/ProfilePage.tsx`.

## The session model

xsl-backend uses **opaque, database-backed sessions**, not JWTs. On login or signup it:

1. Creates a row in the `sessions` table with a hashed token and an expiry.
2. Sets an HttpOnly cookie named `shaka_session` containing the raw token
   (`SESSION_COOKIE` constant in `auth.service.ts`).

Every subsequent request's `authenticateUser` middleware (mounted globally in `app.ts`, before any
route) reads that cookie, looks up the session, and attaches the user to `req.user` — or leaves it
`null` if there's no valid session. Nothing about this app reads or writes that cookie directly;
it relies entirely on the browser doing so, which is why **every single fetch in this codebase
sets `credentials: 'include'`** (see `src/lib/api.ts` and `src/lib/sse.ts`). Drop that option
anywhere and that one call silently becomes unauthenticated.

Because the cookie is HttpOnly, this app cannot read the session token itself even if it wanted
to — there is no token in `localStorage`, no token in a Redux/Zustand store, nothing to leak via
XSS. The backend does also return the raw token in the JSON body of login/signup responses (for
non-browser API consumers), but `auth-context.tsx` never stores it; it only stores the `user`
object.

## `useAuth()`

`src/context/auth-context.tsx` wraps the whole app (`main.tsx`) and exposes:

```ts
const { user, loading, login, signup, logout, refresh, setUser } = useAuth()
```

On mount, it calls `GET /api/auth/me`, which **never itself returns 401** — it just answers
`{ user: null }` for an unauthenticated visitor (see `auth.routes.ts`). That's what makes `loading`
a clean "have we asked the backend yet" flag rather than something that needs to distinguish
"logged out" from "still checking."

`<ProtectedRoute>` (`src/components/ProtectedRoute.tsx`) reads `user`/`loading` from this context
and redirects to `/login` when there's no session — but this is a UX nicety only. The real
authorization boundary is server-side `requireAuth` middleware on each mutating route; this
frontend redirect just avoids showing a form that would 401 on submit.

## Routes

### `POST /api/auth/signup`

```ts
// request
{ email: string, password: string, name?: string, company?: string, planTier?: string, assetLimit?: number }
// response (201)
{ success: true, user: SafeUser, token: string }
```
Sets `shaka_session`. Used by `SignupPage.tsx`. New accounts default to `planTier: 'none'`,
`assetLimit: 3` unless overridden (the checkout flow overrides these — see
[docs/08-billing-and-plans.md](08-billing-and-plans.md)).

### `POST /api/auth/login`

```ts
{ email: string, password: string } → { success: true, user: SafeUser, token: string }
```
Used by `LoginPage.tsx`. 401 with `{ error }` on bad credentials.

### `POST /api/auth/logout`

No body. Destroys the server-side session row and clears the cookie. Used by the sign-out button
in `Layout.tsx`.

### `GET /api/auth/me`

`{ user: SafeUser | null }`. Called once per page load by `auth-context.tsx`, and again after any
auth mutation via `refresh()`.

### `PATCH /api/auth/profile`

```ts
{ name?: string } → { success: true, user: SafeUser }
```
`requireAuth`. Used by `ProfilePage.tsx`'s "Basic info" form. Only `name` is editable through this
endpoint today — email changes aren't exposed by the backend.

### `POST /api/auth/disclaimer`

No body, `requireAuth`. Stamps `disclaimerAcceptedAt` on the current user. Two places call this:
`ProfilePage.tsx` directly, and implicitly via `POST /api/probe/run`'s own `acceptDisclaimer: true`
flag the first time a probe is run — see [docs/04-probe-engine.md](04-probe-engine.md).

### `POST /api/auth/forgot-password`

```ts
{ email: string } → { success: true, message: string }
```
**Always** returns success, whether or not the email exists — this is intentional (see the route
comment in `auth.routes.ts`) to avoid leaking which emails have accounts. `ForgotPasswordPage.tsx`
shows the same "check your inbox" message regardless.

### `POST /api/auth/reset-password`

```ts
{ token: string, newPassword: string } → { success: true, message: string }
```
`token` comes from the query string of the emailed reset link
(`/reset-password?token=...`), read in `ResetPasswordPage.tsx` via `useSearchParams()`.

### `POST /api/auth/change-password`

```ts
{ currentPassword: string, newPassword: string } → { success: true, message: string }
```
`requireAuth`. Used by `ProfilePage.tsx`.

### `POST /api/auth/magic-link`

```ts
{ email: string } → { success: true, message: string }
```
Passwordless entry — `findOrCreateUser` under the hood, so this can create a brand-new account
just by requesting a link for an email that doesn't exist yet. `MagicLinkPage.tsx`.

### `GET /api/auth/verify?token=...`

One endpoint, two outcomes depending on what kind of token was consumed (`auth.routes.ts` tries a
login-token consume first, then falls back to an email-verification consume):

```ts
// magic-link token → logs the visitor in
{ success: true, user: SafeUser, token: string }
// email-verification token → just flips `verified`, no session change
{ success: true, message: string }
```

`VerifyPage.tsx` handles both shapes from a single request — see the component for the branching
logic.

One wrinkle worth knowing about: `sendMagicLinkEmail()` on the backend builds its link as
`${appBaseUrl}/portal/verify?token=...` (`auth.routes.ts`), not `/verify`. Rather than ask the
backend to change a URL it hands out in emails, `App.tsx` mounts the same `<VerifyPage>` at
**both** `/verify` and `/portal/verify` — so a real magic-link email lands correctly no matter
which path it used. If you add other backend-generated links later, check what path they actually
build before assuming this app's route names.

Separately, `appBaseUrl` itself — the `PUBLIC_URL`/`FRONTEND_URL` env var on the backend, or the
request's `Origin` header at signup time — needs to actually point at wherever this app is
running for the emailed link to resolve at all. `.env.example` in `xsl-backend` covers this under
"Server".
