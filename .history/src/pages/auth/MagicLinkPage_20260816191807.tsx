import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { AuthLayout } from './AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input, Label } from '../../components/ui/Input'
import { Alert } from '../../components/ui/Alert'

/**
 * POST /api/auth/magic-link — passwordless entry. The backend finds-or-creates
 * a user by email (findOrCreateUser) and emails a one-time link to
 * /portal/verify?token=... which this app's VerifyPage handles.
 */
export default function MagicLinkPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/api/auth/magic-link', { email })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in with a magic link"
      subtitle="No password needed"
      footer={
        <Link to="/login" className="text-brand hover:underline">
          Use a password instead
        </Link>
      }
    >
      {sent ? (
        <Alert tone="success" title="Magic Link Successfully Sent. support@spotlightlinks.com">
          Check {email} for a sign-in link. It's valid for a limited time and can only be used once.
          Make sure you also check in the junk folder for email from support@spotlightlinks.com
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Send magic link
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
