import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, ShieldCheck, Zap, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/auth-context'
import {
  loadOnboardingDraft,
  saveOnboardingDraft,
  type OnboardingFormState,
} from '../lib/onboarding-draft'
import { ClientOnboardingForm } from '../components/ClientOnboardingForm'
import { ProbeAccessNotice } from '../components/ProbeAccessNotice'
import { BrandLockup } from '../components/BrandLockup'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/Button'
import { FullPageSpinner } from '../components/ui/Spinner'
import { useBlogReaderMode } from '../context/blog-reader-context'
import { MachinePageView, type PageMachineMetadata } from '../components/MachinePageView'

// Configuration for front-end rate limiting
const MAX_REQUESTS = 5 // Max allowed requests
const WINDOW_MS = 60 * 1000 // In 1 minute (60,000 ms)

const getStartedMachineMetadata: PageMachineMetadata = {
  path: '/get-started',
  title: 'Build Your Business Profile — Spotlight Links AI Visibility Audit Intake',
  h1: 'Build your business profile',
  description:
    'Customize Spotlight Links for your business entity. Input your business name, ZIP code, and brief bio to trigger an instant multi-engine AI audit.',
  canonical: 'https://spotlightlinks.com/get-started',
  schemas: ['WebPage', 'ContactPage', 'EntryPoint'],
  summary: `The Get Started profile builder collects core business entity attributes (Business Name, ZIP Code, and 1-2 sentence Business Description/Bio) to initialize an Answer Engine Optimization (AEO) audit set. Runs 300+ live serial probes across ChatGPT, Gemini, Claude, and Perplexity to generate a 95% Wilson-score recommendation scorecard.`,
  sections: [
    {
      title: 'Profile Onboarding Requirements',
      content: `1. Business Name: Official legal or trade name of the business entity.\n2. ZIP Code: Target service location or headquarters postal code.\n3. Business Description / Bio: 1–2 sentences summarizing offerings, target audience, and key differentiators.\n4. Profile building and AI synthesis are available before subscribing; running live audits requires an active plan.`,
    },
    {
      title: 'Multi-Engine Audit Process',
      content: `- Step 1: Input business details and location parameters.\n- Step 2: System generates 30+ tailored customer buyer-intent prompts.\n- Step 3: Executes 300+ live serial probes across OpenAI ChatGPT, Google Gemini, Anthropic Claude, and Perplexity AI.\n- Step 4: Delivers Executive AI SWOT scorecard and 95% confidence intervals.\n- Step 5: Activate the $79/mo Starter Prober to run live audits and ongoing automated monitoring.`,
    },
  ],
}

export default function GetStartedPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { isMachine } = useBlogReaderMode()
  const [promptSignup, setPromptSignup] = useState(false)

  /**
   * Whatever the homepage hero collected, already run through
   * POST /api/clients/synthesize-bio there — so the grid below arrives filled
   * in rather than blank. This page is the other half of that handoff and was
   * not reading it at all. Captured once so later edits are not stomped
   * by a re-read of sessionStorage. Not cleared here: NewClientPage still needs
   * it on the far side of sign-up, and clears it there.
   */
  const initialForm = useMemo(() => loadOnboardingDraft() ?? undefined, [])

  // Rate limiter state
  const requestTimestamps = useRef<number[]>([])
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) navigate('/clients/new', { replace: true })
  }, [loading, user, navigate])

  if (loading || user) return <FullPageSpinner label="Loading…" />

  function checkRateLimit(): boolean {
    const now = Date.now()
    const recentRequests = requestTimestamps.current.filter(
      (timestamp) => now - timestamp < WINDOW_MS
    )

    if (recentRequests.length >= MAX_REQUESTS) {
      setRateLimitError(
        'You have made too many synthesis requests in a short time. Please wait a minute before trying again.'
      )
      return false
    }

    recentRequests.push(now)
    requestTimestamps.current = recentRequests
    setRateLimitError(null)
    return true
  }

  function handleGenerate(form: OnboardingFormState) {
    if (!checkRateLimit()) return
    saveOnboardingDraft(form)
    setPromptSignup(true)
    requestAnimationFrame(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    )
  }

  return (
    <div className="bg-surface min-h-screen">
      <header className="border-line border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLockup />
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-ink-50 hover:text-ink whitespace-nowrap text-sm font-medium transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {isMachine ? (
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
          <MachinePageView
            meta={getStartedMachineMetadata}
            filename="spotlight-links-get-started.md"
          />
        </main>
      ) : (
        <main className="mx-auto max-w-3xl space-y-8 px-4 py-2 sm:px-6 sm:py-12">
          <Link
            to="/"
            className="text-ink-50 hover:text-ink inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>

          {/* Hero & Intro */}
          <div className="space-y-4">
            <h1 className="text-ink text-3xl font-bold tracking-tight sm:text-4xl">
              Build your business profile
            </h1>

            <p className="text-ink-50 text-base leading-relaxed sm:text-lg">
              A few plain questions about your business. We have already answered the ones we could
              guess — read them over, fix anything we got wrong, and add whatever we missed.
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <div className="text-ink-70 flex items-center gap-2 text-xs font-medium">
                <Clock className="text-brand size-4 shrink-0" />
                <span>Takes under 2 minutes</span>
              </div>
              <div className="text-ink-70 flex items-center gap-2 text-xs font-medium">
                <Zap className="text-brand size-4 shrink-0" />
                <span>Most of it is already filled in</span>
              </div>
              <div className="text-ink-70 flex items-center gap-2 text-xs font-medium">
                <ShieldCheck className="text-brand size-4 shrink-0" />
                <span>Your draft is saved as you type</span>
              </div>
            </div>
          </div>

          <ProbeAccessNotice source="probe-notice:get-started" />

          {/* Rate Limit Warning Banner */}
          {rateLimitError && (
            <div className="border-brand bg-brand-tint text-ink flex items-center gap-3 rounded-xl border p-4 text-sm font-medium">
              <AlertTriangle className="text-brand size-5 shrink-0" />
              <span>{rateLimitError}</span>
            </div>
          )}

          {/* The form brings its own numbered step cards — wrapping them in a
              second bordered panel just nested one box inside another. */}
          <ClientOnboardingForm
            initialForm={initialForm}
            submitLabel="Save my profile and continue"
            submitting={false}
            onSubmit={handleGenerate}
            onChange={(form) => {
              if (rateLimitError) setRateLimitError(null)
              // Keep the parked draft current on every edit, not only after
              // the sign-up prompt appears — a refresh mid-form should not
              // cost someone the fields we just synthesized for them.
              saveOnboardingDraft(form)
            }}
            banner={promptSignup ? <SignupPrompt /> : null}
          />
        </main>
      )}
    </div>
  )
}

function SignupPrompt() {
  return (
    <div className="border-brand bg-brand-tint space-y-4 rounded-xl border p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-brand/10 text-brand rounded-lg p-2">
          <Sparkles className="size-5 shrink-0" />
        </div>
        <div className="space-y-1">
          <p className="text-ink text-base font-semibold">Your profile draft is saved!</p>
          <p className="text-ink-50 text-sm leading-relaxed">
            Create a free account (or log in) to generate your audit question set and unlock your
            recommendations.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
        <Link to="/signup" className="w-full sm:w-auto">
          <Button type="button" className="w-full sm:w-auto">
            Create free account
          </Button>
        </Link>
        <Link to="/login" className="w-full sm:w-auto">
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            I already have an account
          </Button>
        </Link>
      </div>
    </div>
  )
}
