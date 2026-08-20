/**
 * A parked client-onboarding intake, held across a sign-up detour.
 *
 * The public funnel (src/pages/GetStartedPage.tsx) lets a logged-out visitor
 * fill in the client-context form and use the free AI synthesize step — but
 * the actual generate call (POST /api/clients/generate) requires an account.
 * So at that point the form is stashed here in sessionStorage, the visitor is
 * sent through sign-up/login, and NewClientPage rehydrates it on the other
 * side so nothing they typed is lost. See docs/03-client-onboarding.md.
 *
 * sessionStorage (not localStorage) on purpose: this is a one-shot handoff for
 * the current tab's flow, not something that should linger across sessions.
 */

import type { SynthesizedIntake } from './types'

export interface OnboardingFormState {
  businessName: string
  description: string
  domain: string
  zip: string
  categories: string
  competitors: string
  radiusMiles: string
  foundingYear: string
  highlights: string
  storyText: string
}

export const emptyOnboardingForm: OnboardingFormState = {
  businessName: '',
  description: '',
  domain: '',
  zip: '',
  categories: '',
  competitors: '',
  radiusMiles: '15',
  foundingYear: '',
  highlights: '',
  storyText: '',
}

const KEY = 'onboarding_draft'

export function saveOnboardingDraft(form: OnboardingFormState) {
  try {
    const storyText =
      form.storyText.trim() ||
      [
        form.businessName ? `Business Name: ${form.businessName}` : '',
        form.zip ? `ZIP Code: ${form.zip}` : '',
        form.description ? `Description: ${form.description}` : '',
      ]
        .filter(Boolean)
        .join('. ')
    const updatedForm = { ...form, storyText }
    sessionStorage.setItem(KEY, JSON.stringify(updatedForm))
  } catch {
    /* private mode / storage disabled — the draft just won't survive the hop */
  }
}

export function loadOnboardingDraft(): OnboardingFormState | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    return { ...emptyOnboardingForm, ...(JSON.parse(raw) as Partial<OnboardingFormState>) }
  } catch {
    return null
  }
}

export function clearOnboardingDraft() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function hasOnboardingDraft(): boolean {
  try {
    return sessionStorage.getItem(KEY) != null
  } catch {
    return false
  }
}

/**
 * The one-line story we hand to POST /api/clients/synthesize-bio.
 *
 * Shared so the homepage hero and the full intake form describe a business to
 * the model the same way — otherwise the same visitor gets different
 * synthesized fields depending on which box they typed into.
 */
export function buildStoryText(
  form: Pick<OnboardingFormState, 'businessName' | 'zip' | 'description' | 'storyText'>
): string {
  return (
    form.storyText.trim() ||
    [
      form.businessName ? `Business Name: ${form.businessName}` : '',
      form.zip ? `ZIP Code: ${form.zip}` : '',
      form.description ? `Description: ${form.description}` : '',
    ]
      .filter(Boolean)
      .join('. ')
  )
}

/**
 * Fold a synthesize-bio response into the intake form.
 *
 * Every caller of that endpoint uses this, so "synthesize" means the same
 * thing everywhere — including the homepage hero, which synthesizes before it
 * navigates. Reading only `description` off the response and throwing away the
 * categories, competitors, website, founding year, and highlights the model had
 * already worked out is what left visitors on a mostly empty intake grid.
 *
 * Synthesized values win over what's already in the form (matching the
 * "Synthesize fields" button), but only when the model actually returned
 * something; a blank field never wipes out what someone typed.
 */
export function applySynthesizedIntake(
  form: OnboardingFormState,
  s: SynthesizedIntake
): OnboardingFormState {
  return {
    ...form,
    businessName: s.businessName || form.businessName,
    description: s.description || form.description,
    domain: s.website || form.domain,
    // The endpoint returns the ZIP nested under `address`; the flat `zip` is
    // usually absent, so reading only that left the field empty for anyone who
    // synthesized from a pasted story rather than typing a ZIP first.
    zip: s.zip || s.address?.zip || form.zip,
    categories: s.categories?.join(', ') || form.categories,
    competitors: s.competitors?.join(', ') || form.competitors,
    foundingYear: s.foundingYear ? String(s.foundingYear) : form.foundingYear,
    highlights: s.highlights?.join(', ') || form.highlights,
  }
}

/**
 * True when we have enough to describe the business but the derived intake
 * fields are still blank — i.e. this form came from the homepage hero and has
 * never been through synthesis (or the hero's own synthesize call failed).
 *
 * Deliberately not "is the description empty": the hero asks for a one-line
 * bio, so `description` is usually filled on arrival, and keying off it meant
 * the auto-synthesis never ran for exactly the visitors who had given us the
 * most to work with.
 */
export function needsSynthesis(form: OnboardingFormState): boolean {
  const hasSeed = Boolean(form.businessName.trim() || form.zip.trim() || form.storyText.trim())
  const derived = [form.categories, form.competitors, form.highlights, form.domain, form.foundingYear]
  return hasSeed && derived.every((v) => !v.trim())
}
