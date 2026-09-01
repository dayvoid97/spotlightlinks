import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { BookDemoLink } from './BookDemo'
import { CONSENT_EVENT, hasConsentChoice } from './ConsentBanner'
import { BOOKING } from '../lib/marketing'
import { useBlogReaderMode } from '../context/blog-reader-context'

/**
 * The persistent "Schedule a consultation" button on the blog.
 *
 * Every article already ends in a <BookDemoCta>, but a 2,000-word field report
 * is a long way to scroll before the reader is offered anything — and readers
 * who bounce mid-article never see the footer CTA at all. This pins the same
 * destination (BOOKING.url, the Google Calendar appointment schedule) to the
 * corner for the whole read.
 *
 * Always carries its label. An icon-only circle is smaller, but a bare calendar
 * glyph does not tell a first-time reader what pressing it does — and a CTA
 * nobody understands is worse than no CTA. The label just shrinks on phones
 * rather than disappearing.
 *
 * Placement rules, all of which exist to avoid stepping on something else:
 *   - Bottom-RIGHT, so it never collides with the .md pill (bottom-left).
 *   - z-40, under the cookie banner's z-50 — and hidden outright while that
 *     banner is up, since they would otherwise occupy the same corner.
 *   - Not rendered in machine mode: that view is plain markdown for crawlers,
 *     and a floating marketing CTA is not part of the document.
 */

/** Blog only — the index and every article. */
const FAB_ROUTES = /^\/blog(\/|$)/

export function BookDemoFab() {
  const { pathname } = useLocation()
  const { isMachine } = useBlogReaderMode()
  const [consentSettled, setConsentSettled] = useState(true)

  // The cookie banner owns this corner until the visitor answers it. Its choice
  // is same-tab, so `storage` never fires — ConsentBanner emits CONSENT_EVENT.
  useEffect(() => {
    const sync = () => setConsentSettled(hasConsentChoice())
    sync()
    window.addEventListener(CONSENT_EVENT, sync)
    return () => window.removeEventListener(CONSENT_EVENT, sync)
  }, [])

  if (isMachine || !consentSettled || !FAB_ROUTES.test(pathname)) return null

  // Carries the article slug into GA4, so a booked call can be attributed to the
  // post that produced it — and told apart from a click on the footer CTA.
  const slug = pathname.replace(/^\/blog\/?/, '')
  const source = slug ? `blog-fab:${slug}` : 'blog-fab:index'

  return (
    <BookDemoLink
      source={source}
      className={
        'bg-brand hover:bg-brand-dark focus-visible:ring-brand fixed bottom-4 right-4 z-40 ' +
        'flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg sm:px-5 ' +
        'text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs ' +
        'transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
      }
    >
      <CalendarDays className="size-4 shrink-0" />
      {BOOKING.fabCta}
    </BookDemoLink>
  )
}
