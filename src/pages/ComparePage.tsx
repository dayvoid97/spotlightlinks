import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PublicHeader, PublicFooter } from '../components/PublicChrome'
import { Differentiators } from '../components/marketing/Differentiators'
import { ComparisonTable } from '../components/marketing/ComparisonTable'
import { PricingSection } from '../components/marketing/PricingSection'
import { FaqSection } from '../components/marketing/FaqSection'
import { Button } from '../components/ui/Button'

/**
 * Public comparison page (route "/compare"). Positions Spotlight Links against
 * the tools businesses evaluate it beside — professional, sourced, hedged.
 * All copy/data lives in src/lib/marketing.ts. See docs/13-marketing-pages.md.
 */
export default function ComparePage() {
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div className="bg-surface min-h-screen">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="border-line border-b py-12 text-center sm:py-16">
          <p className="text-brand mb-2 text-xs font-semibold uppercase tracking-[0.14em]">
            How we compare
          </p>
          <h1 className="text-ink mx-auto max-w-3xl text-4xl font-semibold sm:text-5xl">
            Built for AI answers — not retrofitted for them
          </h1>
          <p className="text-ink-50 mx-auto mt-4 max-w-2xl text-lg">
            The established platforms are excellent at what they were built for. But AEO and GEO are
            a new discipline, and winning the AI recommendation takes a tool designed for it from
            the ground up. Here's an honest look at where each fits.
          </p>
        </header>

        <section className="py-12">
          <Differentiators />
        </section>

        <section className="pb-12">
          <h2 className="text-ink mb-6 text-2xl font-semibold">Feature-by-feature</h2>
          <ComparisonTable />
        </section>

        <section className="border-line border-t py-14">
          <PricingSection />
        </section>

        <section className="border-line border-t py-14">
          <FaqSection />
        </section>

        <section className="py-16">
          <div className="border-brand bg-brand-tint rounded-2xl border p-8 text-center sm:p-12">
            <h2 className="text-ink text-3xl font-semibold">See where you stand today</h2>
            <p className="text-ink-50 mx-auto mt-2 max-w-xl">
              Run your first multi-engine AI-visibility audit and get a prioritized plan — build
              your context and synthesize with AI for free.
            </p>
            <Link to="/get-started" className="mt-6 inline-block">
              <Button size="lg">
                Get started free <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  )
}
