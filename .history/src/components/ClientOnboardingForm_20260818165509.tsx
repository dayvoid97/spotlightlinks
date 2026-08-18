import { useState, type FormEvent, type ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import type { SynthesizedIntake } from '../lib/types'
import { emptyOnboardingForm, type OnboardingFormState } from '../lib/onboarding-draft'
import { Card, CardBody, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input, Label, Textarea } from './ui/Input'
import { Alert } from './ui/Alert'
import { useToast } from '../context/toast-context'

/**
 * The client-context intake form, shared by the authed onboarding page
 * (NewClientPage) and the public funnel (GetStartedPage).
 *
 * Two backend touchpoints, with deliberately different auth needs:
 *  - "Synthesize from a story" → POST /api/clients/synthesize-bio. No auth
 *    required (the backend route is open), so it's offered free to logged-out
 *    visitors and lives entirely inside this component.
 *  - The actual generate submission → owned by the parent via `onSubmit`,
 *    because it differs by context: NewClientPage calls
 *    POST /api/clients/generate; GetStartedPage instead parks the draft and
 *    prompts sign-up. See docs/03-client-onboarding.md.
 */
interface Props {
  initialForm?: OnboardingFormState
  submitLabel: string
  submitting: boolean
  error?: string | null
  /** Set by the parent when generate hit DUPLICATE_CLIENT — shows a "create anyway" button. */
  duplicateSlug?: string | null
  onSubmit: (form: OnboardingFormState, allowDuplicate: boolean) => void
  /** Fired on every field change, so the public funnel can keep its saved draft current. */
  onChange?: (form: OnboardingFormState) => void
  /** Rendered just above the submit button — used to slot in the sign-up prompt. */
  banner?: ReactNode
}

export function ClientOnboardingForm({
  initialForm,
  submitLabel,
  submitting,
  error,
  duplicateSlug,
  onSubmit,
  onChange,
  banner,
}: Props) {
  const toast = useToast()
  const [form, setForm] = useState<OnboardingFormState>(initialForm ?? emptyOnboardingForm)
  const [synthesizing, setSynthesizing] = useState(false)

  function update(next: OnboardingFormState) {
    setForm(next)
    onChange?.(next)
  }
  function set<K extends keyof OnboardingFormState>(key: K, value: string) {
    update({ ...form, [key]: value })
  }

  async function handleSynthesize() {
    if (!form.storyText.trim()) return
    setSynthesizing(true)
    try {
      const data = await api.post<{ synthesized: SynthesizedIntake }>(
        '/api/clients/synthesize-bio',
        { storyText: form.storyText }
      )
      const s = data.synthesized
      update({
        ...form,
        businessName: s.businessName || form.businessName,
        description: s.description || form.description,
        zip: s.zip || form.zip,
        categories: s.categories?.join(', ') || form.categories,
        competitors: s.competitors?.join(', ') || form.competitors,
        foundingYear: s.foundingYear ? String(s.foundingYear) : form.foundingYear,
        highlights: s.highlights?.join(', ') || form.highlights,
      })
      toast.push('Intake fields synthesized from your story.')
    } catch (err) {
      toast.push(
        err instanceof ApiError ? err.message : 'Could not synthesize from that text.',
        'error'
      )
    } finally {
      setSynthesizing(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(form, false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Sparkles className="text-brand size-3.5" /> Synthesize from a story
            <span className="text-ink-30 text-[11px] font-normal">· optional · free</span>
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 pt-3">
          <Textarea
            rows={4}
            value={form.storyText}
            onChange={(e) => set('storyText', e.target.value)}
            placeholder="Paste a paragraph about the business — history, services, location, known competitors — and Quasar will draft the intake fields below."
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleSynthesize}
            loading={synthesizing}
          >
            <Sparkles className="size-3.5" /> Synthesize fields
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert tone="error">
                {error}
                {duplicateSlug && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => onSubmit(form, true)}
                      loading={submitting}
                    >
                      Create anyway as a new client
                    </Button>
                  </div>
                )}
              </Alert>
            )}

            <div>
              <Label htmlFor="businessName">Business name *</Label>
              <Input
                id="businessName"
                required
                value={form.businessName}
                onChange={(e) => set('businessName', e.target.value)}
                placeholder="Rock N Joe Coffeehouse"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="2-3 sentences: what they do, who they serve, what makes them distinct."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="zip">Please Double Check Your ZIP code *</Label>
                <Input
                  id="zip"
                  required
                  value={form.zip}
                  onChange={(e) => set('zip', e.target.value)}
                  placeholder="07006"
                />
              </div>
              <div>
                <Label htmlFor="radiusMiles">Please double check your service radius (mi)</Label>
                <Input
                  id="radiusMiles"
                  type="number"
                  placeholder="5"
                  value={form.radiusMiles}
                  onChange={(e) => set('radiusMiles', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="categories">Categories (comma separated)</Label>
              <Input
                id="categories"
                value={form.categories}
                onChange={(e) => set('categories', e.target.value)}
                placeholder="Coffee shop, Cafe"
              />
            </div>

            <div>
              <Label htmlFor="competitors">Known competitors (comma separated)</Label>
              <Input
                id="competitors"
                value={form.competitors}
                onChange={(e) => set('competitors', e.target.value)}
                placeholder="Starbucks, Local Grind"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="foundingYear">Founding year</Label>
                <Input
                  id="foundingYear"
                  type="number"
                  value={form.foundingYear}
                  onChange={(e) => set('foundingYear', e.target.value)}
                  placeholder="1998"
                />
              </div>
              <div>
                <Label htmlFor="highlights">Highlights (comma separated)</Label>
                <Input
                  id="highlights"
                  value={form.highlights}
                  onChange={(e) => set('highlights', e.target.value)}
                  placeholder="Family-owned, Award-winning espresso"
                />
              </div>
            </div>

            {banner}

            <Button type="submit" className="w-full" loading={submitting}>
              {submitLabel}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

/** Shared comma-string → string[] used when building the Intake payload. */
export function splitList(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}
