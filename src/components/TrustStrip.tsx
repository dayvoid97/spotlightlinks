import { MapPin, Zap, MessageSquareQuote } from 'lucide-react'

/**
 * The three claims directly under the hero.
 *
 * Written for the person who actually buys this — a local owner deciding
 * whether it is worth $79 — so it talks about their block and their
 * competitors. Engine names, probe counts, and Wilson intervals live in the
 * machine view and /llms.txt, where the reader is a crawler.
 *
 * Every color class here used to point at tokens that were never defined
 * (`bg-blood-900`, `text-lambo-gold`, `text-yang-white`, …) — leftovers from an
 * earlier palette. Tailwind silently drops classes it cannot resolve, so the
 * icons rendered as invisible glyphs in transparent boxes and the labels
 * inherited whatever color happened to be around. Rebuilt on the semantic
 * tokens the rest of the site uses, so it themes with everything else.
 */
const TRUST_SIGNALS = [
  {
    icon: MapPin,
    title: 'Your blocks, not the whole country',
    subtitle: 'Scoped to your ZIP and the areas right around it',
  },
  {
    icon: Zap,
    title: 'First report in about 10 minutes',
    subtitle: 'Watch it run — no waiting on a consultant',
  },
  {
    icon: MessageSquareQuote,
    title: 'You see the actual answers',
    subtitle: 'Word for word, including who got named instead of you',
  },
]

export function TrustStrip() {
  return (
    <section className="border-line bg-surface-2/60 w-full border-y">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="divide-line grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {TRUST_SIGNALS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex items-center justify-center gap-3.5 px-4 py-3"
              >
                <div className="bg-brand-tint text-brand border-brand/20 flex size-10 shrink-0 items-center justify-center rounded-lg border">
                  <Icon className="size-5" />
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-ink text-sm font-semibold">{item.title}</span>
                  <span className="text-ink-50 text-xs">{item.subtitle}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
