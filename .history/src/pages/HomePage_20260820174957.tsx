import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Building2,
  MapPin,
  Sparkles,
  ShieldCheck,
  FileText,
  Loader2,
  Search,
  Network,
  Rocket,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/auth-context'
import { useBlogReaderMode } from '../context/blog-reader-context'
import { MachinePageView, type PageMachineMetadata } from '../components/MachinePageView'
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

import { QueensBanner } from '../components/marketing/QueensBanner'
import {
  applySynthesizedIntake,
  buildStoryText,
  saveOnboardingDraft,
  emptyOnboardingForm,
} from '../lib/onboarding-draft'
import { api } from '../lib/api'
import type { SynthesizedIntake } from '../lib/types'
import { SERVICES, DEPLOYMENT_NOTE, SERVICE_AREA } from '../lib/marketing'

const homepageMachineMetadata: PageMachineMetadata = {
  path: '/',
  title: 'Spotlight Links — Answer Engine & Generative Engine Optimization',
  h1: 'A customer is searching nearby. Is your business being recommended?',
  description:
    'Spotlight Links probes ChatGPT, Google Gemini, Anthropic Claude, and Perplexity with 300+ live calls per audit to measure and improve your business AI recommendations.',
  canonical: 'https://spotlightlinks.com/',
  schemas: ['Organization', 'LocalBusiness', 'WebPage', 'Service', 'OfferCatalog'],
  summary: `Spotlight Links provides Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) for local and brick-and-mortar businesses, with customers concentrated in Queens, New York City. We measure whether a business is recommended in Google Search results and in AI assistant answers for the buying questions customers ask in its own neighborhood, running 300+ live serial probes across ChatGPT, Gemini, Claude, and Perplexity per audit cycle and reporting 95% Wilson-score confidence scorecards. Entry pricing is $79/month Starter Prober.`,
  sections: [
    {
      title: 'Service Area',
      content: `${SERVICE_AREA.blurb}\nNeighborhoods served: ${SERVICE_AREA.neighborhoods.join(
        ', '
      )}.\nEvery audit is geo-scoped to the client's own ZIP code, service radius, and adjacent markets rather than national keyword rankings.`,
    },
    {
      title: 'AI Visibility Audit & Profile Builder',
      content: `Enter your business name, ZIP code, and a 1-2 sentence bio to trigger a live multi-engine AI audit across ChatGPT, Gemini, Claude, and Perplexity.`,
    },
    {
      title: 'Pricing & Subscription Tiers',
      content: `- Starter Prober ($79/mo): 2 managed assets, up to 4 audits/month across all 4 AI engines. Ideal entry tier for local businesses.\n- Growth ($199/mo): Expansion for multiple locations and markets.\n- Scale ($299/mo): Unlimited managed assets for agencies & enterprise brands.\n- Enterprise ($599/mo): Adds done-for-you AEO content, schema, FAQs, and citation packets.`,
    },
    {
      title: 'Why Spotlight Links vs Legacy SEO Tools',
      content: `Legacy SEO tools like Semrush, Ahrefs, and SimilarWeb monitor Google 10 blue links. Spotlight Links is purpose-built for AEO/GEO: running 300+ live serial API probes across LLMs, scoring #1 recommendation share, tracking citation links, and outputting machine-readable context packets.`,
    },
    {
      title: 'Frequently Asked Questions',
      content: `Q: How is AEO different from traditional SEO?\nA: SEO ranks web pages on Google. AEO optimizes how large language models (ChatGPT, Gemini, Claude, Perplexity) describe and recommend your business entity in direct conversational answers.\n\nQ: What is included in the $79 Starter Prober?\nA: 2 managed assets, 4 automated audits/mo, live probe execution, competitor leaderboard, AI SWOT analysis, and exportable reports.`,
    },
  ],
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const { isMachine } = useBlogReaderMode()
  useCheckoutRedirect()
  useHashScroll()

  return (
    <div className="bg-surface min-h-screen">
      <SiteHeader user={user} loading={loading} />

      {isMachine ? (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <MachinePageView meta={homepageMachineMetadata} filename="spotlight-links-home.md" />
        </div>
      ) : (
        <>
          <Hero loading={loading} />
          <QueensBanner />
          <TrustStrip />

          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="py-16 sm:py-20">
              <PricingSection />
            </div>
            <div className="border-line border-t py-16 sm:py-20">
              <ComparisonTeaser />
            </div>
            <div className="border-line border-t py-16 sm:py-20">
              <ServicesSection />
            </div>
            <div className="border-line border-t py-16 sm:py-20">
              <FaqSection />
            </div>
          </div>

          <BlogSection />
        </>
      )}

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
          Built for AI answers, from New York, from the ground up
        </h2>
        <p className="text-ink-50 mx-auto mt-3 max-w-2xl">
          Spotlight Links is an AI-native studio building AEO and GEO tooling ourselves rather than
          bolting an AI tab onto an SEO suite. Here is what that buys you.
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

/**
 * The three services, with deployment given real estate rather than a footnote
 * — it is the half of the business the homepage never mentioned, so nobody
 * (human or model) knew we launch the platform as well as optimize it.
 */
function ServicesSection() {
  const serviceIcons = [Search, Network, Rocket]

  return (
    <section id="services">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-brand text-xs font-semibold uppercase tracking-[0.14em]">What we do</p>
        <h2 className="text-ink mt-2 text-3xl font-semibold sm:text-4xl">
          Get found. Get recommended. Get online properly.
        </h2>
        <p className="text-ink-50 mx-auto mt-3 max-w-2xl">
          The first two make sure people hear your name when they search for what you sell. The
          third is for when your website is broken, out of date, or was never really finished.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {SERVICES.map((service, i) => {
          const Icon = serviceIcons[i % serviceIcons.length]
          const isDeployment = service.slug === 'platform-development-and-deployment'
          return (
            <Link
              key={service.slug}
              to={`/about#${service.slug}`}
              className={clsx(
                'group rounded-2xl border p-6 transition',
                isDeployment
                  ? 'border-brand bg-brand-tint hover:border-brand-dark'
                  : 'border-line bg-surface hover:border-ink-30'
              )}
            >
              <div className="bg-brand text-white flex size-10 items-center justify-center rounded-lg">
                <Icon className="size-5" />
              </div>
              <h3 className="text-ink mt-4 text-lg font-semibold">
                {service.name}
                {service.abbr && (
                  <span className="text-ink-30 ml-2 font-mono text-xs">{service.abbr}</span>
                )}
              </h3>
              <p className="text-ink-50 mt-2 text-sm leading-relaxed">{service.plain}</p>
              <span className="text-brand mt-4 flex items-center gap-1 text-sm font-medium">
                Learn more
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          )
        })}
      </div>

      <p className="text-ink-30 mx-auto mt-6 max-w-2xl text-center text-xs">{DEPLOYMENT_NOTE}</p>
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
            <span className="hidden sm:inline">Get started</span>
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
            <Link to="/about" className="text-ink-50 hover:text-ink text-sm font-medium">
              About
            </Link>
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

function Hero({ loading }: { loading: boolean }) {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="bg-brand/20 pointer-events-none absolute -left-24 -top-32 size-96 rounded-full blur-[120px]" />
      <div className="bg-accent/10 pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full blur-[120px]" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 ">
        <div className="flex max-w-3xl flex-col items-center">
          <h1>Is your business recommended when a customer is searching nearby ?</h1>
          <br />

          <h5>
            Your customers ask AI everyday for local recommendations. Discover whether or not your
            business shows up in their answers and recommendations.
          </h5>
          <br />
          <p>Fill out the form, run your first probe, BE AMAZED!</p>

          <div className="mt-4 w-full max-w-2xl">
            <HeroInteractiveInput loading={loading} />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroInteractiveInput({ loading }: { loading: boolean }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [businessName, setBusinessName] = useState('')
  const [zip, setZip] = useState('')
  const [bio, setBio] = useState('')
  const [synthesizing, setSynthesizing] = useState(false)

  /**
   * Straight from this box to the synthesizer, then on to the full intake with
   * every field already filled in.
   *
   * What used to sit in between was a glassmorphic drawer that re-asked for the
   * same three fields before running the same POST /api/clients/synthesize-bio.
   * Nothing about it was load-bearing: the call only needs the story text this
   * form already has. So we make the call here, fold the returned JSON into the
   * parked draft with `applySynthesizedIntake`, and let /get-started (or
   * /clients/new, for someone already signed in) rehydrate a populated form.
   *
   * The seed draft is saved *before* the request so a failed or slow synthesis
   * never costs someone what they typed. If the call fails we navigate anyway —
   * ClientOnboardingForm's own auto-draft (`needsSynthesis`) retries on arrival,
   * and a fabricated bio is never substituted for a real one.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (synthesizing) return

    const trimmedName = businessName.trim()
    const trimmedZip = zip.trim()
    const trimmedBio = bio.trim()

    // Same phrasing every other caller uses, so synthesize-bio sees one
    // consistent description of a business no matter which box it came from.
    const seed = {
      ...emptyOnboardingForm,
      businessName: trimmedName,
      zip: trimmedZip,
      description: trimmedBio,
    }
    const draft = { ...seed, storyText: buildStoryText(seed) }
    saveOnboardingDraft(draft)

    setSynthesizing(true)
    try {
      const res = await api.post<{ synthesized?: SynthesizedIntake }>(
        '/api/clients/synthesize-bio',
        { storyText: draft.storyText }
      )
      // Keep the whole intake the model worked out — categories, competitors,
      // website, founding year, highlights — not just the description.
      if (res?.synthesized) {
        saveOnboardingDraft(applySynthesizedIntake(draft, res.synthesized))
      }
    } catch {
      /* keep the typed seed; the intake form retries synthesis on arrival */
    } finally {
      setSynthesizing(false)
    }

    navigate(user ? '/clients/new' : '/get-started')
  }

  function handleManualOnboarding() {
    const trimmedName = businessName.trim()
    const trimmedZip = zip.trim()
    const trimmedBio = bio.trim()

    if (trimmedName || trimmedZip || trimmedBio) {
      const seed = {
        ...emptyOnboardingForm,
        businessName: trimmedName,
        zip: trimmedZip,
        description: trimmedBio,
      }
      saveOnboardingDraft({ ...seed, storyText: buildStoryText(seed) })
    }

    const targetRoute = user ? '/clients/new' : '/get-started'
    navigate(targetRoute)
  }

  if (loading) return <div className="bg-surface-2 h-14 w-full animate-pulse rounded-xl" />

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="glass-panel group border-line/80 bg-surface-raised/90 flex flex-col gap-3 rounded-2xl p-4 shadow-2xl transition-all border backdrop-blur-md"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Building2 className="text-ink-30 group-focus-within:text-brand absolute left-3.5 top-1/2 size-4 -translate-y-1/2 transition-colors" />
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business Name (e.g. Acme Roasters)"
              required
              className="text-ink placeholder:text-ink-30 bg-surface/70 border-line/50 focus:border-brand w-full rounded-xl py-3 pl-10 pr-3 text-sm font-medium outline-none border transition-colors sm:text-base"
            />
          </div>

          <div className="relative">
            <MapPin className="text-ink-30 group-focus-within:text-brand absolute left-3.5 top-1/2 size-4 -translate-y-1/2 transition-colors" />
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="ZIP Code"
              maxLength={10}
              required
              className="text-ink placeholder:text-ink-30 bg-surface/70 border-line/50 focus:border-brand w-full rounded-xl py-3 pl-10 pr-3 text-sm font-medium outline-none border transition-colors sm:text-base"
            />
          </div>
        </div>

        <div className="relative">
          <Sparkles className="text-ink-30 group-focus-within:text-brand absolute left-3.5 top-3 size-4 transition-colors" />
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Please provide one sentence or two about your business..."
            className="text-ink placeholder:text-ink-30 bg-surface/70 border-line/50 focus:border-brand w-full rounded-xl py-2.5 pl-10 pr-3 text-sm font-medium outline-none border transition-colors resize-none sm:text-base"
          />
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-1">
          <button
            type="submit"
            disabled={synthesizing}
            className="group/btn from-brand to-brand-dark shadow-brand/25 hover:shadow-brand/40 relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover/btn:opacity-100" />
            {synthesizing ? (
              <>
                <Loader2 className="size-4 shrink-0 animate-spin" />
                <span>Reading up on your business…</span>
              </>
            ) : (
              <>
                <Sparkles className="text-accent size-4 shrink-0" />
                <span>Check my AI visibility</span>
                <ArrowRight className="size-4 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleManualOnboarding}
            disabled={synthesizing}
            className="text-ink-50 hover:text-ink hover:underline flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 transition-colors disabled:opacity-50"
          >
            <FileText className="text-brand size-3.5" />
            <span>I Prefer Manual Onboarding</span>
          </button>
        </div>
      </form>

      {/* Micro-trust indicators */}
      <div className="text-ink-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium">
        <span className="flex items-center gap-1">
          <ShieldCheck className="text-brand size-3.5" /> Takes about 10 minutes
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="flex items-center gap-1">
          <Sparkles className="text-brand size-3.5" /> We write up your business for you
        </span>
        <span className="hidden sm:inline">•</span>
        <span>Scoped to your ZIP and the blocks around it</span>
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {[
            { to: '/about', label: 'About' },
            { to: '/compare', label: 'Compare' },
            { to: '/#pricing', label: 'Pricing' },
            { to: '/blog', label: 'Blog' },
            { to: '/get-started', label: 'Get started' },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="text-ink-50 hover:text-ink font-medium">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="text-ink-30 border-line mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-xs">
          <span>© {new Date().getFullYear()} Spotlight Links LLC</span>
          <span>
            Answer Engine and Generative Engine Visibility Discovery &amp; Management Console
          </span>
        </div>
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
