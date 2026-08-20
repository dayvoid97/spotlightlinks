import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { FLAGSHIP, SCALE_TIERS } from '../../lib/marketing'
import { Button } from '../ui/Button'

/**
 * Marketing pricing block: the $79 flagship front and center, with the higher
 * tiers as a compact ladder beneath. Shared by the homepage and /compare.
 * Static copy on purpose — the real, purchasable plan objects live behind auth
 * on BillingPage (GET /api/checkout/plans). See src/lib/marketing.ts.
 */
export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-brand text-xs font-semibold uppercase tracking-[0.14em]">Pricing</p>
        <h2 className="text-ink mt-2 text-3xl font-semibold sm:text-4xl">One honest price.</h2>
        <p className="text-ink-50 mx-auto mt-3 max-w-2xl">
          One monthly subscription for Answer Engine discovery and optimization:{' '}
          <span className="text-ink font-medium">$79 a month</span> for two locations or clients,
          audited weekly on request, with the score and report delivered to your email or phone.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-lg">
        <div className="border-brand bg-surface-2 relative overflow-hidden rounded-2xl border-2 p-7 shadow-sm">
          <div className="bg-brand-tint text-brand absolute right-5 top-5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
            Most popular
          </div>
          <p className="text-ink text-sm font-semibold">{FLAGSHIP.name}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-ink text-5xl font-semibold">{FLAGSHIP.price}</span>
            <span className="text-ink-50 text-sm">{FLAGSHIP.cadence}</span>
          </div>
          <p className="text-ink-50 mt-2 text-sm">{FLAGSHIP.tagline}</p>

          <ul className="mt-6 space-y-2.5">
            {FLAGSHIP.features.map((f) => (
              <li key={f} className="text-ink flex items-start gap-2.5 text-sm">
                <Check className="text-brand mt-0.5 size-4 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Link to="/get-started" className="mt-7 block">
            <Button className="w-full" size="lg">
              Start your first audit <ArrowRight className="size-4" />
            </Button>
          </Link>
          <p className="text-ink-30 mt-3 text-center text-xs">
            Build your profile and let AI draft it before you subscribe. The subscription is what
            runs the live audits.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <p className="text-ink-50 text-center text-sm">
          Scaling up? These grow with you — available once you're in.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SCALE_TIERS.map((t) => (
            <div key={t.name} className="border-line bg-surface rounded-xl border p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-ink text-sm font-semibold">{t.name}</span>
                <span className="text-ink-50 text-sm">{t.price}/mo</span>
              </div>
              <p className="text-ink-50 mt-1.5 text-xs">{t.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
