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
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
          <div className="bg-brand flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
            <Store className="size-6" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-brand flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] sm:justify-start">
              <MapPin className="size-3.5" /> Queens, New York
            </p>
            <h2 className="text-ink mt-1.5 text-xl font-semibold sm:text-2xl">
              Proudly serving local businesses across Queens, NYC
            </h2>
            <p className="text-ink-70 mt-1.5 text-sm leading-relaxed">
              Hardware stores, pizzerias, discount shops, restaurants and takeout counters — real
              storefronts, run by people we can walk to. If your customers are in Queens, so are we.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-x-2 gap-y-2 sm:justify-start">
          {SERVICE_AREA.neighborhoods.map((n) => (
            <span
              key={n}
              className="border-brand/25 bg-surface/70 text-ink-70 rounded-full border px-2.5 py-1 text-xs font-medium"
            >
              {n}
            </span>
          ))}
          <span className="text-ink-50 px-1 py-1 text-xs font-medium italic">
            and every block in between
          </span>
        </div>
      </div>
    </section>
  )
}
