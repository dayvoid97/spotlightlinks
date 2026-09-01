import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { PROBER_FLAGSHIP, PROBER_SCALE_TIERS, MANAGED_SERVICE, BOOKING } from '../../lib/marketing'
import { Button } from '../ui/Button'

export function PricingSection() {
  const trackBookingClick = (tierName: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'pricing_tag', {
        event_category: 'engagement',
        event_label: `Pricing CTA - ${tierName}`,
        button_name: 'Book a demo',
        tier: tierName,
      })
    }
  }

  return (
    <section id="pricing" className="scroll-mt-24 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-brand text-xs font-semibold uppercase tracking-[0.14em]">
          Pricing & Services
        </p>
        <h2 className="text-ink mt-2 text-3xl font-bold sm:text-4xl">
          Choose how you want to grow.
        </h2>
        <p className="text-ink-50 mx-auto mt-3 max-w-2xl text-base">
          Use our automated prober software to audit your AI visibility, or partner with us for full
          hands-off web design and AEO management.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-2">
        {/* Track 1: Automated Prober SaaS */}
        <div className="border-line bg-surface-2 shadow-xs flex flex-col justify-between rounded-2xl border p-7">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-brand text-xs font-semibold uppercase tracking-wider">
                Automated Software
              </span>
              <span className="border-line text-ink-50 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                Self-Serve SaaS
              </span>
            </div>
            <h3 className="text-ink mt-3 text-2xl font-bold">{PROBER_FLAGSHIP.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-ink text-4xl font-bold">{PROBER_FLAGSHIP.price}</span>
              <span className="text-ink-50 text-sm">{PROBER_FLAGSHIP.cadence}</span>
            </div>
            <p className="text-ink-50 mt-2 text-sm">{PROBER_FLAGSHIP.tagline}</p>

            <ul className="mt-6 space-y-2.5">
              {PROBER_FLAGSHIP.features.map((f) => (
                <li key={f} className="text-ink flex items-start gap-2.5 text-sm">
                  <Check className="text-brand mt-0.5 size-4 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <a
              href={BOOKING.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackBookingClick('Starter Prober')}
            >
              <Button className="w-full" size="lg" data-analytics-tag="pricing_tag">
                Book prober demo <ArrowRight className="size-4" />
              </Button>
            </a>

            {/* Scale Ladder */}
            <div className="border-line mt-6 border-t pt-5">
              <p className="text-ink text-xs font-semibold uppercase tracking-wide">
                Need more locations?
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PROBER_SCALE_TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className="border-line bg-surface rounded-lg border p-2.5 text-center"
                  >
                    <p className="text-ink text-xs font-semibold">{tier.name}</p>
                    <p className="text-brand text-sm font-bold">
                      {tier.price}
                      {tier.cadence}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Track 2: $599 Full-Service Managed Partner */}
        <div className="border-brand bg-surface relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-7 shadow-lg">
          <div className="bg-brand text-surface absolute right-5 top-5 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
            <Sparkles className="size-3" /> Full-Service Agency
          </div>

          <div>
            <span className="text-brand text-xs font-semibold uppercase tracking-wider">
              Done-For-You Partner
            </span>
            <h3 className="text-ink mt-3 text-2xl font-bold">{MANAGED_SERVICE.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-ink text-4xl font-bold">{MANAGED_SERVICE.price}</span>
              <span className="text-ink-50 text-sm">{MANAGED_SERVICE.cadence}</span>
              <span className="text-brand ml-2 text-xs font-medium">({MANAGED_SERVICE.scope})</span>
            </div>
            <p className="text-ink-50 mt-2 text-sm">{MANAGED_SERVICE.tagline}</p>

            <ul className="mt-6 space-y-2.5">
              {MANAGED_SERVICE.bullets.map((b) => (
                <li key={b} className="text-ink flex items-start gap-2.5 text-sm">
                  <Check className="text-brand mt-0.5 size-4 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <a
              href={BOOKING.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackBookingClick('Managed Partner $599')}
            >
              <Button className="w-full" size="lg" data-analytics-tag="pricing_tag">
                Apply for $599/mo full service <ArrowRight className="size-4" />
              </Button>
            </a>
            <p className="text-ink-30 mt-3 text-center text-xs">
              Special partner pricing available for new business launches.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
