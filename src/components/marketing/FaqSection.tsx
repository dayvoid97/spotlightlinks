import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { FAQS } from '../../lib/marketing'

/**
 * FAQ accordion for the public pages. Content is grounded in the product docs
 * and the company blog — see src/lib/marketing.ts. First item open by default
 * so the section never reads as an empty stack of headers.
 */
export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-brand text-xs font-semibold uppercase tracking-[0.14em]">
            Questions, answered
          </p>
          <h2 className="text-ink mt-2 text-3xl font-semibold sm:text-4xl">Frequently asked</h2>
        </div>

        <div className="mt-8 divide-y divide-line border-line overflow-hidden rounded-2xl border">
          {FAQS.map((item, i) => {
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
