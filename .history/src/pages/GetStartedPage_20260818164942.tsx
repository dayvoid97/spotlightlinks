import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, ShieldCheck, Zap, Clock } from 'lucide-react'
import { useAuth } from '../context/auth-context'
import { saveOnboardingDraft, type OnboardingFormState } from '../lib/onboarding-draft'
import { ClientOnboardingForm } from '../components/ClientOnboardingForm'
import { BrandLockup } from '../components/BrandLockup'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/Button'
import { FullPageSpinner } from '../components/ui/Spinner'

/**
 * Public onboarding funnel (route "/get-started").
 *
 * Logged-out visitors can fill in the whole client-context form and use the
 * free AI synthesize step. Only the final generate is gated: on submit, their
 * intake is parked (sessionStorage) and a sign-up prompt appears. After they
 * create an account (or log in), NewClientPage rehydrates the draft so they
 * pick up exactly where they left off.
 *
 * Logged-in visitors don't belong here — they're bounced to the real authed
 * flow at /clients/new. See docs/03-client-onboarding.md.
 */
export default function GetStartedPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [promptSignup, setPromptSignup] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate('/clients/new', { replace: true })
  }, [loading, user, navigate])

  if (loading || user) return <FullPageSpinner label="Loading…" />

  function handleGenerate(form: OnboardingFormState) {
    // No account yet — park the intake and ask them to sign up rather than
    // firing a generate call that would just 401.
    saveOnboardingDraft(form)
    setPromptSignup(true)
    // Bring the prompt into view; it renders just above the submit button.
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

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/"
          className="text-ink-50 hover:text-ink inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>

        {/* Hero & Intro */}
        <div className="space-y-4">
          <div className="border-line bg-surface-raised text-ink-70 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <Sparkles className="text-brand size-3.5" /> Free AI Business Synthesis
          </div>

          <h1 className="text-ink text-3xl font-bold tracking-tight sm:text-4xl">
            Build your business profile
          </h1>

          <p className="text-ink-50 text-base leading-relaxed sm:text-lg">
            Let's customize Spotlight Links for your business. Tell us a bit about what you do—or
            drop in a quick description and let our AI draft the details for you automatically.
          </p>

          {/* Quick reassurance indicators */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
            <div className="text-ink-70 flex items-center gap-2 text-xs font-medium">
              <Clock className="text-brand size-4 shrink-0" />
              <span>Takes under 2 minutes</span>
            </div>
            <div className="text-ink-70 flex items-center gap-2 text-xs font-medium">
              <Zap className="text-brand size-4 shrink-0" />
              <span>Free instant AI setup</span>
            </div>
            <div className="text-ink-70 flex items-center gap-2 text-xs font-medium">
              <ShieldCheck className="text-brand size-4 shrink-0" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="border-line bg-surface-raised rounded-xl border p-4 shadow-sm sm:p-6">
          <ClientOnboardingForm
            submitLabel="Create client & question set"
            submitting={false}
            onSubmit={handleGenerate}
            onChange={(form) => {
              // Keep the parked draft current if they keep editing after the prompt appears.
              if (promptSignup) saveOnboardingDraft(form)
            }}
            banner={promptSignup ? <SignupPrompt /> : null}
          />
        </div>
      </main>
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
