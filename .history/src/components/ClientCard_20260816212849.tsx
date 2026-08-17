import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Globe2, Lock, MapPin, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { Card, CardBody } from './ui/Card'
import { Badge } from './ui/Badge'
import type { ClientSummary } from '../lib/types'

const engineLabel: Record<string, string> = {
  gemini: 'Gemini',
  anthropic: 'Claude',
  perplexity: 'Perplexity',
}

export function ClientCard({ client }: { client: ClientSummary }) {
  const mentionRate =
    client.totalRuns > 0 ? Math.round((client.validRuns / client.totalRuns) * 100) : null

  return (
    <Link to={`/clients/${client.slug}`}>
      <Card className="group hover:border-brand hover:bg-surface-2 h-full transition">
        <CardBody className="flex h-full flex-col gap-3 pt-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {client.logoUrl ? (
                <img
                  src={client.logoUrl}
                  alt=""
                  className="size-9 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="bg-surface-2 text-ink-50 flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-ink truncate text-sm font-semibold">{client.name}</p>
                {(client.city || client.state) && (
                  <p className="text-ink-50 flex items-center gap-1 truncate text-xs">
                    <MapPin className="size-3" />
                    {[client.city, client.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
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

          <div className="flex flex-wrap gap-1.5">
            {(['gemini', 'anthropic', 'perplexity'] as const).map((eng) => {
              const status = client.engineCoverage?.[eng] ?? 'missing'
              return (
                <span
                  key={eng}
                  className={clsx(
                    'flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                    status === 'ok' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                    status === 'failed' && 'border-red-500/30 bg-red-500/10 text-red-400',
                    status === 'missing' && 'border-line bg-surface-2 text-ink-50'
                  )}
                >
                  <span
                    className={clsx(
                      'size-1.5 rounded-full',
                      status === 'ok' && 'bg-emerald-400',
                      status === 'failed' && 'bg-red-400',
                      status === 'missing' && 'bg-gray-600'
                    )}
                  />
                  {engineLabel[eng]}
                </span>
              )
            })}
          </div>

          <div className="border-line mt-auto grid grid-cols-3 gap-2 border-t pt-3 text-center">
            <div>
              <p className="text-ink text-sm font-semibold">{client.promptCount}</p>
              <p className="text-ink-50 text-[10px]">prompts</p>
            </div>
            <div>
              <p className="text-ink text-sm font-semibold">
                {mentionRate !== null ? `${mentionRate}%` : '—'}
              </p>
              <p className="text-ink-50 text-[10px]">valid runs</p>
            </div>
            <div>
              <p className="text-ink text-sm font-semibold">{client.probesToday}/2</p>
              <p className="text-ink-50 text-[10px]">today</p>
            </div>
          </div>

          <p className="text-ink-30 text-[11px]">
            {client.lastProbedAt ? (
              <>
                Last probed{' '}
                {formatDistanceToNow(new Date(client.lastProbedAt), { addSuffix: true })}
              </>
            ) : (
              <span className="text-brand flex items-center gap-1">
                <Sparkles className="size-3" /> Never probed — run the first cycle
              </span>
            )}
          </p>
        </CardBody>
      </Card>
    </Link>
  )
}
