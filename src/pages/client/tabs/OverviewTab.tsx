import { useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { api, ApiError } from '../../../lib/api'
import type { ClientFile, ClientSummary, Prompt } from '../../../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input, Label } from '../../../components/ui/Input'
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
 */
export default function OverviewTab({ client, prompts, fileContent }: Props) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [competitors, setCompetitors] = useState((fileContent?.competitors ?? client.competitors ?? []).join(', '))
  const [aliases, setAliases] = useState((fileContent?.aliases ?? client.aliases ?? []).join(', '))
  const [locales, setLocales] = useState((fileContent?.locales as string[] | undefined)?.join(', ') ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    try {
      await api.post(`/api/clients/${client.slug}/config`, {
        competitors: split(competitors),
        aliases: split(aliases),
        locales: split(locales),
      })
      toast.push('Configuration saved.')
      queryClient.invalidateQueries({ queryKey: ['client', client.slug] })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save configuration.')
    } finally {
      setSaving(false)
    }
  }

  const promptsByIntent = groupBy(prompts, (p) => p.intent)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Business configuration</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 pt-3">
            {error && <Alert tone="error">{error}</Alert>}
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
          <CardHeader>
            <CardTitle>Prompt set ({prompts.length})</CardTitle>
          </CardHeader>
          <CardBody className="pt-3">
            {prompts.length === 0 ? (
              <p className="text-sm text-ink-50">No prompts generated yet.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(promptsByIntent).map(([intent, list]) => (
                  <div key={intent}>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-50">
                      {intent.replace(/_/g, ' ')} · {list.length}
                    </p>
                    <ul className="space-y-1.5">
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
                  </div>
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
