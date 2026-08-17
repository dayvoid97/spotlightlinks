import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { ApiError } from '../../lib/api'
import { AuthLayout } from './AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input, Label } from '../../components/ui/Input'
import { Alert } from '../../components/ui/Alert'

/** POST /api/auth/login — see docs/02-authentication.md for the full contract. */
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in to Spotlight Links"
      subtitle="Spotlight Links Probe Console and User Management Dashboard"
      footer={
        <>
          No account?{' '}
          <Link to="/signup" className="text-brand hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-ink-50 hover:text-brand mb-1.5 text-xs">
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
      <div className="my-4 flex items-center gap-3">
        <div className="bg-line h-px flex-1" />
        <span className="text-ink-30 text-[11px] uppercase tracking-wide">or</span>
        <div className="bg-line h-px flex-1" />
      </div>
      <Link to="/magic-link">
        <Button type="button" variant="secondary" className="w-full">
          Email me a magic link
        </Button>
      </Link>
    </AuthLayout>
  )
}
