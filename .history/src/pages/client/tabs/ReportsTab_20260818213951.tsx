import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import {
  Download,
  Sparkles,
  TrendingUp,
  ChevronDown,
  History,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import { api, ApiError, API_BASE_URL } from '../../../lib/api'
import type {
  ClientSummary,
  KeywordMatrixRow,
  PromptRunsResponse,
  ReportData,
  ReportSnapshot,
  SwotResult,
} from '../../../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Input'
import { Badge } from '../../../components/ui/Badge'
import { Alert } from '../../../components/ui/Alert'
import { InfoTip } from '../../../components/ui/InfoTip'
import { FullPageSpinner } from '../../../components/ui/Spinner'
import { useToast } from '../../../context/toast-context'
import { wilson, pct } from '../../../lib/stats'
import { intentInfo } from '../../../lib/intents'

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
  if (error || !data)
    return <Alert tone="error">No report data yet. Run a probe cycle first.</Alert>
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
              <History className="text-brand size-4" />
              <div>
                <p className="text-ink text-sm font-medium">Report timeline</p>
                <p className="text-ink-30 text-[11px]">
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
        <MetricCard
          label="Mention rate"
          value={`${shownMetrics.mentionRate}%`}
          rate={shownMetrics.mentionRate / 100}
          help="How often an engine named your business somewhere in its answer, across every question, market and engine probed."
        />
        <MetricCard
          label="Citation rate"
          value={`${shownMetrics.citationRate}%`}
          rate={shownMetrics.citationRate / 100}
          help="How often an engine linked to your own website as a source. Stronger than a mention: a mention says your name, a citation sends the customer to you."
        />
        <MetricCard
          label="Rank #1"
          value={String(shownMetrics.rankOneCount)}
          help="Answers where you were the first business listed. Being named seventh and being named first are not the same result."
        />
        <MetricCard
          label="Total runs"
          value={String(shownMetrics.totalRuns)}
          help="Every individual question put to an engine. Each question is asked several times per cycle, because one answer is an anecdote rather than a measurement."
        />
      </div>

      {shownSummary && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{shownSummary.headline}</CardTitle>
            <Badge tone="violet">{shownSummary.statusBadge}</Badge>
          </CardHeader>
          <CardBody className="space-y-3 pt-3">
            <p className="text-ink-70 text-sm">{shownSummary.executiveSummary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-ink-50 mb-1 text-xs font-medium uppercase tracking-wide">
                  Takeaways
                </p>
                <ul className="text-ink-50 space-y-1 text-sm">
                  {shownSummary.takeaways.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-ink-50 mb-1 text-xs font-medium uppercase tracking-wide">
                  Recommended actions
                </p>
                <ul className="text-ink-50 space-y-1 text-sm">
                  {shownSummary.recommendedActions.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="border-brand/40 bg-brand-tint/30 ring-brand/30 ring-1">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-brand flex items-center gap-1.5">
            <Sparkles className="text-brand size-4" /> Strategic SWOT
          </CardTitle>
          {!swot && (
            <Button size="sm" onClick={generateSwot} loading={swotLoading}>
              <Sparkles className="size-3.5" /> Generate
            </Button>
          )}
        </CardHeader>
        {!swot ? (
          <CardBody className="pt-2">
            <p className="text-ink-50 text-sm">
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
            <p className="bg-surface-2/60 text-ink-70 sm:col-span-2 rounded-lg p-3 text-sm">
              {swot.strategicVerdict}
            </p>
          </CardBody>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5" /> Engine performance
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-2.5 pt-3">
            {Object.entries(data.engineStats).map(([engine, s]) => (
              <RateRow
                key={engine}
                label={engine}
                mentioned={s.mentioned}
                total={s.total}
                sub={`${s.cited} cited`}
                capitalize
              />
            ))}
          </CardBody>
        </Card>

        {/*
          localeStats has always been computed and sent by the report endpoint
          and never rendered. Every prompt is expanded once per market at real
          probe cost, so which market is weakest is a finding the client paid
          for — sorted worst-first, because that is the one to act on.
        */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <MapPin className="size-3.5" /> Market performance
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-2.5 pt-3">
            {Object.keys(data.localeStats).length === 0 && (
              <p className="text-ink-50 text-sm">No market data yet.</p>
            )}
            {Object.entries(data.localeStats)
              .sort(
                (a, b) => a[1].mentioned / (a[1].total || 1) - b[1].mentioned / (b[1].total || 1)
              )
              .map(([locale, s]) => (
                <RateRow key={locale} label={locale} mentioned={s.mentioned} total={s.total} />
              ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competitor leaderboard</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 pt-3">
            {data.competitorsLeaderboard.length === 0 && (
              <p className="text-ink-50 text-sm">No competitors surfaced yet.</p>
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

      <KeywordMatrix rows={data.keywordMatrix} slug={client.slug} />

      <div className="border-line flex flex-wrap items-center gap-3 border-t pt-4">
        <a
          href={`${API_BASE_URL}/api/reports/${client.slug}/export?format=html${cycleParam}`}
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

function MetricCard({
  label,
  value,
  rate,
  help,
}: {
  label: string
  value: string
  /** 0–1. Colours the figure by how good it is. Omit for plain counts. */
  rate?: number
  help: string
}) {
  // text-brand is the oxblood house colour, which the dark theme doesn't
  // lighten — as body text on a dark ground it reads as a warning whatever the
  // number says. Rates get the performance scale instead; counts stay neutral.
  const tone = rate === undefined ? 'text-ink' : perf(rate, 1).text
  return (
    <Card>
      <CardBody className="pt-5 text-center">
        <p className={`text-2xl font-bold ${tone}`}>{value}</p>
        <p className="text-ink-50 mt-1 flex items-center justify-center gap-1 text-xs">
          {label}
          <InfoTip label={`What does ${label} mean?`}>
            <span className="text-ink block font-medium">{label}</span>
            {help}
          </InfoTip>
        </p>
      </CardBody>
    </Card>
  )
}

/**
 * The performance scale.
 *
 * Bright and saturated when the business is winning, washing out as it loses.
 * A strong row should advertise itself across the page and a weak one recede —
 * the previous single-red treatment made a 0% and an 84% shout equally loudly,
 * which is the opposite of what someone skimming needs.
 */
function perf(rate: number, n: number): { text: string; bar: string; chip: string } {
  if (n === 0) {
    return {
      text: 'text-ink-30',
      bar: 'bg-ink-30/30',
      chip: 'bg-surface-2 text-ink-30 border-line',
    }
  }
  if (rate >= 0.8) {
    return {
      text: 'text-emerald-300',
      bar: 'bg-emerald-400',
      chip: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40',
    }
  }
  if (rate >= 0.5) {
    return {
      text: 'text-emerald-400',
      bar: 'bg-emerald-500/75',
      chip: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    }
  }
  if (rate >= 0.25) {
    return {
      text: 'text-amber-400/85',
      bar: 'bg-amber-500/60',
      chip: 'bg-amber-500/10 text-amber-400/85 border-amber-500/25',
    }
  }
  if (rate > 0) {
    return {
      text: 'text-amber-400/60',
      bar: 'bg-amber-500/40',
      chip: 'bg-amber-500/8 text-amber-400/60 border-amber-500/20',
    }
  }
  return {
    text: 'text-red-400/70',
    bar: 'bg-red-500/45',
    chip: 'bg-red-500/8 text-red-400/70 border-red-500/25',
  }
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
      <ul className="text-ink-50 space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={i}>• {it}</li>
        ))}
      </ul>
    </div>
  )
}

type SortKey = 'strongest' | 'weakest' | 'runs' | 'intent'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'weakest', label: 'Weakest first' },
  { key: 'strongest', label: 'Strongest first' },
  { key: 'runs', label: 'Most measured' },
  { key: 'intent', label: 'By intent' },
]

/**
 * The prompt-by-prompt breakdown.
 *
 * Every number here is paired with the count behind it. A bare "50%" hides
 * whether it came from two runs or forty, and the two are not the same claim —
 * see lib/stats.ts. The competitor tally, the citation links and the per-engine
 * split all come from fields the report endpoint has always sent.
 */
function KeywordMatrix({ rows, slug }: { rows: KeywordMatrixRow[]; slug: string }) {
  const [sort, setSort] = useState<SortKey>('strongest')
  const [open, setOpen] = useState(true)

  const scored = useMemo(() => {
    const list = rows.map((row) => {
      const [lo, hi] = wilson(row.mentionedCount, row.totalRuns)
      return { row, lo, hi }
    })
    switch (sort) {
      case 'strongest':
        return list.sort((a, b) => b.lo - a.lo || b.row.totalRuns - a.row.totalRuns)
      case 'runs':
        return list.sort((a, b) => b.row.totalRuns - a.row.totalRuns)
      case 'intent':
        return list.sort((a, b) => a.row.intent.localeCompare(b.row.intent) || a.hi - b.hi)
      case 'weakest':
      default:
        // Upper bound ascending, not rate ascending. "Confidently losing this"
        // belongs above "might be losing this, but n is 2" — sorting on the
        // rate alone puts a single unlucky run at the top of the client's list.
        return list.sort((a, b) => a.hi - b.hi || b.row.totalRuns - a.row.totalRuns)
    }
  }, [rows, sort])

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          <ChevronDown
            className={`text-ink-30 mt-0.5 size-4 shrink-0 transition ${open ? '' : '-rotate-90'}`}
          />
          <span className="min-w-0">
            <CardTitle>Keyword intelligence matrix ({rows.length})</CardTitle>
            <span className="text-ink-30 mt-0.5 block text-[11px]">
              {open
                ? 'Every question probed, how often engines named you, and who took the ones you lost.'
                : 'Collapsed — expand to see every question, engine by engine.'}
            </span>
          </span>
        </button>
        {open && (
          <div className="border-line bg-surface-2 flex shrink-0 flex-wrap gap-0.5 rounded-lg border p-0.5">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                aria-pressed={sort === s.key}
                className={clsx(
                  'rounded-md px-2.5 py-1 text-[11px] font-medium transition',
                  sort === s.key
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-ink-50 hover:text-ink hover:bg-surface'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      {open && (
        <CardBody className="space-y-2 pt-3">
          {scored.map(({ row, lo, hi }) => (
            <KeywordRow key={row.promptId} slug={slug} row={row} lo={lo} hi={hi} />
          ))}
        </CardBody>
      )}
    </Card>
  )
}

function KeywordRow({
  slug,
  row,
  lo,
  hi,
}: {
  slug: string
  row: KeywordMatrixRow
  lo: number
  hi: number
}) {
  const [open, setOpen] = useState(false)
  // Answers run to ~3,000 characters each; fetched per question, only once the
  // row is actually opened, so the list payload stays small.
  const detail = useQuery({
    queryKey: ['client', slug, 'prompt-runs', row.promptId],
    queryFn: () => api.get<PromptRunsResponse>(`/api/reports/${slug}/prompts/${row.promptId}/runs`),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })
  const info = intentInfo(row.intent)
  const rivals = useMemo(() => rivalCounts(row), [row])
  const engines = useMemo(() => engineTally(row), [row])
  const citations = useMemo(() => citationList(row), [row])

  const rate = row.totalRuns ? row.mentionedCount / row.totalRuns : 0
  const tone = perf(rate, row.totalRuns)
  // A 45-point-wide interval is not a measurement yet, however good the
  // midpoint looks. Say so rather than letting the number carry false weight.
  const unsettled = hi - lo > 0.45

  return (
    <div className="border-line bg-surface-2/40 rounded-lg border">
      {/*
        The disclosure is two separate buttons — the question and the chevron —
        rather than one wrapper around the whole header. The meta line holds the
        intent's InfoTip, which is itself a button, and a button inside a button
        is invalid markup that browsers resolve by dropping one of them.
      */}
      <div className="flex items-start justify-between gap-3 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="text-ink w-full text-left text-sm leading-snug"
          >
            {row.text}
          </button>

          <p className="text-ink-30 mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px]">
            <span className="text-ink-50">{info.label}</span>
            <InfoTip label={`What does the ${info.label} intent mean?`}>
              <span className="text-ink block font-medium">{info.label}</span>
              {info.blurb}
              {info.highIntent && (
                <span className="text-brand mt-1 block font-medium">
                  High buying intent — losing these costs more than losing a browse.
                </span>
              )}
            </InfoTip>
            <span>·</span>
            <span>{row.locale}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              {engines.map((e) => (
                <span
                  key={e.engine}
                  className={perf(e.total ? e.mentioned / e.total : 0, e.total).text}
                  title={`${e.engine}: named you in ${e.mentioned} of ${e.total} runs`}
                >
                  {e.mentioned > 0 ? '✓' : '✗'} {e.engine}
                </span>
              ))}
            </span>
          </p>

          {/*
            row.competitors has always been in the payload and never rendered.
            The set alone loses the count, so this re-tallies across runs — "took
            this four times out of six" is the sentence that makes it land.
          */}
          {rivals.length > 0 && rate < 1 && (
            <p className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
              <span className="text-ink-30">lost to</span>
              {rivals.slice(0, 3).map((r) => (
                <span
                  key={r.name}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-red-400"
                >
                  {r.name} ×{r.count}
                </span>
              ))}
              {rivals.length > 3 && <span className="text-ink-30">+{rivals.length - 3} more</span>}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <div className="text-right">
            <p className="font-mono text-xs tabular-nums">
              <span className="text-ink">{row.mentionedCount}</span>
              <span className="text-ink-30">/{row.totalRuns}</span>
              <span
                className={clsx(
                  'ml-1.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium',
                  tone.chip
                )}
              >
                {pct(rate)}%
              </span>
            </p>
            <p className="text-ink-30 mt-1 font-mono text-[10px] tabular-nums">
              {pct(lo)}–{pct(hi)}% ci
            </p>
            <ConfidenceBar lo={lo} hi={hi} point={rate} fill={tone.bar} />
            {unsettled && <p className="text-ink-30 mt-1 text-[10px] italic">needs more runs</p>}
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Hide run detail' : 'Show run detail'}
            className="text-ink-30 hover:text-ink mt-1 shrink-0 transition"
          >
            <ChevronDown className={`size-3.5 transition ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-line space-y-3 border-t px-3 py-2.5">
          {citations.length > 0 && (
            <div>
              <p className="text-ink-50 mb-1.5 flex items-center gap-1 text-xs font-medium">
                Sources these engines cited
                <InfoTip label="What are cited sources?">
                  The pages an engine leaned on to write its answer, grouped by site. These are
                  where your reputation is being read from — getting listed on the ones that keep
                  appearing is usually the fastest way to change an answer.
                </InfoTip>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {citations.slice(0, 14).map((c) =>
                  c.grounding ? (
                    <span
                      key={c.domain}
                      className="border-line bg-surface-2 text-ink-30 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
                    >
                      Google grounding ×{c.count}
                      <InfoTip label="What is Google grounding?">
                        Gemini returns its web results through a Google redirect instead of naming
                        the site, so these can't be traced to a publisher. Not somewhere you can get
                        listed — treat the named domains beside it as the real sources.
                      </InfoTip>
                    </span>
                  ) : (
                    <a
                      key={c.domain}
                      href={c.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="border-line bg-surface-2 text-ink-50 hover:text-brand hover:border-brand/40 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition"
                    >
                      {c.domain}
                      {c.count > 1 && <span className="text-ink-30">×{c.count}</span>}
                      <ExternalLink className="size-2.5" />
                    </a>
                  )
                )}
                {citations.length > 14 && (
                  <span className="text-ink-30 self-center text-[11px]">
                    +{citations.length - 14} more sites
                  </span>
                )}
              </div>
            </div>
          )}

          <p className="text-ink-30 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="text-emerald-400">✓ mentioned</span>
              <InfoTip label="What does mentioned mean?">
                The engine named your business somewhere in its answer. Good — but the customer
                still has to go and find you.
              </InfoTip>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-cyan-400">✓ cited</span>
              <InfoTip label="What does cited mean?">
                The engine linked to your own website as a source. Stronger than a mention: it puts
                a route to you inside the answer instead of leaving the customer to search again.
              </InfoTip>
            </span>
            <span className="flex items-center gap-1">
              rank #
              <InfoTip label="What does rank mean?">
                Where you came in the list of businesses the answer gave. First is worth
                considerably more than seventh, and most people never read past the first two.
              </InfoTip>
            </span>
          </p>

          {detail.isLoading && <p className="text-ink-30 text-[12px]">Loading full answers…</p>}
          {detail.isError && (
            <p className="text-[12px] text-red-400/80">
              Could not load the full answers. The summary above still stands.
            </p>
          )}

          {(detail.data?.runs ?? []).length > 0 &&
            Object.entries(groupByEngine(detail.data!.runs)).map(([engine, runs]) => (
              <div key={engine}>
                <p className="text-ink-50 mb-1 text-xs font-medium capitalize">{engine}</p>
                {runs.map((r) => (
                  <div key={r.runId} className="mb-3">
                    <p className="text-[12px]">
                      <span className={r.mentioned ? 'text-emerald-400' : 'text-ink-30'}>
                        {r.mentioned ? '✓ mentioned' : '— not mentioned'}
                      </span>
                      {r.cited && <span className="ml-2 text-cyan-400">✓ cited</span>}
                      {r.rank && <span className="text-ink-30 ml-2">rank #{r.rank}</span>}
                      {/*
                        Without this the verdict has no receipt. Most matches land
                        past the first few hundred characters, so "mentioned" used
                        to be an assertion the reader had no way to check.
                      */}
                      {r.matchedAlias && (
                        <span className="text-ink-30 ml-2">
                          matched on “<span className="text-emerald-400">{r.matchedAlias}</span>”
                        </span>
                      )}
                    </p>
                    <div className="border-line bg-surface/60 thin-scroll mt-1 max-h-80 overflow-y-auto rounded-lg border px-2.5 py-2">
                      <p className="text-ink-50 text-[12px] leading-relaxed whitespace-pre-wrap">
                        <Highlighted
                          text={stripMarkdown(r.answerText)}
                          mine={detail.data!.aliases}
                          rivals={r.competitors}
                        />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

/**
 * The Wilson interval, drawn. A wide bar is the point — it reads as "unsure" —
 * and the fill carries the performance colour so a strong question is bright
 * green at a glance and a lost one recedes.
 */
function ConfidenceBar({
  lo,
  hi,
  point,
  fill,
}: {
  lo: number
  hi: number
  point: number
  fill: string
}) {
  return (
    <div
      className="bg-surface-2 border-line relative mt-1 ml-auto h-1.5 w-24 rounded-full border"
      aria-hidden
    >
      <span
        className={clsx('absolute inset-y-0 rounded-full', fill)}
        style={{ left: `${lo * 100}%`, right: `${100 - hi * 100}%` }}
      />
      <span
        className="bg-ink absolute -top-0.5 h-2.5 w-0.5 rounded-full"
        style={{ left: `calc(${point * 100}% - 1px)` }}
      />
    </div>
  )
}

function RateRow({
  label,
  mentioned,
  total,
  sub,
  capitalize,
}: {
  label: string
  mentioned: number
  total: number
  sub?: string
  capitalize?: boolean
}) {
  const rate = total ? mentioned / total : 0
  const [lo, hi] = wilson(mentioned, total)
  const tone = perf(rate, total)
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className={`text-ink-70 truncate ${capitalize ? 'capitalize' : ''}`}>{label}</span>
        <span className="shrink-0 font-mono text-xs tabular-nums">
          <span className="text-ink-50">
            {mentioned}/{total}
          </span>{' '}
          · <span className={tone.text}>{pct(rate)}%</span>
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="bg-surface-2 border-line relative h-1.5 flex-1 rounded-full border">
          <span
            className={clsx('absolute inset-y-0 rounded-full', tone.bar)}
            style={{ left: `${lo * 100}%`, right: `${100 - hi * 100}%` }}
          />
          <span
            className="bg-ink absolute -top-0.5 h-2.5 w-0.5 rounded-full"
            style={{ left: `calc(${rate * 100}% - 1px)` }}
          />
        </div>
        <span className="text-ink-30 shrink-0 font-mono text-[10px] tabular-nums">
          {sub ?? `${pct(lo)}–${pct(hi)}%`}
        </span>
      </div>
    </div>
  )
}

/** Group the flat run list back under its engines for display. */
function groupByEngine<T extends { engine: string }>(runs: T[]): Record<string, T[]> {
  const out: Record<string, T[]> = {}
  for (const r of runs) (out[r.engine] ??= []).push(r)
  return out
}

/**
 * Engines answer in light markdown. Rendering it properly would be a different
 * job; stripping the emphasis markers is enough to make the text readable and
 * keeps the highlighter from having to match across a `**` in the middle of a
 * business name — which is exactly where they like to put them.
 */
function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/(^|\s)\*(\S[^*]*?)\*/g, '$1$2')
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * The answer, with the client's own names and its rivals' marked in place.
 *
 * This is the point of showing the full text at all: 57% of this client's
 * matches sit past the old 260-character snippet, so "mentioned" was a verdict
 * with its evidence off-screen. Longest names first, so "Glory Mixed Martial
 * Arts" wins over "Glory MMA" where both would match.
 */
function Highlighted({ text, mine, rivals }: { text: string; mine: string[]; rivals: string[] }) {
  const parts = useMemo(() => {
    const names = [
      ...mine.filter(Boolean).map((n) => ({ n, ours: true })),
      ...rivals.filter(Boolean).map((n) => ({ n, ours: false })),
    ].sort((a, b) => b.n.length - a.n.length)

    if (names.length === 0) return [{ text, ours: null as boolean | null }]

    const re = new RegExp(`(${names.map((x) => escapeRe(x.n)).join('|')})`, 'gi')
    const lookup = new Map(names.map((x) => [x.n.toLowerCase(), x.ours]))

    return text.split(re).map((chunk) => ({
      text: chunk,
      ours: lookup.has(chunk.toLowerCase()) ? lookup.get(chunk.toLowerCase())! : null,
    }))
  }, [text, mine, rivals])

  return (
    <>
      {parts.map((p, i) =>
        p.ours === null ? (
          <span key={i}>{p.text}</span>
        ) : (
          <mark
            key={i}
            className={
              p.ours
                ? 'rounded bg-emerald-400/20 px-0.5 font-medium text-emerald-300'
                : 'rounded bg-red-400/15 px-0.5 text-red-300/90'
            }
          >
            {p.text}
          </mark>
        )
      )}
    </>
  )
}

/**
 * Rivals named on this question, counted across every run.
 * `row.competitors` is a deduped set, which drops the frequency — and the
 * frequency is what turns a name into a finding.
 */
function rivalCounts(row: KeywordMatrixRow): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const runs of Object.values(row.engines)) {
    for (const run of runs) {
      for (const name of run.competitors) counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Gemini hands back its grounded results through a Vertex redirect rather than
 * the publisher's own hostname, so dozens of distinct citations collapse to
 * this one host. It is not a site anyone can go and get listed on, and left
 * un-grouped it buries every real source under a wall of identical chips.
 */
const GROUNDING_HOST = 'vertexaisearch.cloud.google.com'

/**
 * Sources cited on this question, grouped by domain with a count.
 *
 * Deduping by URL (the obvious first move) is wrong here: engines cite many
 * different pages on the same site, and forty chips reading the same hostname
 * carry no more information than one chip reading "×40".
 */
function citationList(
  row: KeywordMatrixRow
): { domain: string; url: string; count: number; grounding: boolean }[] {
  const byDomain = new Map<string, { domain: string; url: string; count: number }>()
  for (const runs of Object.values(row.engines)) {
    for (const run of runs) {
      for (const c of run.citations) {
        if (!c?.url) continue
        let domain = c.url
        try {
          domain = new URL(c.url).hostname.replace(/^www\./, '')
        } catch {
          /* keep the raw string — a malformed citation is still a citation */
        }
        const seen = byDomain.get(domain)
        if (seen) seen.count++
        else byDomain.set(domain, { domain, url: c.url, count: 1 })
      }
    }
  }
  return (
    [...byDomain.values()]
      .map((d) => ({ ...d, grounding: d.domain === GROUNDING_HOST }))
      // Real publishers first — the grounding redirect is noise, not a lead.
      .sort((a, b) => Number(a.grounding) - Number(b.grounding) || b.count - a.count)
  )
}

/** Per-engine hit count for the collapsed row's at-a-glance strip. */
function engineTally(
  row: KeywordMatrixRow
): { engine: string; mentioned: number; total: number }[] {
  return Object.entries(row.engines).map(([engine, runs]) => ({
    engine,
    mentioned: runs.filter((r) => r.mentioned).length,
    total: runs.length,
  }))
}
