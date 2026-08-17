import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/auth-context'
import { fetchBlogPosts } from '../lib/blog'
import { BlogCard } from '../components/BlogCard'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

const logo = 'logo.png'

export default function HomePage() {
  const { user, loading } = useAuth()
  useCheckoutRedirect()

  return (
    <div className="bg-ink-950 min-h-screen">
      <SiteHeader user={user} loading={loading} />
      <Hero user={user} loading={loading} />
      <TrustStrip />
      <BlogSection />
      <SiteFooter />
    </div>
  )
}

function CtaButton({
  user,
  loading,
  size = 'md',
}: {
  user: ReturnType<typeof useAuth>['user']
  loading: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  if (loading) return <div className="bg-ink-700 h-9 w-32 animate-pulse rounded-lg" />
  return (
    <Link to={user ? '/dashboard' : '/login'}>
      <Button size={size}>
        {user ? 'Go to Dashboard' : 'Sign Up or Log In'}
        <ArrowRight className="size-3.5" />
      </Button>
    </Link>
  )
}

function SiteHeader({
  user,
  loading,
}: {
  user: ReturnType<typeof useAuth>['user']
  loading: boolean
}) {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex  items-center gap-2">
          <div className=" flex size-12 items-center justify-center rounded-lg">
            <img src={logo} alt="Logo" />
          </div>
          <br />
          <div className="leading-none">
            <p className="text-xl font-semibold text-white">Spotlight Links</p>
            <p className="text-xs font-semibold text-white">Let us spotlight your business</p>
          </div>
        </div>
        <CtaButton user={user} loading={loading} />
      </div>
    </header>
  )
}

function Hero({ user, loading }: { user: ReturnType<typeof useAuth>['user']; loading: boolean }) {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow, matching the ink/violet/cyan palette used across the app */}
      <div className="bg-violet-glow/20 pointer-events-none absolute -left-32 -top-32 size-96 rounded-full blur-[120px]" />
      <div className="bg-cyan-glow/10 pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-2 md:py-28">
        <div>
          <h1 className="text-4xl font-semibold leading-[1.1] text-white sm:text-5xl">
            Welcome to your <span className="gradient-text">AI search visibility</span> console
          </h1>
          <p className="mt-5 max-w-md text-base text-gray-400">
            Find out exactly what ChatGPT, Gemini, Claude, and Perplexity tell customers about your
            business — and fix what's costing you the recommendation.
          </p>
          <div className="mt-7 flex items-center gap-3">
            <CtaButton user={user} loading={loading} size="lg" />
          </div>
        </div>

        <div className="relative flex items-center justify-center md:justify-end">
          <div className="bg-violet-glow/25 pointer-events-none absolute right-0 size-72 rounded-full blur-[100px] md:size-96" />
          <img
            src="/679.png"
            alt=""
            className="relative w-full max-w-[560px] drop-shadow-[0_20px_60px_rgba(139,92,246,0.35)]"
          />
        </div>
      </div>
    </section>
  )
}

function TrustStrip() {
  const items = [
    'AUDIT WITH AI ENGINES',
    'Full cycle in 10 minutes',
    'Every claim carries a source URL',
  ]
  return (
    <div className="border-ink-border bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border-y shadow-lg rounded-lg">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4 text-center text-xs font-semibold text-gray-100 sm:px-6 font-sans tracking-wide">
        {items.map((item) => (
          <span
            key={item}
            className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/20 transition-all duration-300 cursor-pointer"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

const MAX_PILLS = 7

function BlogSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: fetchBlogPosts,
    staleTime: Infinity,
  })

  const topCategories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of posts ?? []) {
      for (const c of post.categories) counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_PILLS)
      .map(([name]) => name)
  }, [posts])

  const filtered = useMemo(() => {
    if (!activeCategory) return posts ?? []
    return (posts ?? []).filter((p) => p.categories.includes(activeCategory))
  }, [posts, activeCategory])

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Explore Spotlight Links insights</h2>
          <p className="text-sm text-gray-500">
            AEO, GEO, and what actually gets a business recommended by AI.
          </p>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={clsx(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition',
              activeCategory === null
                ? 'border-violet-500/50 bg-violet-500/15 text-violet-200'
                : 'border-ink-border bg-ink-800 text-gray-400 hover:text-gray-200'
            )}
          >
            All
          </button>
          {topCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                activeCategory === cat
                  ? 'border-violet-500/50 bg-violet-500/15 text-violet-200'
                  : 'border-ink-border bg-ink-800 text-gray-400 hover:text-gray-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="border-ink-border border-t">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-gray-600 sm:px-6">
        <span>© {new Date().getFullYear()} Spotlight Links LLC</span>
        <span>Quasar Probe — AI search visibility console</span>
      </div>
    </footer>
  )
}

/**
 * xsl-backend's checkout.routes.ts hard-codes its Stripe success_url as
 * `${appBaseUrl}/?checkout_success=true&session_id=...&tier=...` — always
 * root, never `/billing`. That used to land on the dashboard back when this
 * app's dashboard *was* root; now `/` is this public homepage, so a real
 * Stripe checkout would otherwise strand the confirmation query params here
 * where nothing reads them. Rather than duplicate BillingPage's
 * session-status confirmation logic, this just forwards the same params
 * onward to `/billing`, which already knows what to do with them — see
 * docs/08-billing-and-plans.md.
 */
function useCheckoutRedirect() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (params.get('checkout_success') === 'true' || params.get('checkout_canceled') === 'true') {
      navigate(`/billing?${params.toString()}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
