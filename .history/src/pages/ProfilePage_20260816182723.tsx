import { useState, type FormEvent } from 'react'
import { ShieldCheck } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../context/auth-context'
import { useToast } from '../context/toast-context'
import type { SafeUser } from '../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'

/**
 * PATCH /api/auth/profile, POST /api/auth/disclaimer,
 * POST /api/auth/change-password. See docs/02-authentication.md.
 */
export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const toast = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [savingName, setSavingName] = useState(false)

  const [acceptingDisclaimer, setAcceptingDisclaimer] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  if (!user) return null

  async function saveName(e: FormEvent) {
    e.preventDefault()
    setSavingName(true)
    try {
      const data = await api.patch<{ user: SafeUser }>('/api/auth/profile', { name })
      setUser(data.user)
      toast.push('Profile updated.')
    } catch (err) {
      toast.push(err instanceof ApiError ? err.message : 'Could not update profile.', 'error')
    } finally {
      setSavingName(false)
    }
  }

  async function acceptDisclaimer() {
    setAcceptingDisclaimer(true)
    try {
      const data = await api.post<{ user: SafeUser }>('/api/auth/disclaimer')
      setUser(data.user)
      toast.push('Disclaimer accepted.')
    } catch (err) {
      toast.push(err instanceof ApiError ? err.message : 'Could not record acceptance.', 'error')
    } finally {
      setAcceptingDisclaimer(false)
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    setPwError(null)
    setChangingPassword(true)
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword })
      toast.push('Password updated.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : 'Could not change password.')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-ink text-xl font-semibold">Profile</h1>
        <p className="text-ink-50 text-sm">{user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic info</CardTitle>
        </CardHeader>
        <CardBody className="pt-3">
          <form onSubmit={saveName} className="space-y-3">
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="text-ink-50 flex items-center gap-2 text-xs">
              <span>Plan:</span>
              <Badge tone="violet">{user.planTier}</Badge>
              <span>· {user.assetLimit >= 999999 ? 'Unlimited' : user.assetLimit} assets</span>
            </div>
            <Button type="submit" loading={savingName}>
              Save
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" /> Probing disclaimer
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 pt-3">
          {user.disclaimerAcceptedAt ? (
            <Alert tone="success">
              Accepted {new Date(user.disclaimerAcceptedAt).toLocaleString()}
            </Alert>
          ) : (
            <>
              <Alert tone="warning">
                You must accept the Spotlight Links LLC Generative Engine Audit Disclaimer before
                running probe cycles. You can also do this inline on the Probe tab of any client.
              </Alert>
              <Button onClick={acceptDisclaimer} loading={acceptingDisclaimer}>
                Accept disclaimer
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>

        <CardBody className="pt-3">
          <form onSubmit={changePassword} className="space-y-3">
            {pwError && <Alert tone="error">{pwError}</Alert>}

            <div>
              <Label htmlFor="currentPassword">Current password</Label>

              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="text-ink-50 hover:text-ink absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition"
                  aria-label={
                    showCurrentPassword ? 'Hide current password' : 'Show current password'
                  }
                >
                  {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword2">New password</Label>

              <div className="relative">
                <Input
                  id="newPassword2"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="text-ink-50 hover:text-ink absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="secondary" loading={changingPassword}>
              Update password
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
