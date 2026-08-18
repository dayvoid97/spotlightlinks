import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/auth-context'
import { fetchBlogPosts } from '../lib/blog'
import { BlogCard } from '../components/BlogCard'
import { BrandLockup } from '../components/BrandLockup'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { TrustStrip } from '../components/TrustStrip'
import { PricingSection } from '../components/marketing/PricingSection'
import { FaqSection } from '../components/marketing/FaqSection'
import { Differentiators } from '../components/marketing/Differentiators'

export default function HomePage() {
  const { user, loading } = useAuth()
  useCheckoutRedirect()
  useHashScroll()

  return (
    <div className="bg-surface min-h-screen">
      <SiteHeader user={user} loading={loading} />
      <Hero user={user} loading={loading} />
      <TrustStrip />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-16 sm:py-20">
          <PricingSection />
        </div>
        <div className="border-line border-t py-16 sm:py-20">
          <ComparisonTeaser />
        </div>
        <div className="border-line border-t py-16 sm:py-20">
          <FaqSection />
        </div>
      </div>

      <BlogSection />
      <SiteFooter />
    </div>
  )
}

function ComparisonTeaser() {
  return (
    <section>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-brand text-xs font-semibold uppercase tracking-[0.14em]">
          Why Spotlight Links
        </p>
        <h2 className="text-ink mt-2 text-3xl font-semibold sm:text-4xl">
          VALUE PROPOSITION: PURPOSE BUILT WITH NEW YORK CITY IN MIND
        </h2>
        <p className="text-ink-50 mx-auto mt-3 max-w-2xl">
          Spotlight Links is a AI-native venture studio building state of the art AEO and GEO
          technology from the ground up. HERE IS OUR VALUE PROPOSIITON
        </p>
      </div>

      <div className="mt-10">
        <Differentiators />
      </div>

      <div className="mt-8 flex justify-center">
        <Link to="/compare">
          <Button variant="secondary" size="lg">
            See the full comparison <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}

/** Smooth-scroll to an in-page section when the URL carries a #hash (e.g. /#pricing). */
function useHashScroll() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }))
  }, [hash])
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
  if (loading) return <div className="bg-surface-2 h-9 w-28 animate-pulse rounded-lg" />
  return (
    <Link to={user ? '/dashboard' : '/get-started'}>
      <Button size={size}>
        {user ? (
          'Go to Dashboard'
        ) : (
          <>
            {/* Full label on wider screens, trimmed on mobile so it never wraps. */}
            <span className="sm:hidden">Get started</span>
            <span className="hidden sm:inline">Click Here To Get Started</span>
          </>
        )}
        <ArrowRight className="size-3.5 shrink-0" />
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
        <BrandLockup />
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <nav className="mr-1 hidden items-center gap-4 md:flex">
            <a href="#pricing" className="text-ink-50 hover:text-ink text-sm font-medium">
              Pricing
            </a>
            <Link to="/compare" className="text-ink-50 hover:text-ink text-sm font-medium">
              Compare
            </Link>
            <Link to="/blog" className="text-ink-50 hover:text-ink text-sm font-medium">
              Blog
            </Link>
          </nav>
          <ThemeToggle />
          {!loading && !user && (
            <Link
              to="/login"
              className="text-ink-50 hover:text-ink hidden whitespace-nowrap text-sm font-medium sm:inline"
            >
              Log in
            </Link>
          )}
          <CtaButton user={user} loading={loading} />
        </div>
      </div>
    </header>
  )
}

function Hero({ user, loading }: { user: ReturnType<typeof useAuth>['user']; loading: boolean }) {
  return (
    <section className="relative overflow-hidden bg-slate-950/5 py-12 sm:py-20">
      {/* Ambient glowing background accents */}
      <div className="bg-emerald-500/15 pointer-events-none absolute -left-32 -top-32 size-[28rem] rounded-full blur-[128px]" />
      <div className="bg-red-500/10 pointer-events-none absolute -bottom-32 -right-32 size-[28rem] rounded-full blur-[128px]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/20 bg-emerald-50/50 px-3.5 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-sm dark:bg-emerald-950/30 dark:text-emerald-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Next-Gen AI Growth Suite
          </div>

          {/* Main Heading */}
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl sm:leading-tight dark:text-slate-100">
            Spotlight Links is{' '}
            <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
              THE AI TOOLKIT
            </span>{' '}
            for growing your business.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Enhance your presence, recommendations, and growth across modern AI search engines.
          </p>

          {/* Call to Action Container */}
          <div className="mt-10 flex flex-col items-center gap-3 w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Enter your business name &amp; zip code to begin
            </p>

            <div className="mt-1 flex w-full justify-center">
              <CtaButton user={user} loading={loading} size="lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
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
          <h2 className="text-ink text-xl font-semibold">Explore Spotlight Links insights</h2>
          <p className="text-ink-50 text-sm">
            AEO, GEO, and what actually gets a business recommended by AI.
          </p>
        </div>
        <Link
          to="/blog"
          className="text-brand flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
        >
          View all posts <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {topCategories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={clsx(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition',
              activeCategory === null
                ? 'border-brand bg-brand-tint text-brand'
                : 'border-line bg-surface-2 text-ink-50 hover:text-ink'
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
                  ? 'border-brand bg-brand-tint text-brand'
                  : 'border-line bg-surface-2 text-ink-50 hover:text-ink'
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
          {filtered.slice(0, 6).map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="border-line border-t">
      <div className="text-ink-30 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs sm:px-6">
        <span>© {new Date().getFullYear()} Spotlight Links LLC</span>
        <span> Answer Engine and Generative Engine Visibility Discovery & Management Console</span>
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
