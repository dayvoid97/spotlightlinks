import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Sparkles, ShieldCheck } from 'lucide-react'
import { api, ApiError } from '../../../lib/api'
import type { ClientSummary, Fact } from '../../../lib/types'
import { Card, CardBody } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Alert } from '../../../components/ui/Alert'
import { FullPageSpinner } from '../../../components/ui/Spinner'
import { UpgradeGate } from '../../../components/UpgradeGate'
import { useAuth } from '../../../context/auth-context'
import { useToast } from '../../../context/toast-context'

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  confirmed: 'success',
  corroborated: 'info',
  candidate: 'warning',
  rejected: 'danger',
}

/**
 * POST /api/facts/harvest + GET /api/facts/:slug — see docs/06-facts-harvesting.md.
 *
 * Gated server-side to the Enterprise Suite plan ($599/mo): the backend
 * returns 403 UPGRADE_REQUIRED for anyone else, which is what
 * <UpgradeGate> below is reacting to. Every fact here carries the exact
 * URL it was pulled from — nothing is model-recalled — because these
 * facts are the only claims the asset writer (Assets tab) is allowed to
 * assert on the client's behalf.
 */
export default function FactsTab({ client }: { client: ClientSummary }) {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [harvesting, setHarvesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canHarvest = user?.role === 'admin' || user?.planTier === 'enterprise_599'

  const { data, isLoading } = useQuery({
    queryKey: ['client', client.slug, 'facts'],
    queryFn: () => api.get<{ facts: Fact[] }>(`/api/facts/${client.slug}`),
  })

  async function harvest() {
    setHarvesting(true)
    setError(null)
    try {
      const result = await api.post<{ harvest: { written: number; kept: number; proposed: number } }>(
        '/api/facts/harvest',
        { slug: client.slug }
      )
      toast.push(
        `Harvest complete — ${result.harvest.written} new fact(s) written (${result.harvest.kept}/${result.harvest.proposed} proposals survived verification).`
      )
      queryClient.invalidateQueries({ queryKey: ['client', client.slug, 'facts'] })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Harvest failed.')
    } finally {
      setHarvesting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">Verified fact ledger</h2>
          <p className="text-xs text-ink-50">Every fact carries a source URL — nothing here is model-recalled.</p>
        </div>
        {canHarvest ? (
          <Button onClick={harvest} loading={harvesting}>
            <Sparkles className="size-3.5" /> Harvest new facts
          </Button>
        ) : (
          <UpgradeGate feature="facts harvesting" />
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {isLoading ? (
        <FullPageSpinner />
      ) : (data?.facts?.length ?? 0) === 0 ? (
        <p className="rounded-2xl border border-dashed border-line py-16 text-center text-ink-50">
          No facts harvested yet.
        </p>
      ) : (
        <div className="space-y-2">
          {data?.facts.map((f) => (
            <Card key={f.id}>
              <CardBody className="flex flex-wrap items-start justify-between gap-3 pt-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-50">{f.key}</p>
                  <p className="text-sm text-ink">{f.value}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {f.sources.slice(0, 3).map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-cyan-400 hover:underline"
                      >
                        {s.domain}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge tone={statusTone[f.status] ?? 'neutral'}>{f.status}</Badge>
                  <span className="flex items-center gap-1 text-[10px] text-ink-50">
                    <ShieldCheck className="size-3" /> {f.tier}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
