import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Sparkles, TrendingUp, ChevronDown } from 'lucide-react'
import { api, ApiError, API_BASE_URL } from '../../../lib/api'
import type { ClientSummary, ReportData, SwotResult } from '../../../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Alert } from '../../../components/ui/Alert'
import { FullPageSpinner } from '../../../components/ui/Spinner'
import { useToast } from '../../../context/toast-context'

/**
 * GET /api/reports/:slug — the analytics rollup computed from every scored
 * probe_runs × detections join for this client (mention rate, citation
 * rate, per-engine/per-locale breakdowns, competitor leaderboard, source
 * domains, and the full prompt-by-prompt keyword matrix). See
 * docs/05-reports-and-analytics.md.
 *
 * SWOT generation (POST /api/reports/:slug/swot) is a separate, on-demand
 * call — it's not run automatically because it's an extra LLM call every
 * time, and a plain metrics view is useful without paying for it.
 */
export default function ReportsTab({ client }: { client: ClientSummary }) {
  const toast = useToast()
  const [swot, setSwot] = useState<SwotResult | null>(null)
  const [swotLoading, setSwotLoading] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['client', client.slug, 'report'],
    queryFn: () => api.get<ReportData>(`/api/reports/${client.slug}`),
  })

  async function generateSwot() {
    setSwotLoading(true)
    try {
      const result = await api.post<{ swot: SwotResult }>(`/api/reports/${client.slug}/swot`)
      setSwot(result.swot)
    } catch (err) {
      toast.push(err instanceof ApiError ? err.message : 'SWOT generation failed.', 'error')
    } finally {
      setSwotLoading(false)
    }
  }

  if (isLoading) return <FullPageSpinner label="Loading analytics…" />
  if (error || !data) return <Alert tone="error">No report data yet. Run a probe cycle first.</Alert>
  if (data.metrics.totalRuns === 0) {
    return (
      <Alert tone="info" title="No scored runs yet">
        Run a probe cycle from the Probe tab to populate visibility analytics.
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Mention rate" value={`${data.metrics.mentionRate}%`} />
        <MetricCard label="Citation rate" value={`${data.metrics.citationRate}%`} />
        <MetricCard label="Rank #1" value={String(data.metrics.rankOneCount)} />
        <MetricCard label="Total runs" value={String(data.metrics.totalRuns)} />
      </div>

      {data.aiSummary && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{data.aiSummary.headline}</CardTitle>
            <Badge tone="violet">{data.aiSummary.statusBadge}</Badge>
          </CardHeader>
          <CardBody className="space-y-3 pt-3">
            <p className="text-sm text-ink-70">{data.aiSummary.executiveSummary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-50">Takeaways</p>
                <ul className="space-y-1 text-sm text-ink-50">
                  {data.aiSummary.takeaways.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-50">Recommended actions</p>
                <ul className="space-y-1 text-sm text-ink-50">
                  {data.aiSummary.recommendedActions.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-brand" /> Strategic SWOT
          </CardTitle>
          {!swot && (
            <Button size="sm" variant="secondary" onClick={generateSwot} loading={swotLoading}>
              Generate
            </Button>
          )}
        </CardHeader>
        {swot && (
          <CardBody className="grid gap-3 pt-3 sm:grid-cols-2">
            <SwotBlock title="Strengths" tone="success" items={swot.strengths} />
            <SwotBlock title="Weaknesses" tone="warning" items={swot.weaknesses} />
            <SwotBlock title="Opportunities" tone="info" items={swot.opportunities} />
            <SwotBlock title="Threats" tone="danger" items={swot.threats} />
            <p className="sm:col-span-2 rounded-lg bg-surface-2/60 p-3 text-sm text-ink-70">
              {swot.strategicVerdict}
            </p>
          </CardBody>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5" /> Engine performance
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 pt-3">
            {Object.entries(data.engineStats).map(([engine, s]) => (
              <div key={engine} className="flex items-center justify-between text-sm">
                <span className="capitalize text-ink-70">{engine}</span>
                <span className="text-ink-50">
                  {s.mentioned}/{s.total} mentioned · {s.cited} cited
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competitor leaderboard</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 pt-3">
            {data.competitorsLeaderboard.length === 0 && (
              <p className="text-sm text-ink-50">No competitors surfaced yet.</p>
            )}
            {data.competitorsLeaderboard.slice(0, 8).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span className="text-ink-70">{c.name}</span>
                <Badge tone="neutral">{c.count}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top cited sources</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-2 pt-3">
          {data.topSources.map((s) => (
            <Badge key={s.domain} tone="info">
              {s.domain} · {s.count}
            </Badge>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyword intelligence matrix ({data.keywordMatrix.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2 pt-3">
          {data.keywordMatrix.map((row) => (
            <KeywordRow key={row.promptId} row={row} />
          ))}
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(['pdf', 'docx', 'rtf', 'html'] as const).map((fmt) => (
          <a
            key={fmt}
            href={`${API_BASE_URL}/api/reports/${client.slug}/export?format=${fmt}`}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm text-ink-70 hover:bg-surface-2"
          >
            <Download className="size-3.5" /> {fmt.toUpperCase()}
          </a>
        ))}
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody className="pt-5 text-center">
        <p className="text-brand text-2xl font-bold">{value}</p>
        <p className="mt-1 text-xs text-ink-50">{label}</p>
      </CardBody>
    </Card>
  )
}

function SwotBlock({
  title,
  tone,
  items,
}: {
  title: string
  tone: 'success' | 'warning' | 'info' | 'danger'
  items: string[]
}) {
  return (
    <div>
      <Badge tone={tone} className="mb-1.5">
        {title}
      </Badge>
      <ul className="space-y-1 text-sm text-ink-50">
        {items.map((it, i) => (
          <li key={i}>• {it}</li>
        ))}
      </ul>
    </div>
  )
}

function KeywordRow({ row }: { row: ReportData['keywordMatrix'][number] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-line bg-surface-2/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{row.text}</p>
          <p className="text-[11px] text-ink-30">
            {row.intent.replace(/_/g, ' ')} · {row.locale}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={row.mentionedRate >= 50 ? 'success' : row.mentionedRate > 0 ? 'warning' : 'danger'}>
            {row.mentionedRate}%
          </Badge>
          <ChevronDown className={`size-3.5 text-ink-30 transition ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="space-y-2 border-t border-line px-3 py-2.5">
          {Object.entries(row.engines).map(([engine, runs]) => (
            <div key={engine}>
              <p className="mb-1 text-xs font-medium capitalize text-ink-50">{engine}</p>
              {runs.map((r) => (
                <p key={r.runId} className="mb-1 text-[12px] text-ink-50">
                  <span className={r.mentioned ? 'text-emerald-400' : 'text-ink-30'}>
                    {r.mentioned ? '✓ mentioned' : '— not mentioned'}
                  </span>
                  {r.cited && <span className="ml-2 text-cyan-400">✓ cited</span>}
                  {r.rank && <span className="ml-2 text-ink-30">rank #{r.rank}</span>}
                  <span className="ml-2 block text-ink-30">{r.answerSnippet}</span>
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
