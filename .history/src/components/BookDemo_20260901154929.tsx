import type { ReactNode } from 'react'
import clsx from 'clsx'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { BOOKING } from '../lib/marketing'

/**
 * "Book a demo" — the single conversion path now that onboarding is manual
 * rather than self-serve checkout.
 *
 * Both exports take a `source`, which is the whole point of routing every
 * booking click through one component: the blog is the top of the funnel, so
 * knowing *which article* sent someone to the calendar is the measurement that
 * decides what gets written next. It rides along as a GA4 event parameter.
 *
 * The destination is a Google Calendar appointment schedule (BOOKING.url in
 * src/lib/marketing.ts), so these are real anchors, not router links, and they
 * open in a new tab — a reader mid-article should still have the article when
 * they come back.
 */

/** GA4 event. Guarded: gtag is absent until the tag loads, and Consent Mode may deny storage. */
function trackBooking(source: string) {
  window.gtag?.('event', 'book_demo_click', {
    event_category: 'engagement',
    source,
    destination: 'google_calendar_appointments',
  })
}

interface BookDemoLinkProps {
  /** Where the click came from, e.g. `blog:why-aeo-geo-matters-now`. */
  source: string
  children?: ReactNode
  className?: string
}

/** Inline anchor to the booking page. Unstyled by default — pass className. */
export function BookDemoLink({ source, children, className }: BookDemoLinkProps) {
  return (
    <a
      href={BOOKING.url}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackBooking(source)}
      className={className}
    >
      {children ?? BOOKING.label}
    </a>
  )
}

/**
 * The end-of-article call to action. Deliberately built from the same tokens as
 * the card it replaced, so it reads as part of the article rather than an ad
 * dropped underneath it.
 */
export function BookDemoCta({ source, className }: { source: string; className?: string }) {
  return (
    <section
      className={clsx(
        'border-line bg-surface-2 rounded-2xl border p-6 text-center sm:p-8',
        className
      )}
    >
      <h2 className="text-ink text-2xl font-semibold">{BOOKING.headline}</h2>
      <p className="text-ink-50 mx-auto mt-3 max-w-xl text-sm leading-relaxed">{BOOKING.blurb}</p>

      <BookDemoLink
        source={source}
        className="bg-brand hover:bg-brand-dark mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition"
      >
        <CalendarDays className="size-4" />
        {BOOKING.cta}
        <ArrowUpRight className="size-3.5" />
      </BookDemoLink>
    </section>
  )
}
