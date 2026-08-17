/**
 * Thin fetch wrapper around xsl-backend's Express API.
 *
 * Auth model: xsl-backend/src/server/services/auth.service.ts issues an
 * HttpOnly `shaka_session` cookie on login/signup (see SESSION_COOKIE there).
 * `credentials: 'include'` on every request is what makes that cookie ride
 * along automatically — there is no token to store or attach by hand. The
 * backend's CORS config (xsl-backend/src/app.ts) already sets
 * `credentials: true` and whitelists http://localhost:5173, so this works
 * out of the box against a locally running backend.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3000'

export class ApiError extends Error {
  status: number
  code?: string
  body?: unknown

  constructor(message: string, status: number, code?: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.body = body
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

/**
 * Every non-2xx response from xsl-backend is JSON shaped like
 * `{ error: string, code?: string }` (see error.middleware.ts and the
 * per-route catch blocks) — this normalizes that into a thrown ApiError so
 * callers can branch on `.code` (e.g. 'UPGRADE_REQUIRED', 'ASSET_LIMIT_EXCEEDED').
 */
async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: opts.method || 'GET',
    credentials: 'include',
    signal: opts.signal,
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const message = (data && (data as any).error) || res.statusText || 'Request failed'
    throw new ApiError(message, res.status, data && (data as any).code, data)
  }

  return data as T
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'POST', body, signal }),
  patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'PATCH', body, signal }),
  put: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'PUT', body, signal }),
  delete: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'DELETE', signal }),
}
