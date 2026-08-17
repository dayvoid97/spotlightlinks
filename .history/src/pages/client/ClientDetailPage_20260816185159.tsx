import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, Globe2, Lock, MapPin } from 'lucide-react'
import clsx from 'clsx'
import { api } from '../../lib/api'
import { API_BASE_URL } from '../../lib/api'
import type { ClientFile, ClientSummary, Prompt } from '../../lib/types'
import { FullPageSpinner } from '../../components/ui/Spinner'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'

import OverviewTab from './tabs/OverviewTab'
import ProbeTab from './tabs/ProbeTab'
import MediaTab from './tabs/MediaTab'
import FactsTab from './tabs/FactsTab'
import AssetsTab from './tabs/AssetsTab'
import ReportsTab from './tabs/ReportsTab'
import SettingsTab from './tabs/SettingsTab'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'probe', label: 'Probe' },
  { key: 'reports', label: 'Reports' },
  { key: 'facts', label: 'Facts' },
  { key: 'assets', label: 'Assets' },
  { key: 'media', label: 'Media' },
  { key: 'settings', label: 'Settings' },
] as const

type TabKey = typeof TABS[number]['key']

export interface ClientDetailResponse {
  client: ClientSummary & { lastProbedAt: string | null }
  prompts: Prompt[]
  fileContent: ClientFile | null
  publicReportUrl: string
}

/** GET /api/clients/:slug — the shell every tab on this page reads from. */
export default function ClientDetailPage() {
  const { slug = '' } = useParams()
  const [tab, setTab] = useState<TabKey>('overview')

  const query = useQuery({
    queryKey: ['client', slug],
    queryFn: () => api.get<ClientDetailResponse>(`/api/clients/${slug}`),
  })

  if (query.isLoading) return <FullPageSpinner label={`Loading ${slug}…`} />
  if (query.error || !query.data) return <Alert tone="error">Could not load this client.</Alert>

  const { client, prompts, fileContent, publicReportUrl } = query.data

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard"
        className="text-ink-50 hover:text-ink-70 flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" /> Dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {client.logoUrl ? (
            <div className="bg-surface-2 text-ink-50 flex size-12 items-center justify-center rounded-xl text-sm font-semibold">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
          ) : (
            <div className="bg-surface-2 text-ink-50 flex size-12 items-center justify-center rounded-xl text-sm font-semibold">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-ink text-xl font-semibold">{client.name}</h1>
              {client.isPublic ? (
                <Badge tone="info">
                  <Globe2 className="size-3" /> Public
                </Badge>
              ) : (
                <Badge tone="neutral">
                  <Lock className="size-3" /> Private
                </Badge>
              )}
            </div>
            {(client.city || client.state || client.domain) && (
              <p className="text-ink-50 flex items-center gap-1.5 text-sm">
                {(client.city || client.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />{' '}
                    {[client.city, client.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {client.domain && <span>· {client.domain}</span>}
              </p>
            )}
          </div>
        </div>

        <a
          href={`${API_BASE_URL}${publicReportUrl}`}
          target="_blank"
          rel="noreferrer"
          className="border-line bg-surface-2 text-ink-70 hover:bg-surface-2 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm"
        >
          Public report <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div className="border-line flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition',
              tab === t.key
                ? 'border-brand text-ink'
                : 'text-ink-50 hover:text-ink-70 border-transparent'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'overview' && (
          <OverviewTab client={client} prompts={prompts} fileContent={fileContent} />
        )}
        {tab === 'probe' && <ProbeTab client={client} />}
        {tab === 'reports' && <ReportsTab client={client} />}
        {tab === 'facts' && <FactsTab client={client} />}
        {tab === 'assets' && <AssetsTab client={client} />}
        {tab === 'media' && <MediaTab client={client} />}
        {tab === 'settings' && <SettingsTab client={client} />}
      </div>
    </div>
  )
}
