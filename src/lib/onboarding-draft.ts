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
    sessionStorage.setItem(KEY, JSON.stringify(form))
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
