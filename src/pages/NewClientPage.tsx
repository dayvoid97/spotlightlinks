import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import type { Intake } from '../lib/types'
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  type OnboardingFormState,
} from '../lib/onboarding-draft'
import { ClientOnboardingForm, splitList } from '../components/ClientOnboardingForm'
import { useToast } from '../context/toast-context'

/**
 * Authenticated client onboarding.
 *
 *  1. POST /api/clients/synthesize-bio (optional, free) — handled inside
 *     <ClientOnboardingForm>.
 *  2. POST /api/clients/generate — the real submission. Turns the intake into
 *     a full ClientFile (question set, aliases, …), seeds it into Postgres,
 *     and returns the new client's slug.
 *
 * This page is also where the public funnel lands after sign-up: if a visitor
 * filled the form on /get-started before having an account, their intake was
 * parked in sessionStorage (see lib/onboarding-draft.ts) and is rehydrated
 * here so they can generate without retyping. See docs/03-client-onboarding.md.
 */
export default function NewClientPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicateSlug, setDuplicateSlug] = useState<string | null>(null)

  // Capture any parked draft once, on first render, before the effect clears it.
  const initialForm = useMemo(() => loadOnboardingDraft() ?? undefined, [])
  useEffect(() => {
    clearOnboardingDraft()
  }, [])

  async function handleGenerate(form: OnboardingFormState, allowDuplicate: boolean) {
    setSubmitting(true)
    setError(null)
    if (!allowDuplicate) setDuplicateSlug(null)
    try {
      const intake: Intake = {
        businessName: form.businessName,
        description: form.description,
        domain: form.domain.trim() || undefined,
        zip: form.zip,
        categories: splitList(form.categories),
        competitors: splitList(form.competitors),
        radiusMiles: form.radiusMiles ? Number(form.radiusMiles) : undefined,
        foundingYear: form.foundingYear ? Number(form.foundingYear) : undefined,
        highlights: splitList(form.highlights),
        allowDuplicate,
      }
      const data = await api.post<{ slug: string }>('/api/clients/generate', intake)
      toast.push(`${form.businessName} onboarded.`)
      navigate(`/clients/${data.slug}`)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'DUPLICATE_CLIENT') {
        setDuplicateSlug((err.body as any)?.existingSlug ?? null)
        setError(err.message)
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Could not create the client.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/dashboard"
        className="text-ink-50 hover:text-ink-70 flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" /> Back to dashboard
      </Link>

      <div>
        <h1 className="text-ink text-xl font-semibold">Onboard a client</h1>
        <p className="text-ink-50 text-sm">
          Every field here becomes part of the question set Quasar asks AI engines on this
          business's behalf.
        </p>
      </div>

      <ClientOnboardingForm
        initialForm={initialForm}
        submitLabel="Generate client & question set"
        submitting={submitting}
        error={error}
        duplicateSlug={duplicateSlug}
        onSubmit={handleGenerate}
      />
    </div>
  )
}
