import {
  useState,
  useEffect,
  useMemo,
  useRef,
  type FormEvent,
  type ReactNode,
  type ComponentType,
} from 'react'
import { Sparkles, Globe, Check, CalendarDays, Users, Store, Star, Wand2 } from 'lucide-react'
import clsx from 'clsx'
import { api, ApiError } from '../lib/api'
import type { SynthesizedIntake } from '../lib/types'
import {
  applySynthesizedIntake,
  buildStoryText,
  emptyOnboardingForm,
  needsSynthesis,
  type OnboardingFormState,
} from '../lib/onboarding-draft'
import { Card, CardBody, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input, Label, Textarea } from './ui/Input'
import { ChipInput } from './ui/ChipInput'
import { Alert } from './ui/Alert'
import { useToast } from '../context/toast-context'

/**
 * The client-context intake form, shared by the authed onboarding page
 * (NewClientPage) and the public funnel (GetStartedPage).
 *
 * Written as a *review*, not a data-entry form. By the time most people reach
 * it, the homepage hero has already run their description through
 * POST /api/clients/synthesize-bio, so the job in front of them is checking
 * what a model guessed about their business rather than typing it out. That is
 * why the copy is plain English, the lists are chips you can remove one at a
 * time, and the competitor block asks a question ("did we get these right?")
 * instead of presenting a comma-separated string.
 *
 * Two backend touchpoints, with deliberately different auth needs:
 *  - "Fill in the form for me" -> POST /api/clients/synthesize-bio. No auth
 *    required (the backend route is open), so it's offered free to logged-out
 *    visitors and lives entirely inside this component.
 *  - The actual generate submission -> owned by the parent via `onSubmit`,
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

/** Plain-English service areas, so nobody has to guess what a radius means. */
const RADIUS_PRESETS = [
  { miles: '5', label: 'My neighborhood' },
  { miles: '15', label: 'Around town' },
  { miles: '30', label: 'The whole region' },
]

const CURRENT_YEAR = new Date().getFullYear()

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
  const [form, setForm] = useState<OnboardingFormState>(() => {
    const base = initialForm ?? emptyOnboardingForm
    if (!base.storyText && (base.businessName || base.zip)) {
      return { ...base, storyText: buildStoryText(base) }
    }
    return base
  })
  const [synthesizing, setSynthesizing] = useState(false)
  /** True only for the synthesis we kicked off ourselves, so we can explain it. */
  const [autoDrafting, setAutoDrafting] = useState(false)
  const autoSynthesized = useRef(false)

  /**
   * Answers to the two questions this form asks out loud. Both are UI state
   * only — there is no field for them on `Intake`, and inventing one to record
   * "the visitor clicked yes" would put a claim in the audit that the audit
   * never checked.
   */
  const [competitorsConfirmed, setCompetitorsConfirmed] = useState(false)
  const [noWebsite, setNoWebsite] = useState(false)

  /**
   * Whether the model had already filled things in before this page rendered
   * (i.e. they came through the homepage hero). Captured once at mount so the
   * "check our work" framing doesn't disappear the moment they edit a field.
   */
  const arrivedPrefilled = useRef(Boolean(initialForm && !needsSynthesis(initialForm)))

  /**
   * Whether the competitor names on screen are *ours* to justify.
   *
   * Only a model-generated list gets asked "did we get these right?" — putting
   * that question to someone about the two names they just typed themselves
   * reads as if we weren't listening.
   */
  const [competitorsSuggested, setCompetitorsSuggested] = useState(
    () => arrivedPrefilled.current && splitList(initialForm?.competitors ?? '').length > 0
  )

  /**
   * The "describe it and we'll fill it in" box, open by default only when
   * there is nothing to review yet. Someone arriving from the homepage has
   * already answered this question — leading with it again buries the actual
   * work under a box they have no reason to touch.
   */
  const [storyOpen, setStoryOpen] = useState(!arrivedPrefilled.current)

  function update(next: OnboardingFormState) {
    setForm(next)
    onChange?.(next)
  }
  function set<K extends keyof OnboardingFormState>(key: K, value: string) {
    update({ ...form, [key]: value })
  }
  /** Chips speak string[]; the draft and the Intake payload speak comma-joined. */
  function setList(key: 'categories' | 'competitors' | 'highlights', items: string[]) {
    set(key, items.join(', '))
  }

  const categories = useMemo(() => splitList(form.categories), [form.categories])
  const competitors = useMemo(() => splitList(form.competitors), [form.competitors])
  const highlights = useMemo(() => splitList(form.highlights), [form.highlights])

  const foundingYear = form.foundingYear.trim()
  const yearNumber = Number(foundingYear)
  const yearValid = /^\d{4}$/.test(foundingYear) && yearNumber >= 1800 && yearNumber <= CURRENT_YEAR
  const yearsInBusiness = yearValid ? CURRENT_YEAR - yearNumber : null

  const hasWebsite = form.domain.trim().length > 0

  async function handleSynthesize(source: OnboardingFormState = form, auto = false) {
    const textToSynthesize = buildStoryText(source)
    if (!textToSynthesize) return

    setSynthesizing(true)
    if (auto) setAutoDrafting(true)
    try {
      const data = await api.post<{ synthesized: SynthesizedIntake }>(
        '/api/clients/synthesize-bio',
        { storyText: textToSynthesize }
      )
      update(
        applySynthesizedIntake(
          { ...source, storyText: source.storyText || textToSynthesize },
          data.synthesized
        )
      )
      // A fresh guess at the competitor list is a new thing to check over.
      setCompetitorsConfirmed(false)
      setCompetitorsSuggested((data.synthesized?.competitors?.length ?? 0) > 0)
      toast.push('Filled in from your description — have a look.')
    } catch (err) {
      // An auto-run the visitor never asked for should not greet them with a
      // red error on arrival — the fields are simply left for them to fill.
      if (!auto) {
        toast.push(
          err instanceof ApiError ? err.message : 'Could not fill the form in from that text.',
          'error'
        )
      }
    } finally {
      setSynthesizing(false)
      setAutoDrafting(false)
    }
  }

  /**
   * Fill the grid on arrival for anyone who already told us about their
   * business on the homepage.
   *
   * The old condition was `!form.description`, which meant this never fired
   * for the visitors who used the hero's bio box — the ones who had given us
   * the most to work with landed on an intake form with only three fields
   * filled. `needsSynthesis` keys off the *derived* fields instead, so a
   * hero-supplied bio still gets expanded into categories, competitors,
   * website, founding year, and highlights.
   */
  useEffect(() => {
    if (autoSynthesized.current) return
    if (!needsSynthesis(form)) return
    autoSynthesized.current = true
    handleSynthesize(form, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(form, false)
  }

  const canSynthesize = Boolean(
    form.storyText.trim() || form.businessName.trim() || form.zip.trim()
  )

  /** Real form state, in the visitor's words — never a fabricated score. */
  const checklist = [
    { label: 'business name', done: form.businessName.trim().length > 0 },
    { label: 'what you do', done: form.description.trim().length > 0 },
    { label: 'ZIP code', done: form.zip.trim().length > 0 },
    { label: 'website', done: hasWebsite },
    { label: 'competitors', done: competitors.length > 0 },
    { label: 'type of business', done: categories.length > 0 },
    { label: 'the year you opened', done: yearValid },
    { label: 'what makes you stand out', done: highlights.length > 0 },
  ]
  const doneCount = checklist.filter((c) => c.done).length
  const missing = checklist.filter((c) => !c.done).map((c) => c.label)

  return (
    <div className="space-y-5">
      {arrivedPrefilled.current && (
        <div className="border-brand bg-brand-tint flex gap-3 rounded-xl border p-4">
          <Wand2 className="text-brand mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-ink text-sm font-semibold">We filled this in for you.</p>
            <p className="text-ink-70 mt-0.5 text-xs leading-relaxed">
              These are our best guesses from what you told us on the last page. Read them over and
              change anything that is wrong — you know your business, we do not.
            </p>
          </div>
        </div>
      )}

      {/* Start from prose. Kept above the form so Enter here never submits. */}
      {storyOpen ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Sparkles className="text-brand size-3.5" /> Would you rather just describe it?
              <span className="text-ink-30 text-[11px] font-normal">· free</span>
            </CardTitle>
            <p className="text-ink-50 mt-1 text-xs leading-relaxed">
              Paste anything about the business — your About page, a few sentences, an old flyer —
              and we will fill in the whole form below. You can fix anything we get wrong.
            </p>
          </CardHeader>
          <CardBody className="space-y-3 pt-3">
            <Textarea
              rows={4}
              value={form.storyText}
              onChange={(e) => set('storyText', e.target.value)}
              placeholder="We are a family-run coffee shop in Astoria, open since 2011. We roast our own beans and we are known for our cortados..."
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSynthesize()}
                loading={synthesizing}
                disabled={synthesizing || !canSynthesize}
              >
                <Sparkles className="size-3.5" /> Fill in the form for me
              </Button>

              {autoDrafting && (
                <span className="text-ink-50 text-xs font-medium">
                  Drafting the rest of your details from what you told us…
                </span>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setStoryOpen(true)}
          className="border-line bg-surface-2 text-ink-50 hover:text-ink hover:border-ink-30 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-2.5 text-xs font-medium transition"
        >
          <Sparkles className="text-brand size-3.5" /> Rather start over from a description?
        </button>
      )}

      <ProgressStrip doneCount={doneCount} total={checklist.length} missing={missing} />

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <Section
          step={1}
          icon={Store}
          title="The basics"
          hint="Who you are and where you are. This is the only part we truly need."
          done={Boolean(form.businessName.trim() && form.description.trim() && form.zip.trim())}
        >
          <Field label="What is the business called?" htmlFor="businessName" required>
            <Input
              id="businessName"
              required
              value={form.businessName}
              onChange={(e) => set('businessName', e.target.value)}
              placeholder="Rock N Joe Coffeehouse"
            />
          </Field>

          <Field
            label="What do you do?"
            htmlFor="description"
            required
            hint="Two or three sentences, the way you would say it to a new customer."
          >
            <Textarea
              id="description"
              required
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="We roast our own beans and serve breakfast all day to the Astoria neighborhood."
            />
          </Field>

          <Field
            label="What is your ZIP code?"
            htmlFor="zip"
            required
            hint="We only check how you show up around here, not across the country."
          >
            <Input
              id="zip"
              required
              inputMode="numeric"
              className="max-w-[10rem]"
              value={form.zip}
              onChange={(e) => set('zip', e.target.value)}
              placeholder="07006"
            />
          </Field>

          <Field
            label="How far do customers come from?"
            htmlFor="radiusMiles"
            hint="Pick whichever is closest. A rough answer is fine."
          >
            <div className="flex flex-wrap items-center gap-2">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset.miles}
                  type="button"
                  onClick={() => set('radiusMiles', preset.miles)}
                  className={clsx(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    form.radiusMiles === preset.miles
                      ? 'border-brand bg-brand-tint text-brand'
                      : 'border-line bg-surface-2 text-ink-50 hover:text-ink'
                  )}
                >
                  {preset.label}
                  <span className="text-ink-30 ml-1.5 font-mono">{preset.miles} mi</span>
                </button>
              ))}
              <span className="text-ink-30 text-xs">or</span>
              <div className="flex items-center gap-1.5">
                <Input
                  id="radiusMiles"
                  type="number"
                  min={1}
                  className="w-20"
                  value={form.radiusMiles}
                  onChange={(e) => set('radiusMiles', e.target.value)}
                  placeholder="15"
                />
                <span className="text-ink-50 text-xs">miles</span>
              </div>
            </div>
          </Field>
        </Section>

        <WebsiteSection
          value={form.domain}
          onChange={(v) => set('domain', v)}
          noWebsite={noWebsite}
          onNoWebsite={setNoWebsite}
        />

        <Section
          step={3}
          icon={CalendarDays}
          title="When did you open?"
          hint="Being the one that has been there for years is worth saying out loud."
          done={yearValid}
        >
          <Field
            label="The year you opened"
            htmlFor="foundingYear"
            hint="Roughly is fine — nobody is checking your paperwork."
          >
            <div className="flex flex-wrap items-center gap-3">
              <Input
                id="foundingYear"
                type="number"
                inputMode="numeric"
                className="w-28"
                value={form.foundingYear}
                onChange={(e) => set('foundingYear', e.target.value)}
                placeholder="1998"
              />
              {yearsInBusiness !== null && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <Check className="size-3.5" />
                  {yearsInBusiness === 0
                    ? 'Opened this year.'
                    : `That is ${yearsInBusiness} year${
                        yearsInBusiness === 1 ? '' : 's'
                      } in business.`}
                </span>
              )}
              {foundingYear.length > 0 && !yearValid && (
                <span className="text-ink-50 text-xs">
                  That does not look like a year — try something like 1998.
                </span>
              )}
            </div>
          </Field>
        </Section>

        <CompetitorSection
          items={competitors}
          onChange={(items) => setList('competitors', items)}
          suggested={competitorsSuggested}
          confirmed={competitorsConfirmed}
          onConfirm={() => setCompetitorsConfirmed(true)}
        />

        <Section
          step={5}
          icon={Star}
          title="Last bit — what kind of business, and what makes you different"
          hint="These help us ask the AI engines the questions your customers actually ask."
          done={categories.length > 0 && highlights.length > 0}
        >
          <Field
            label="What kind of business is it?"
            htmlFor="categories"
            hint="How someone would describe you in two words. Add as many as fit."
          >
            <ChipInput
              id="categories"
              items={categories}
              onChange={(items) => setList('categories', items)}
              placeholder="Coffee shop"
              addLabel="Add"
              highlightEmpty
            />
          </Field>

          <Field
            label="What makes you stand out?"
            htmlFor="highlights"
            hint="Anything you would want a customer to hear first."
          >
            <ChipInput
              id="highlights"
              items={highlights}
              onChange={(items) => setList('highlights', items)}
              placeholder="Family-owned"
              addLabel="Add"
            />
          </Field>
        </Section>

        {banner}

        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          {submitLabel}
        </Button>
      </form>
    </div>
  )
}

/**
 * How much of the profile is filled in, counted from real field state and
 * named in the visitor's own words. No score, no grade — just what is still
 * blank, so nobody has to scroll the whole form hunting for it.
 */
function ProgressStrip({
  doneCount,
  total,
  missing,
}: {
  doneCount: number
  total: number
  missing: string[]
}) {
  const complete = missing.length === 0
  return (
    <div className="border-line bg-surface-2 rounded-xl border p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-ink text-sm font-semibold">
          {complete ? 'Everything is filled in.' : `${doneCount} of ${total} details filled in`}
        </p>
        <span className="text-ink-30 font-mono text-xs">
          {doneCount}/{total}
        </span>
      </div>

      <div className="bg-surface border-line mt-2 h-1.5 w-full overflow-hidden rounded-full border">
        <div
          className="bg-brand h-full rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / total) * 100}%` }}
        />
      </div>

      <p className="text-ink-50 mt-2 text-xs leading-relaxed">
        {complete ? (
          <>Nothing left to do — check it over and send it.</>
        ) : (
          <>
            Still blank: {missing.join(', ')}. None of those are required, but every one of them
            makes the audit sharper.
          </>
        )}
      </p>
    </div>
  )
}

/**
 * The website field, given its own step because a blank one quietly breaks the
 * report.
 *
 * `detect.ts` decides whether an answer *cited* the business by looking for
 * this domain among the answer's citations — with no domain the citation rate
 * is 0% by construction, and the report then reads that back as a finding
 * about the business rather than a gap in its own intake. It stays optional
 * (plenty of real businesses have no site), but a blank one is now impossible
 * to scroll past without noticing, and saying "I don't have one" is an actual
 * answer rather than something you signal by leaving a box empty.
 */
function WebsiteSection({
  value,
  onChange,
  noWebsite,
  onNoWebsite,
}: {
  value: string
  onChange: (next: string) => void
  noWebsite: boolean
  onNoWebsite: (next: boolean) => void
}) {
  const filled = value.trim().length > 0

  return (
    <Section
      step={2}
      icon={Globe}
      title="Your website"
      hint="Optional — but this is the one blank field that changes what we can measure."
      done={filled}
      flagged={!filled && !noWebsite}
    >
      {filled ? (
        <>
          <Field label="Your web address" htmlFor="domain">
            <Input
              id="domain"
              type="text"
              inputMode="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="rocknjoe.com"
            />
          </Field>
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Check className="size-3.5 shrink-0" />
            Good — we will watch for AI answers that link to {value.trim()}.
          </p>
        </>
      ) : noWebsite ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-ink-50 text-xs leading-relaxed">
            No problem. We will track when AI <em>mentions</em> you, and your link score will read
            0% because there is no address to look for.
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={() => onNoWebsite(false)}>
            Actually, I have one
          </Button>
        </div>
      ) : (
        <div className="border-brand bg-brand-tint rounded-xl border border-dashed p-4">
          <div className="flex gap-3">
            <Globe className="text-brand mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-ink text-sm font-semibold">This one is worth filling in.</p>
              <p className="text-ink-70 mt-1 text-xs leading-relaxed">
                Without your web address we can tell when an AI <em>says your name</em>, but never
                when it <em>links to you</em>. Your link score would sit at 0% forever — not because
                AI is ignoring you, but because we would have nothing to match against.
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              id="domain"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="rocknjoe.com"
              className="bg-surface"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={() => onNoWebsite(true)}
            >
              I do not have one
            </Button>
          </div>
        </div>
      )}
    </Section>
  )
}

/**
 * The competitor list, asked as a question.
 *
 * When someone arrives from the homepage these names were guessed by a model
 * from one sentence about their business, and a wrong competitor skews every
 * comparison in the report. So rather than presenting the guesses as settled
 * fact in a comma-separated box, this asks whether they are right and makes
 * removing one a single click.
 */
function CompetitorSection({
  items,
  onChange,
  suggested,
  confirmed,
  onConfirm,
}: {
  items: string[]
  onChange: (next: string[]) => void
  /** True when these names came from the model rather than from the visitor. */
  suggested: boolean
  confirmed: boolean
  onConfirm: () => void
}) {
  const hasItems = items.length > 0
  // Nothing to confirm about a list someone typed out themselves.
  const asking = hasItems && suggested && !confirmed

  return (
    <Section
      step={4}
      icon={Users}
      title="Who else would a customer consider?"
      hint="We ask the AI engines the same questions your customers ask, then see who gets named instead of you."
      done={hasItems && (!suggested || confirmed)}
    >
      {asking && (
        <div className="border-line bg-surface-2 rounded-xl border p-3">
          <p className="text-ink text-sm font-medium">
            We came up with {items.length === 1 ? 'this one' : `these ${items.length}`}. Do they
            look right?
          </p>
          <p className="text-ink-50 mt-0.5 text-xs leading-relaxed">
            Remove anyone who is not really a competitor with the × — a wrong name here skews the
            whole comparison. Add anyone we missed below.
          </p>
        </div>
      )}

      {hasItems && suggested && confirmed && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <Check className="size-3.5 shrink-0" />
          Thanks — we will compare you against{' '}
          {items.length === 1 ? 'this business' : `these ${items.length} businesses`}.
        </p>
      )}

      <Field
        label={hasItems ? 'Your competitors' : 'Add a competitor'}
        htmlFor="competitors"
        hint={
          hasItems
            ? undefined
            : 'Two or three names is plenty. Think of who a customer picks when they do not pick you.'
        }
      >
        <ChipInput
          id="competitors"
          items={items}
          onChange={onChange}
          placeholder={hasItems ? 'Add another name' : 'Starbucks'}
          addLabel="Add"
          highlightEmpty
        />
      </Field>

      {asking && (
        <Button type="button" variant="secondary" size="sm" onClick={onConfirm}>
          <Check className="size-3.5" /> Yes, that list looks right
        </Button>
      )}
    </Section>
  )
}

/** One numbered step of the form, with a tick once its fields are filled. */
function Section({
  step,
  icon: Icon,
  title,
  hint,
  done,
  flagged = false,
  children,
}: {
  step: number
  icon: ComponentType<{ className?: string }>
  title: string
  hint?: string
  done?: boolean
  /** Draws attention to a step that is complete-able but empty (the website). */
  flagged?: boolean
  children: ReactNode
}) {
  return (
    <Card className={clsx(flagged && 'border-brand/40')}>
      <CardHeader className="flex items-start gap-3">
        <span
          className={clsx(
            'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
            done
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
              : 'border-line bg-surface text-ink-50'
          )}
        >
          {done ? <Check className="size-4" /> : step}
        </span>
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Icon className="text-brand size-4 shrink-0" />
            {title}
          </CardTitle>
          {hint && <p className="text-ink-50 mt-1 text-xs leading-relaxed">{hint}</p>}
        </div>
      </CardHeader>
      <CardBody className="space-y-5 pt-4">{children}</CardBody>
    </Card>
  )
}

/** A labelled field with room for a plain-English line about why we ask. */
function Field({
  label,
  htmlFor,
  hint,
  required = false,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="text-ink mb-0.5 flex items-center gap-1.5 text-[13px]">
        {label}
        {required ? (
          <span className="text-brand" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="text-ink-30 text-[11px] font-normal">optional</span>
        )}
      </Label>
      {hint && <p className="text-ink-50 mb-2 text-xs leading-relaxed">{hint}</p>}
      {children}
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
