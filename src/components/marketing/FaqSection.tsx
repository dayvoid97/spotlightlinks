import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { FAQS, type Faq } from '../../lib/marketing'

/**
 * schema.org FAQPage for this section. Emitted explicitly rather than left to
 * the crawler because the accordion *unmounts* closed answers — a rendering
 * crawler would otherwise only ever find the one open answer. Built from the
 * same array the section renders so the markup and the visible copy can never
 * disagree, which is also what Google's FAQ guidelines require.
 */
function faqJsonLd(items: Faq[]) {
  const doc = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
  // Escape `<` so a future answer containing markup can't close this script tag.
  return JSON.stringify(doc).replace(/</g, '\\u003c')
}

interface FaqSectionProps {
  /** Defaults to the site-wide FAQS. /about passes its own ABOUT_FAQS. */
  items?: Faq[]
  eyebrow?: string
  heading?: string
  /** Anchor id. Two FAQ sections must never both claim `#faq` on one page. */
  id?: string
}

/**
 * FAQ accordion for the public pages. Content is grounded in the product docs
 * and the company blog — see src/lib/marketing.ts. First item open by default
 * so the section never reads as an empty stack of headers.
 */
export function FaqSection({
  items = FAQS,
  eyebrow = 'Questions, answered',
  heading = 'Frequently asked',
  id = 'faq',
}: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id={id} className="scroll-mt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(items) }} />
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-brand text-xs font-semibold uppercase tracking-[0.14em]">{eyebrow}</p>
          <h2 className="text-ink mt-2 text-3xl font-semibold sm:text-4xl">{heading}</h2>
        </div>

        <div className="mt-8 divide-y divide-line border-line overflow-hidden rounded-2xl border">
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className="bg-surface">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="hover:bg-surface-2/60 flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition"
                >
                  <span className="text-ink text-sm font-semibold sm:text-base">{item.q}</span>
                  <ChevronDown
                    className={clsx(
                      'text-ink-30 size-4 shrink-0 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-ink-50 max-w-none text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
