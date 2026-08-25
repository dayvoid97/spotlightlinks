import { MapPin, Store } from 'lucide-react'
import { SERVICE_AREA } from '../../lib/marketing'

/**
 * "We are actually from here" proof, directly under the hero.
 *
 * Local owners buy from people who know their block, so this names real
 * neighborhoods rather than claiming national coverage. Deliberately no
 * customer count or logos — we say who we serve and where, not a number we
 * would have to keep true.
 *
 * The neighborhood list is SERVICE_AREA in lib/marketing.ts, shared with the
 * machine view and /llms.txt so a crawler reads the same service area a
 * customer does.
 */
export function QueensBanner() {
  return (
    <section className="border-line bg-brand-tint border-y">
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <div className="bg-brand mx-auto flex size-14 items-center justify-center rounded-2xl text-white shadow-sm sm:size-16">
          <Store className="size-7 sm:size-8" />
        </div>

        <p className="text-brand mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
          <MapPin className="size-3.5" /> Queens, New York
        </p>

        <h2 className="text-ink mt-3 text-balance text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
          Proudly serving local businesses across Queens, NYC
        </h2>

        <p className="text-ink-70 mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg">
          Hardware stores, pizzerias, discount shops, restaurants and takeout counters — real
          storefronts, run by people we can walk to. If your customers are in Queens, so are we.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {SERVICE_AREA.neighborhoods.map((n) => (
            <span
              key={n}
              className="border-brand/25 bg-surface/70 text-ink-70 rounded-full border px-3 py-1.5 text-xs font-medium sm:text-sm"
            >
              {n}
            </span>
          ))}
          <span className="text-ink-50 px-1 py-1.5 text-xs font-medium italic sm:text-sm">
            and every block in between
          </span>
        </div>
      </div>
    </section>
  )
}
