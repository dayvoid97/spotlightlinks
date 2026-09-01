import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Hammer, CheckCircle2 } from 'lucide-react'
import { api, ApiError } from '../../../lib/api'
import type { AssetItem, ClientSummary } from '../../../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Badge } from '../../../components/ui/Badge'
import { Alert } from '../../../components/ui/Alert'
import { FullPageSpinner } from '../../../components/ui/Spinner'
import { UpgradeGate } from '../../../components/UpgradeGate'
import { useAuth } from '../../../context/auth-context'
import { useToast } from '../../../context/toast-context'

const statusTone: Record<string, 'success' | 'warning' | 'neutral' | 'violet'> = {
  draft: 'neutral',
  approved: 'warning',
  published: 'success',
  retired: 'neutral',
}

/**
 * POST /api/assets/build + GET /api/assets/:slug + POST /api/assets/approve.
 * See docs/07-content-assets.md.
 *
 * Build reads the client's fact ledger (Facts tab) and a strategy plan,
 * then writes production copy — schema markup, FAQ briefs, citation
 * packets — that only ever asserts what a fact backs. Also gated to the
 * Enterprise Suite plan. Approve is a two-step publish: this app supplies
 * the live URL once the asset actually ships, and the backend timestamps
 * `publishedAt`.
 */
export default function AssetsTab({ client }: { client: ClientSummary }) {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [building, setBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [liveUrlDrafts, setLiveUrlDrafts] = useState<Record<string, string>>({})

  const canBuild = user?.role === 'admin' || user?.planTier === 'enterprise_599'

  const { data, isLoading } = useQuery({
    queryKey: ['client', client.slug, 'assets'],
    queryFn: () => api.get<{ assets: AssetItem[] }>(`/api/assets/${client.slug}`),
  })

  async function build() {
    setBuilding(true)
    setError(null)
    try {
      await api.post('/api/assets/build', { slug: client.slug })
      toast.push('Content assets built.')
      queryClient.invalidateQueries({ queryKey: ['client', client.slug, 'assets'] })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Build failed.')
    } finally {
      setBuilding(false)
    }
  }

  async function approve(assetId: string) {
    const liveUrl = liveUrlDrafts[assetId]
    if (!liveUrl) return
    setPublishingId(assetId)
    try {
      await api.post('/api/assets/approve', { assetId, liveUrl })
      toast.push('Asset approved and marked live.')
      queryClient.invalidateQueries({ queryKey: ['client', client.slug, 'assets'] })
    } catch (err) {
      toast.push(err instanceof ApiError ? err.message : 'Approve failed.', 'error')
    } finally {
      setPublishingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">GEO content assets</h2>
          <p className="text-xs text-ink-50">Schema markup, FAQ briefs, and citation packets built from verified facts.</p>
        </div>
        {canBuild ? (
          <Button onClick={build} loading={building}>
            <Hammer className="size-3.5" /> Build assets
          </Button>
        ) : (
          <UpgradeGate feature="content asset generation" />
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {isLoading ? (
        <FullPageSpinner />
      ) : (data?.assets?.length ?? 0) === 0 ? (
        <p className="rounded-2xl border border-dashed border-line py-16 text-center text-ink-50">
          No assets built yet.
        </p>
      ) : (
        <div className="space-y-3">
          {data?.assets.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex items-start justify-between">
                <div>
                  <CardTitle>{a.title}</CardTitle>
                  <p className="text-xs text-ink-50">
                    {a.kind} · v{a.version} · {a.format}
                  </p>
                </div>
                <Badge tone={statusTone[a.status] ?? 'neutral'}>{a.status}</Badge>
              </CardHeader>
              <CardBody className="space-y-3 pt-3">
                <pre className="thin-scroll max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-[11px] text-ink-50">
                  {a.body.slice(0, 800)}
                  {a.body.length > 800 ? '…' : ''}
                </pre>
                {a.status !== 'published' && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://client-site.com/live-page"
                      value={liveUrlDrafts[a.id] ?? ''}
                      onChange={(e) => setLiveUrlDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={publishingId === a.id}
                      disabled={!liveUrlDrafts[a.id]}
                      onClick={() => approve(a.id)}
                    >
                      <CheckCircle2 className="size-3.5" /> Approve
                    </Button>
                  </div>
                )}
                {a.publishedUrl && (
                  <a href={a.publishedUrl} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline">
                    {a.publishedUrl}
                  </a>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
