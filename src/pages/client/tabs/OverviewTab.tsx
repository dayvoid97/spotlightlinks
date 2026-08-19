import { useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Save, Plus, Trash2, ChevronDown, RefreshCw } from 'lucide-react'
import { api, ApiError } from '../../../lib/api'
import type { ClientFile, ClientSummary, Prompt } from '../../../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input, Label, Textarea } from '../../../components/ui/Input'
import { Badge } from '../../../components/ui/Badge'
import { Alert } from '../../../components/ui/Alert'
import { useToast } from '../../../context/toast-context'

interface Props {
  client: ClientSummary
  prompts: Prompt[]
  fileContent: ClientFile | null
}

/**
 * POST /api/clients/:slug/config — updates competitors, aliases, and
 * locales for an already-onboarded client. Owner-only (403 otherwise).
 * Prompt-set replacement is also part of this endpoint's contract
 * (`prompts` array) but isn't exposed here — see docs/03-client-onboarding.md
 * for why the UI keeps to the three list fields that change most often.
 *
 * The prompt set instead has its own control: POST /:slug/prompts/regenerate
 * re-runs the question generator, so an owner who doesn't like the questions
 * they were given can ask for a different set (optionally saying what it
 * should focus on) rather than living with the first draft forever.
 */
export default function OverviewTab({ client, prompts, fileContent }: Props) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [competitors, setCompetitors] = useState((fileContent?.competitors ?? client.competitors ?? []).join(', '))
  const [aliases, setAliases] = useState((fileContent?.aliases ?? client.aliases ?? []).join(', '))
  const [locales, setLocales] = useState((fileContent?.locales as string[] | undefined)?.join(', ') ?? '')
  const [domain, setDomain] = useState(fileContent?.domain ?? client.domain ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newPrompt, setNewPrompt] = useState('')
  const [addingPrompt, setAddingPrompt] = useState(false)
  const [regenOpen, setRegenOpen] = useState(false)
  const [guidance, setGuidance] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [regenError, setRegenError] = useState<string | null>(null)

  const canManage = client.isOwner
  const customerPrompts = prompts.filter((p) => p.source === 'customer_suggest')

  async function addPrompt() {
    const text = newPrompt.trim()
    if (!text) return
    setAddingPrompt(true)
    try {
      await api.post(`/api/clients/${client.slug}/prompts`, { text })
      setNewPrompt('')
      toast.push('Prompt added — it will be probed first on the next cycle.')
      queryClient.invalidateQueries({ queryKey: ['client', client.slug] })
    } catch (err) {
      toast.push(err instanceof ApiError ? err.message : 'Could not add prompt.', 'error')
    } finally {
      setAddingPrompt(false)
    }
  }

  async function removePrompt(id: string) {
    try {
      await api.delete(`/api/clients/${client.slug}/prompts/${id}`)
      toast.push('Prompt removed.')
      queryClient.invalidateQueries({ queryKey: ['client', client.slug] })
    } catch (err) {
      toast.push(err instanceof ApiError ? err.message : 'Could not remove prompt.', 'error')
    }
  }

  /**
   * One LLM call server-side, so it's slow (tens of seconds) — the button
   * stays in its loading state rather than optimistically closing the panel.
   * The old questions are retired, not deleted, so nothing already measured
   * is lost and the customer's own prompts stay exactly where they are.
   */
  async function regenerate() {
    setRegenerating(true)
    setRegenError(null)
    try {
      const res = await api.post<{ promptCount: number }>(
        `/api/clients/${client.slug}/prompts/regenerate`,
        guidance.trim() ? { guidance: guidance.trim() } : {}
      )
      setRegenOpen(false)
      setGuidance('')
      toast.push(`New question set ready — ${res.promptCount} questions across your markets.`)
      queryClient.invalidateQueries({ queryKey: ['client', client.slug] })
    } catch (err) {
      setRegenError(err instanceof ApiError ? err.message : 'Could not build a new question set.')
    } finally {
      setRegenerating(false)
    }
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      await api.post(`/api/clients/${client.slug}/config`, {
        competitors: split(competitors),
        aliases: split(aliases),
        locales: split(locales),
        domain: domain.trim(),
      })
      toast.push('Configuration saved.')
      queryClient.invalidateQueries({ queryKey: ['client', client.slug] })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save configuration.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Business configuration</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 pt-3">
            {error && <Alert tone="error">{error}</Alert>}
            {/*
              A client onboarded before the intake form had a Website field has
              no domain, and detect.ts scores `cited` false on every run without
              one — so the report shows a 0% citation rate that is a gap in the
              intake rather than a fact about the business.
            */}
            <div>
              <Label htmlFor="domain">Website</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="glorymma.com"
              />
              {!domain.trim() && (
                <p className="mt-1.5 text-[11px] text-amber-400/80">
                  No website on file — citation rate will read 0% until one is set, however often
                  engines link to this business.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="competitors">Competitors</Label>
              <Input id="competitors" value={competitors} onChange={(e) => setCompetitors(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="aliases">Aliases (alternate names an engine might use)</Label>
              <Input id="aliases" value={aliases} onChange={(e) => setAliases(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="locales">Target locales</Label>
              <Input id="locales" value={locales} onChange={(e) => setLocales(e.target.value)} placeholder="Edmond, OK; Norman, OK" />
            </div>
            <Button onClick={save} loading={saving}>
              <Save className="size-3.5" /> Save configuration
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <CardTitle>Prompt set ({prompts.length})</CardTitle>
            {canManage && !regenOpen && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRegenError(null)
                  setRegenOpen(true)
                }}
              >
                <RefreshCw className="size-3.5" /> New question set
              </Button>
            )}
          </CardHeader>
          <CardBody className="space-y-4 pt-3">
            {canManage && regenOpen && (
              <div className="space-y-3 rounded-lg border border-brand/30 bg-brand-tint/20 p-3.5">
                <p className="text-[13px] text-ink-70">
                  Not the questions you'd ask? Generate a fresh set from your business details.
                </p>
                <div>
                  <Label htmlFor="regen-guidance">
                    What should the new set focus on? (optional)
                  </Label>
                  <Textarea
                    id="regen-guidance"
                    rows={3}
                    value={guidance}
                    onChange={(e) => setGuidance(e.target.value)}
                    disabled={regenerating}
                    placeholder="e.g. fewer price questions, more about catering and large orders — and cover walk-in availability"
                  />
                </div>
                {regenError && <Alert tone="error">{regenError}</Alert>}
                <ul className="space-y-1 text-[11px] text-ink-50">
                  <li>Your own prompts above are kept, and stay first in every cycle.</li>
                  <li>
                    Questions that drop out are retired, not deleted — everything already probed
                    stays in your reports.
                  </li>
                  <li>Your markets, competitors and aliases are left as they are.</li>
                </ul>
                <div className="flex items-center gap-2">
                  <Button onClick={regenerate} loading={regenerating}>
                    <RefreshCw className="size-3.5" /> Generate new set
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setRegenOpen(false)}
                    disabled={regenerating}
                  >
                    Cancel
                  </Button>
                  {regenerating && (
                    <span className="text-[11px] text-ink-50">
                      Writing questions — this can take up to a minute.
                    </span>
                  )}
                </div>
              </div>
            )}

            {canManage && (
              <div>
                <Label htmlFor="new-prompt">Add your own prompt</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-prompt"
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addPrompt()}
                    placeholder="e.g. best halal döner near Sunnyside"
                  />
                  <Button onClick={addPrompt} loading={addingPrompt} disabled={!newPrompt.trim()}>
                    <Plus className="size-3.5" /> Add
                  </Button>
                </div>
                <p className="mt-1.5 text-[11px] text-ink-30">
                  Your prompts are probed first every cycle, ahead of the generated set.
                </p>
              </div>
            )}

            {customerPrompts.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand">
                  Your prompts · {customerPrompts.length}
                  <Badge tone="violet">probed first</Badge>
                </p>
                <ul className="space-y-1.5">
                  {customerPrompts.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-brand/30 bg-brand-tint/20 px-3 py-2 text-sm text-ink-70"
                    >
                      <span>
                        {p.text}
                        <span className="ml-2 text-xs text-ink-30">({p.locale})</span>
                      </span>
                      {canManage && (
                        <button
                          onClick={() => removePrompt(p.id)}
                          className="shrink-0 text-ink-30 hover:text-red-400"
                          aria-label="Remove prompt"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prompts.length === 0 ? (
              <p className="text-sm text-ink-50">No prompts generated yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(
                  groupBy(
                    dedupePrompts(prompts.filter((p) => p.source !== 'customer_suggest')),
                    (p) => p.intent
                  )
                ).map(([intent, list]) => (
                  <PromptGroup key={intent} intent={intent} list={list} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>At a glance</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 pt-3 text-sm">
            <Row label="Slug" value={client.slug} />
            <Row label="Subscription" value={<Badge tone="neutral">{client.subscriptionStatus}</Badge>} />
            <Row label="Total probe runs" value={String(client.totalRuns)} />
            <Row label="Valid runs" value={String(client.validRuns)} />
            <Row label="Media assets" value={String(client.mediaCount)} />
            <Row label="Config saved" value={client.hasConfig ? 'Yes' : 'No'} />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

/** Collapsible intent group. Starts collapsed since a set can run to dozens. */
function PromptGroup({ intent, list }: { intent: string; list: Prompt[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-line bg-surface-2/30">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="text-xs font-medium uppercase tracking-wide text-ink-50">
          {intent.replace(/_/g, ' ')} · {list.length}
        </span>
        <ChevronDown
          className={`size-3.5 text-ink-30 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul className="space-y-1.5 border-t border-line px-3 py-2.5">
          {list.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-line bg-surface-2/50 px-3 py-2 text-sm text-ink-70"
            >
              {p.text}
              <span className="ml-2 text-xs text-ink-30">({p.locale})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Drop exact-duplicate prompts (same text + locale). */
function dedupePrompts(list: Prompt[]): Prompt[] {
  const seen = new Set<string>()
  const out: Prompt[] = []
  for (const p of list) {
    const key = `${p.text.trim().toLowerCase()}@${p.locale.trim().toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(p)
  }
  return out
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-50">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}

function split(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((v) => v.trim())
    .filter(Boolean)
}

function groupBy<T, K extends string>(list: T[], fn: (item: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>
  for (const item of list) {
    const key = fn(item)
    if (!out[key]) out[key] = []
    out[key].push(item)
  }
  return out
}
