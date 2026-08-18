import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
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
              className="text-ink-50 hover:text-ink whitespace-nowrap text-sm font-medium"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
        <Link to="/" className="text-ink-50 hover:text-ink-70 flex items-center gap-1.5 text-sm">
          <ArrowLeft className="size-3.5" /> Back to home
        </Link>

        <div>
          <h1 className="text-ink text-2xl font-semibold">Create your client context</h1>
          <p className="text-ink-50 mt-1 text-sm">
            Describe the business — or paste a paragraph and let AI draft it for you, free. When
            you're ready to generate the audit question set, you'll create a free account to save
            it.
          </p>
        </div>

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
      </main>
    </div>
  )
}

function SignupPrompt() {
  return (
    <div className="border-brand bg-brand-tint space-y-3 rounded-lg border p-4">
      <div className="flex items-start gap-2">
        <Sparkles className="text-brand mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-ink text-sm font-semibold">Create a free account to generate</p>
          <p className="text-ink-50 text-sm">
            Your details are saved — sign up (or log in) and we'll pick up right here and build your
            question set.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/signup">
          <Button type="button">Create free account</Button>
        </Link>
        <Link to="/login">
          <Button type="button" variant="secondary">
            I already have an account
          </Button>
        </Link>
      </div>
    </div>
  )
}
