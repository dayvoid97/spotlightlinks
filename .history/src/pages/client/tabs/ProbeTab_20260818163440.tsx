import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Play, Square, Terminal, CheckCircle2, XCircle, Download, HelpCircle } from 'lucide-react'
import clsx from 'clsx'
import { streamSSE } from '../../../lib/sse'
import { API_BASE_URL } from '../../../lib/api'
import { useAuth } from '../../../context/auth-context'
import type {
  ClientSummary,
  ProbeCompleteEvent,
  ProbeLogEvent,
  ProbeProgressEvent,
} from '../../../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input, Label, Select } from '../../../components/ui/Input'
import { Badge } from '../../../components/ui/Badge'
import { Alert } from '../../../components/ui/Alert'

const ENGINES = [
  { key: 'gemini', label: 'Gemini' },
  { key: 'anthropic', label: 'Claude' },
  { key: 'perplexity', label: 'Perplexity' },
] as const

type LogLine = { message: string; level?: 'info' | 'warn' | 'error'; ts: number }

/**
 * POST /api/probe/run, streamed over SSE (see docs/04-probe-engine.md).
 *
 * This is the one screen in the whole app built around a request that can
 * legitimately run for 10+ minutes — a full cycle is
 * prompts × locales × engines × runs-per-prompt, each a real API call to an
 * external AI engine. The connection here is a single long-lived
 * `fetch` stream (see src/lib/sse.ts for why EventSource doesn't work for a
 * POST body), so as long as this tab stays mounted the log keeps
 * appending and the progress bar keeps moving with no polling involved.
 *
 * Navigating away aborts the underlying fetch (see the cleanup effect
 * below) — the backend's own `res.on('close', ...)` then flips its abort
 * flag and stops issuing new engine calls, so nothing keeps running
 * unattended in the background after you leave the tab.
 */
export default function ProbeTab({ client }: { client: ClientSummary }) {
  const { user, refresh } = useAuth()
  const queryClient = useQueryClient()

  const [selectedEngines, setSelectedEngines] = useState<Set<string>>(
    new Set(ENGINES.map((e) => e.key))
  )
  const [runs, setRuns] = useState('')
  const [limit, setLimit] = useState('30')
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(false)

  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<LogLine[]>([])
  const [progress, setProgress] = useState<ProbeProgressEvent | null>(null)
  const [complete, setComplete] = useState<ProbeCompleteEvent | null>(null)
  const [runError, setRunError] = useState<{ message: string; code?: string } | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const lastDoneRef = useRef(0)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  // While a cycle is running the work is tied to this page's open connection —
  // closing or reloading aborts it and the credits already spent are lost. Warn
  // before the browser tears the page down.
  useEffect(() => {
    if (!isRunning) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isRunning])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [logs])

  const needsDisclaimer = !user?.disclaimerAcceptedAt
  const isPublicNonOwner = client.isPublic && !client.isOwner

  function toggleEngine(key: string) {
    setSelectedEngines((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function run() {
    setIsRunning(true)
    setLogs([])
    lastDoneRef.current = 0
    setProgress(null)
    setComplete(null)
    setRunError(null)

    const controller = new AbortController()
    abortRef.current = controller

    const body: Record<string, unknown> = {
      slug: client.slug,
      engines: selectedEngines.size < ENGINES.length ? Array.from(selectedEngines) : undefined,
    }
    if (runs) body.runs = Number(runs)
    if (limit && limit !== 'all') body.limit = Number(limit)
    if (needsDisclaimer) body.acceptDisclaimer = acceptDisclaimer

    await streamSSE({
      path: '/api/probe/run',
      body,
      signal: controller.signal,
      onEvent: (event, data) => {
        if (event === 'log') {
          const d = data as ProbeLogEvent
          setLogs((prev) => [...prev, { message: d.message, level: d.level, ts: Date.now() }])
        } else if (event === 'progress') {
          const p = data as ProbeProgressEvent
          setProgress(p)
          // Surface each newly-completed query in the console with a status bar.
          // We only announce successful progress (rising `done`); failures are
          // left to the summary so the live feed stays clean.
          if (p.done > lastDoneRef.current) {
            const bar = renderBar(p.percent)
            const line = `✓ query ${p.done}/${p.total} processed  ${bar} ${p.percent}%`
            lastDoneRef.current = p.done
            setLogs((prev) => [...prev, { message: line, level: 'info', ts: Date.now() }])
          }
        } else if (event === 'complete') {
          setComplete(data as ProbeCompleteEvent)
          queryClient.invalidateQueries({ queryKey: ['client', client.slug] })
          queryClient.invalidateQueries({ queryKey: ['clients'] })
          refresh()
        } else if (event === 'error') {
          setRunError(data)
        }
      },
    })

    setIsRunning(false)
    abortRef.current = null
  }

  function cancel() {
    abortRef.current?.abort()
    setIsRunning(false)
    setLogs((prev) => [
      ...prev,
      { message: 'Cancelled by operator.', level: 'warn', ts: Date.now() },
    ])
  }

  if (isPublicNonOwner) {
    return (
      <Alert tone="warning" title="Read-only public case study">
        '{client.name}' is a public showcase profile. Only its owner or an administrator can run new
        probe cycles here.
      </Alert>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Run configuration</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 pt-3">
            <div>
              <Label>Engines</Label>
              <div className="flex flex-wrap gap-2">
                {ENGINES.map((e) => (
                  <button
                    key={e.key}
                    type="button"
                    onClick={() => toggleEngine(e.key)}
                    disabled={isRunning}
                    className={clsx(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                      selectedEngines.has(e.key)
                        ? 'border-brand bg-brand-tint text-brand'
                        : 'border-line bg-surface-2 text-ink-50'
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              <p className="text-ink-30 mt-1.5 text-[11px]">
                Selecting fewer than 3 counts as a targeted re-probe and does not consume a daily
                full-cycle credit.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="runs">
                  Runs / prompt
                  <InfoHint text="How many times each question is run. Defaults to 2, up to 3." />
                </Label>
                <Input
                  id="runs"
                  type="number"
                  min={1}
                  max={3}
                  placeholder="default 2"
                  value={runs}
                  onChange={(e) => setRuns(e.target.value)}
                  disabled={isRunning}
                />
              </div>
              <div>
                <Label htmlFor="limit">
                  Prompt limit
                  <InfoHint text="How many queries' keywords to run." />
                </Label>
                <Select
                  id="limit"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  disabled={isRunning}
                >
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="all">All</option>
                </Select>
              </div>
            </div>

            {needsDisclaimer && (
              <label className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={acceptDisclaimer}
                  onChange={(e) => setAcceptDisclaimer(e.target.checked)}
                  disabled={isRunning}
                />
                <span>
                  I acknowledge the Spotlight Links LLC Generative Engine Audit Disclaimer: probe
                  answers are AI-generated snapshots, not guarantees, and each cycle spends real API
                  budget.
                </span>
              </label>
            )}

            <div className="flex gap-2">
              {!isRunning ? (
                <Button
                  className="flex-1"
                  onClick={run}
                  disabled={selectedEngines.size === 0 || (needsDisclaimer && !acceptDisclaimer)}
                >
                  <Play className="size-3.5" /> Run probe cycle
                </Button>
              ) : (
                <Button className="flex-1" variant="danger" onClick={cancel}>
                  <Square className="size-3.5" /> Cancel
                </Button>
              )}
            </div>

            {isRunning && (
              <Alert tone="warning" title="Keep this page open">
                A probe is running and spending real API credits right now. It's safe to switch to
                another browser tab, but{' '}
                <strong>don't close, reload, or navigate away from this page</strong> — doing so
                aborts the cycle and you'll lose the credits already spent without getting your
                results.
              </Alert>
            )}

            <p className="text-ink-30 text-[11px]">
              {client.probesToday}/2 full cycles used in the last 24h. A full cycle can take 10+
              minutes — keep this page open while it runs.
            </p>
          </CardBody>
        </Card>

        {client.cycleHistory?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent cycles</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 pt-3">
              {client.cycleHistory.slice(0, 5).map((c) => (
                <div key={c.cycleId} className="flex items-center justify-between text-xs">
                  <span className="text-ink-50">{new Date(c.startedAt).toLocaleString()}</span>
                  <Badge tone={c.allEnginesCovered ? 'success' : 'warning'}>
                    {c.validRuns}/{c.totalRuns} valid
                  </Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        )}
      </div>

      <div className="space-y-4 lg:col-span-2">
        {runError && (
          <Alert tone="error" title={runError.code || 'Probe error'}>
            {runError.message}
          </Alert>
        )}

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1.5">
              <Terminal className="size-3.5" /> Live console
            </CardTitle>
            {isRunning && (
              <span className="text-brand flex items-center gap-1.5 text-xs">
                <span className="pulse-dot bg-brand size-1.5 rounded-full" /> running
              </span>
            )}
          </CardHeader>
          <CardBody className="pt-3">
            {progress && (
              <div className="mb-3">
                <div className="text-ink-50 mb-1 flex justify-between text-xs">
                  <span>
                    {progress.done + progress.failed} / {progress.total} jobs
                  </span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="bg-surface-2 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-brand h-full transition-all"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}
            <div
              ref={logRef}
              className="thin-scroll border-line bg-surface h-80 overflow-y-auto rounded-lg border p-3 font-mono text-xs leading-relaxed"
            >
              {logs.length === 0 && !isRunning && (
                <p className="text-ink-30">Log output will appear here once a cycle starts.</p>
              )}
              {logs.map((l, i) => (
                <p
                  key={i}
                  className={clsx(
                    l.level === 'error' && 'text-red-400',
                    l.level === 'warn' && 'text-amber-400',
                    (!l.level || l.level === 'info') && 'text-ink-50'
                  )}
                >
                  {l.message}
                </p>
              ))}
            </div>
          </CardBody>
        </Card>

        {complete && (
          <Card>
            <CardHeader className="flex items-center gap-1.5">
              {complete.success ? (
                <CheckCircle2 className="size-4 text-emerald-400" />
              ) : (
                <XCircle className="size-4 text-red-400" />
              )}
              <CardTitle>Cycle {complete.success ? 'complete' : 'finished with issues'}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 pt-3">
              <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-5">
                <Stat label="Done" value={complete.done} />
                <Stat label="Failed" value={complete.failed} />
                <Stat label="Total" value={complete.total} />
                <Stat label="Scored" value={complete.scoredCount} />
                <Stat label="Mentioned" value={complete.mentionedCount} />
              </div>

              <div className="space-y-1.5">
                {Object.entries(complete.engineAudit).map(([name, s]) => (
                  <div
                    key={name}
                    className="bg-surface-2/60 flex items-center justify-between rounded-lg px-3 py-1.5 text-xs"
                  >
                    <span className="text-ink-70 capitalize">{name}</span>
                    <div className="flex items-center gap-2">
                      {s.model && <span className="text-ink-30">{s.model}</span>}
                      <Badge
                        tone={
                          s.status === 'ok'
                            ? 'success'
                            : s.status === 'failed'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {s.ok} ok{s.failed ? ` · ${s.failed} failed` : ''}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {complete.benched.length > 0 && (
                <Alert tone="warning" title="Benched engines">
                  {complete.benched.join(', ')} were skipped for cost-safety reasons this cycle.
                </Alert>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {complete.downloadUrls?.pdf && (

                <a
                  href={`${API_BASE_URL}${complete.publicReportUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand text-sm hover:underline"
                >
                  View full expanded report →
                </a>
              </div>
            </CardBody>
          </Card>
        )}

        {complete && complete.errors.length > 0 && (
          <Alert tone="warning" title={`${complete.errors.length} job error(s) (showing up to 5)`}>
            <pre className="thin-scroll mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-[11px]">
              {JSON.stringify(complete.errors, null, 2)}
            </pre>
          </Alert>
        )}
      </div>
    </div>
  )
}

/** ASCII progress bar for the live console, e.g. [██████░░░░░░░░░░]. */
function renderBar(percent: number, width = 16) {
  const filled = Math.round((Math.max(0, Math.min(100, percent)) / 100) * width)
  return `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}]`
}

/** Small hover/focus hint rendered next to a label. */
function InfoHint({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={text}
        title={text}
        className="text-ink-30 hover:text-ink-50 focus:text-ink-50 ml-1 inline-flex outline-none"
      >
        <HelpCircle className="size-3.5" />
      </button>
      <span className="border-line bg-surface text-ink-70 pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-48 -translate-x-1/2 rounded-lg border p-2 text-[11px] leading-snug opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-ink text-lg font-semibold">{value}</p>
      <p className="text-ink-50 text-[10px]">{label}</p>
    </div>
  )
}
