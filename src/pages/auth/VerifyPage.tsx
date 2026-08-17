import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { useAuth } from '../../context/auth-context'
import { AuthLayout } from './AuthLayout'
import { Spinner } from '../../components/ui/Spinner'
import { Alert } from '../../components/ui/Alert'
import type { SafeUser } from '../../lib/types'

/**
 * GET /api/auth/verify?token=... — one endpoint, two possible outcomes,
 * because it's shared by two different token types (auth.routes.ts):
 *   - a magic-link token: consuming it logs the visitor in (sets the
 *     session cookie) and returns { user, token }.
 *   - an email-verification token: consuming it just flips `verified` on
 *     the account and returns { message } with no session change.
 * This page handles both without knowing in advance which one it got.
 */
export default function VerifyPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<'loading' | 'loggedIn' | 'verified' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setState('error')
      setMessage('Missing verification token.')
      return
    }
    api
      .get<{ success: boolean; message?: string; user?: SafeUser }>(
        `/api/auth/verify?token=${encodeURIComponent(token)}`
      )
      .then((data) => {
        if (data.user) {
          setUser(data.user)
          setState('loggedIn')
          setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
        } else {
          setState('verified')
          setMessage(data.message || 'Verified.')
        }
      })
      .catch((err) => {
        setState('error')
        setMessage(err instanceof ApiError ? err.message : 'This link is invalid or expired.')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <AuthLayout title="Verifying…">
      {state === 'loading' && (
        <div className="flex justify-center py-4">
          <Spinner className="size-6" />
        </div>
      )}
      {state === 'loggedIn' && <Alert tone="success">Signed in — taking you to the dashboard…</Alert>}
      {state === 'verified' && (
        <>
          <Alert tone="success">{message}</Alert>
          <Link to="/login" className="mt-4 block text-center text-sm text-brand hover:underline">
            Continue to sign in
          </Link>
        </>
      )}
      {state === 'error' && (
        <>
          <Alert tone="error">{message}</Alert>
          <Link to="/login" className="mt-4 block text-center text-sm text-brand hover:underline">
            Back to sign in
          </Link>
        </>
      )}
    </AuthLayout>
  )
}
