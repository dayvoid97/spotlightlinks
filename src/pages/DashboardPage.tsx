import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { api } from '../lib/api'
import type { ClientSummary } from '../lib/types'
import { ClientCard } from '../components/ClientCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { FullPageSpinner } from '../components/ui/Spinner'
import { Alert } from '../components/ui/Alert'

/**
 * GET /api/clients — see docs/03-client-onboarding.md.
 * Returns every client the signed-in user can see: their ow  n private
 * clients, plus every public showcase client (admins see everything).
 * Each row is enriched server-side with engine health, cycle history, and
 * probe-quota counters, so this page renders straight from the response
 * with no extra requests per card.
 */
export default function DashboardPage() {
  const [query, setQuery] = useState('')
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.get<{ clients: ClientSummary[] }>('/api/clients'),
  })

  const filtered = useMemo(() => {
    const list = data?.clients ?? []
    if (!query.trim()) return list
    const q = query.toLowerCase()
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.slug.includes(q) || c.city?.toLowerCase().includes(q)
    )
  }, [data, query])

  if (isLoading) return <FullPageSpinner label="Loading managed assets…" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink text-xl font-bold">Managed assets</h1>
          <p className="text-ink-50 text-sm">Businesses you're probing for AI search visibility.</p>
        </div>
        <Link to="/clients/new">
          <Button>
            <Plus className="size-4" /> New client
          </Button>
        </Link>
      </div>

      {error && <Alert tone="error">Could not load clients. Is xsl-backend running?</Alert>}

      {(data?.clients?.length ?? 0) > 0 && (
        <div className="relative max-w-sm">
          <Search className="text-ink-30 absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, slug, or city…"
            className="pl-9"
          />
        </div>
      )}

      {data?.clients?.length === 0 && (
        <div className="border-line flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <p className="text-ink-50">No managed assets yet.</p>
          <Link to="/clients/new">
            <Button>
              <Plus className="size-4" /> Onboard your first client
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  )
}
