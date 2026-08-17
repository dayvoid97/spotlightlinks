/**
 * Small live indicator backed by GET /api/status (xsl-backend
 * src/server/routes/status.routes.ts). Reports which of the three AI
 * engines have API keys configured on the backend right now — useful at a
 * glance before kicking off a probe cycle that might otherwise silently
 * skip an engine.
 */
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { api } from '../lib/api'
import type { StatusResponse } from '../lib/types'

export function EngineStatusPill() {
  const { data } = useQuery({
    queryKey: ['status'],
    queryFn: () => api.get<StatusResponse>('/api/status'),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })

  if (!data) return null

  const engines: { key: keyof StatusResponse['keys']; label: string }[] = [
    { key: 'gemini', label: 'Gemini' },
    { key: 'anthropic', label: 'Claude' },
    { key: 'perplexity', label: 'Perplexity' },
  ]

  return (
    <div className="hidden items-center gap-3 rounded-full border border-line bg-surface-2/60 px-3 py-1.5 md:flex">
      {engines.map((e) => (
        <div key={e.key} className="flex items-center gap-1.5" title={data.keys[e.key] ? `${e.label} key configured` : `${e.label} key missing`}>
          <span
            className={clsx(
              'size-1.5 rounded-full',
              data.keys[e.key] ? 'bg-emerald-400' : 'bg-gray-600'
            )}
          />
          <span className="text-[11px] text-ink-50">{e.label}</span>
        </div>
      ))}
    </div>
  )
}
