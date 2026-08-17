import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { FullPageSpinner } from './ui/Spinner'

/**
 * Gate for routes that require a signed-in portal user. This mirrors the
 * backend's own `requireAuth` middleware (xsl-backend/src/server/middleware/
 * auth.middleware.ts) — the frontend redirect is a UX nicety, not the real
 * security boundary. Every mutating request still gets checked server-side
 * regardless of what this component decides.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner label="Checking session…" />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return <Outlet />
}
