import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Sparkles, TrendingUp, ChevronDown, History } from 'lucide-react'
import { api, ApiError, API_BASE_URL } from '../../../lib/api'
import type { ClientSummary, ReportData, ReportSnapshot, SwotResult } from '../../../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Input'
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
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['client', client.slug, 'report'],
    queryFn: () => api.get<ReportData>(`/api/reports/${client.slug}`),
  })

  // Reports are stored newest-first. Default to the freshest; let the operator
  // toggle back through prior probe cycles to measure progress over time.
  const history = data?.reportHistory ?? []
  const activeSnapshot: ReportSnapshot | null = useMemo(() => {
    if (history.length === 0) return null
    return history.find((r) => r.cycleId === selectedCycleId) ?? history[0]
  }, [history, selectedCycleId])
  const isLatest = !activeSnapshot || activeSnapshot.cycleId === history[0]?.cycleId

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

  // Metrics / summary / download links follow the selected snapshot; the
  // cumulative sections below (engine, competitors, matrix) stay all-time.
  const shownMetrics = activeSnapshot?.metrics ?? data.metrics
  const shownSummary = activeSnapshot?.aiSummary ?? data.aiSummary
  const cycleParam = !isLatest && activeSnapshot ? `&cycleId=${activeSnapshot.cycleId}` : ''

  return (
    <div className="space-y-4">
      {history.length > 1 && (
        <Card>
          <CardBody className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <History className="size-4 text-brand" />
              <div>
                <p className="text-sm font-medium text-ink">Report timeline</p>
                <p className="text-[11px] text-ink-30">
                  {history.length} probe cycles stored · viewing{' '}
                  {isLatest ? 'the freshest report' : 'an earlier report'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={activeSnapshot?.cycleId ?? ''}
                onChange={(e) => setSelectedCycleId(e.target.value)}
                className="sm:w-72"
              >
                {history.map((r, i) => (
                  <option key={r.cycleId} value={r.cycleId}>
                    {new Date(r.createdAt).toLocaleString()} · score {r.score.toFixed(1)}/10
                    {i === 0 ? ' — freshest' : ''}
                  </option>
                ))}
              </Select>
              {!isLatest && (
                <Button size="sm" variant="secondary" onClick={() => setSelectedCycleId(null)}>
                  Latest
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Mention rate" value={`${shownMetrics.mentionRate}%`} />
        <MetricCard label="Citation rate" value={`${shownMetrics.citationRate}%`} />
        <MetricCard label="Rank #1" value={String(shownMetrics.rankOneCount)} />
        <MetricCard label="Total runs" value={String(shownMetrics.totalRuns)} />
      </div>

      {shownSummary && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{shownSummary.headline}</CardTitle>
            <Badge tone="violet">{shownSummary.statusBadge}</Badge>
          </CardHeader>
          <CardBody className="space-y-3 pt-3">
            <p className="text-sm text-ink-70">{shownSummary.executiveSummary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-50">Takeaways</p>
                <ul className="space-y-1 text-sm text-ink-50">
                  {shownSummary.takeaways.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-50">Recommended actions</p>
                <ul className="space-y-1 text-sm text-ink-50">
                  {shownSummary.recommendedActions.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="border-brand/40 bg-brand-tint/30 ring-1 ring-brand/30">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-brand">
            <Sparkles className="size-4 text-brand" /> Strategic SWOT
          </CardTitle>
          {!swot && (
            <Button size="sm" onClick={generateSwot} loading={swotLoading}>
              <Sparkles className="size-3.5" /> Generate
            </Button>
          )}
        </CardHeader>
        {!swot ? (
          <CardBody className="pt-2">
            <p className="text-sm text-ink-50">
              Generate an executive strengths / weaknesses / opportunities / threats brief from this
              client's live visibility data.
            </p>
          </CardBody>
        ) : (
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

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <a
          href={`${API_BASE_URL}/api/reports/${client.slug}/export?format=pdf${cycleParam}`}
          className="bg-brand text-white flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium hover:opacity-90"
        >
          <Download className="size-3.5" /> Quick report (PDF)
        </a>
        <a
          href={`${API_BASE_URL}/report/${client.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-brand flex items-center gap-1.5 text-sm hover:underline"
        >
          View full expanded report →
        </a>
        <span className="text-ink-30 ml-auto flex items-center gap-2 text-xs">
          Also as:
          {(['docx', 'rtf', 'html'] as const).map((fmt) => (
            <a
              key={fmt}
              href={`${API_BASE_URL}/api/reports/${client.slug}/export?format=${fmt}${cycleParam}`}
              className="text-ink-50 hover:text-ink underline"
            >
              {fmt.toUpperCase()}
            </a>
          ))}
        </span>
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
