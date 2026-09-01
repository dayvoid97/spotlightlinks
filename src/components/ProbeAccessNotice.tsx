import { useState } from 'react'
import { CalendarClock, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { BookDemoLink } from './BookDemo'
import { BOOKING, PROBE_ACCESS } from '../lib/marketing'

/**
 * The standing notice that probes are onboarded by request rather than run
 * self-serve. Shown on every surface where somebody would otherwise expect to
 * press a button and get a probe: /get-started, /signup, /clients/new.
 *
 * Structured as action-first, reason-second. What a visitor needs is the one
 * paragraph telling them to book, what it costs, and how long it takes; the
 * capacity explanation is the honest justification behind that, and it sits
 * behind a disclosure so the notice never becomes a wall of text over a form
 * somebody is trying to fill in.
 *
 * Copy lives in PROBE_ACCESS (src/lib/marketing.ts) so a policy this load-
 * bearing is worded identically everywhere it appears.
 */
export function ProbeAccessNotice({ source, className }: { source: string; className?: string }) {
  const [showWhy, setShowWhy] = useState(false)

  return (
    <section
      className={clsx('border-brand bg-brand-tint rounded-xl border p-5 shadow-sm', className)}
      aria-labelledby="probe-access-headline"
    >
      <div className="flex items-start gap-3">
        <div className="bg-brand/10 text-brand rounded-lg p-2">
          <CalendarClock className="size-5 shrink-0" />
        </div>

        <div className="min-w-0 space-y-3">
          <p id="probe-access-headline" className="text-ink text-base font-semibold">
            {PROBE_ACCESS.headline}
          </p>

          <p className="text-ink-70 text-sm leading-relaxed">{PROBE_ACCESS.lead}</p>

          <button
            type="button"
            onClick={() => setShowWhy((v) => !v)}
            aria-expanded={showWhy}
            className="text-brand hover:text-brand-dark inline-flex items-center gap-1 text-sm font-medium"
          >
            Why are we doing this?
            <ChevronDown className={clsx('size-3.5 transition-transform', showWhy && 'rotate-180')} />
          </button>

          {showWhy && (
            <div className="space-y-2">
              {PROBE_ACCESS.why.map((paragraph) => (
                <p key={paragraph} className="text-ink-50 text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          <BookDemoLink
            source={source}
            className="bg-brand hover:bg-brand-dark mt-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition"
          >
            <CalendarClock className="size-4" />
            {BOOKING.cta}
          </BookDemoLink>
        </div>
      </div>
    </section>
  )
}
