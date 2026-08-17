import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import type { SubduedClient } from '../lib/types'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { FullPageSpinner } from '../components/ui/Spinner'
import { Alert } from '../components/ui/Alert'
import { useToast } from '../context/toast-context'

/**
 * GET /api/clients/subdued + POST /api/clients/:slug/recover.
 *
 * Deleting a client (DELETE /api/clients/:slug, wired up in the client
 * detail page's Settings tab) is a soft-delete: xsl-backend sets
 * `deletedAt` and a 30-day `subduedUntil` window rather than dropping the
 * row, so probe history is never actually destroyed. This page is the
 * only way to see or reverse that.
 */
export default function SubduedPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [recoveringSlug, setRecoveringSlug] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', 'subdued'],
    queryFn: () => api.get<{ subdued: SubduedClient[] }>('/api/clients/subdued'),
  })

  async function recover(slug: string) {
    setRecoveringSlug(slug)
    try {
      await api.post(`/api/clients/${slug}/recover`)
      toast.push('Client recovered to your active portfolio.')
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    } catch (err) {
      toast.push(err instanceof ApiError ? err.message : 'Could not recover client.', 'error')
    } finally {
      setRecoveringSlug(null)
    }
  }

  if (isLoading) return <FullPageSpinner label="Loading subdued entities…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink flex items-center gap-2 text-xl font-semibold">
          <Trash2 className="text-ink-50 size-5" /> Subdued entities
        </h1>
        <p className="text-ink-50 text-sm">
          Deleted clients wait here for 30 days before permanent removal — recover them anytime
          before then.
        </p>
      </div>

      {error && <Alert tone="error">Could not load subdued clients.</Alert>}

      {data?.subdued?.length === 0 && (
        <p className="border-line text-ink-50 rounded-2xl border border-dashed py-16 text-center">
          Nothing here. Deleted clients will show up in this list.
        </p>
      )}

      <div className="space-y-3">
        {data?.subdued?.map((c) => (
          <Card key={c.id}>
            <CardBody className="flex flex-wrap items-center justify-between gap-3 pt-5">
              <div>
                <p className="text-ink text-sm font-semibold">{c.name}</p>
                <p className="text-ink-50 text-xs">{c.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={c.daysRemaining <= 5 ? 'danger' : 'warning'}>
                  {c.daysRemaining} day{c.daysRemaining === 1 ? '' : 's'} left
                </Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!c.canRecover}
                  loading={recoveringSlug === c.slug}
                  onClick={() => recover(c.slug)}
                >
                  <RotateCcw className="size-3.5" /> Recover
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
