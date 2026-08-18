import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Globe2, Lock, Trash2 } from 'lucide-react'
import { api, ApiError } from '../../../lib/api'
import type { ClientSummary } from '../../../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'
import { ReminderCard } from '../../../components/ReminderCard'
import { useToast } from '../../../context/toast-context'

/**
 * PATCH /api/clients/:slug/visibility + DELETE /api/clients/:slug.
 * Both are owner-only (403 for anyone else, enforced server-side). Delete
 * is a soft-delete — see SubduedPage / docs/03-client-onboarding.md for the
 * 30-day recovery window.
 */
export default function SettingsTab({ client }: { client: ClientSummary }) {
  const toast = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [togglingVisibility, setTogglingVisibility] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!client.isOwner) {
    return <Alert tone="info">Only this client's owner or an administrator can change these settings.</Alert>
  }

  async function toggleVisibility() {
    setTogglingVisibility(true)
    setError(null)
    try {
      await api.patch(`/api/clients/${client.slug}/visibility`, { isPublic: !client.isPublic })
      toast.push(`Client is now ${!client.isPublic ? 'public' : 'private'}.`)
      queryClient.invalidateQueries({ queryKey: ['client', client.slug] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update visibility.')
    } finally {
      setTogglingVisibility(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await api.delete(`/api/clients/${client.slug}`)
      toast.push(`${client.name} moved to Subdued Entities.`)
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed.')
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
        </CardHeader>
        <CardBody className="flex items-center justify-between pt-3">
          <p className="text-sm text-ink-50">
            {client.isPublic
              ? 'Visible in the public case-study showcase. Non-owners cannot run probes.'
              : 'Private — only visible to you and administrators.'}
          </p>
          <Button variant="secondary" onClick={toggleVisibility} loading={togglingVisibility}>
            {client.isPublic ? <Lock className="size-3.5" /> : <Globe2 className="size-3.5" />}
            Make {client.isPublic ? 'private' : 'public'}
          </Button>
        </CardBody>
      </Card>

      <ReminderCard client={client} />

      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-300">Danger zone</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 pt-3">
          <p className="text-sm text-ink-50">
            Moves this client to Subdued Entities for 30 days before permanent deletion. Probe
            history is preserved and recoverable the whole time.
          </p>
          {!confirmingDelete ? (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete client
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="danger" onClick={handleDelete} loading={deleting}>
                Confirm delete
              </Button>
              <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
