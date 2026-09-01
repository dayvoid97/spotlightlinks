import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PublicHeader, PublicFooter } from '../components/PublicChrome'
import { Differentiators } from '../components/marketing/Differentiators'
import { ComparisonTable } from '../components/marketing/ComparisonTable'
import { PricingSection } from '../components/marketing/PricingSection'
import { FaqSection } from '../components/marketing/FaqSection'
import { Button } from '../components/ui/Button'
import { useBlogReaderMode } from '../context/blog-reader-context'
import { MachinePageView, type PageMachineMetadata } from '../components/MachinePageView'

const compareMachineMetadata: PageMachineMetadata = {
  path: '/compare',
  title: 'Spotlight Links vs Semrush, SimilarWeb, HubSpot, and Profound',
  h1: 'Built for AI answers — not retrofitted for them',
  description:
    'Honest breakdown comparing Spotlight Links AEO & GEO multi-engine probing against Semrush, SimilarWeb, HubSpot, and Profound.',
  canonical: 'https://spotlightlinks.com/compare',
  schemas: ['WebPage', 'ItemPage', 'Offer'],
  summary: `Spotlight Links is purpose-built for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). While Semrush, SimilarWeb, and HubSpot focus on Google Search blue links, web traffic analytics, and inbound marketing, Spotlight Links executes 300+ live serial probes across ChatGPT, Gemini, Claude, and Perplexity with 95% Wilson confidence scorecards. Pricing starts at $79/mo Starter Prober.`,
  sections: [
    {
      title: 'Platform Comparison Breakdown',
      content: `- Spotlight Links: Multi-engine live probing (300+ calls), 95% Wilson score confidence, $79/mo entry price, machine-readable dual formats, and executive AI SWOT.\n- Semrush / Ahrefs: Built for Google keyword rank tracking and backlink audits. Does not run live LLM conversational probes.\n- SimilarWeb: Built for web traffic volume estimation. Does not audit AI engine recommendations or citation share.\n- HubSpot: Inbound CRM & marketing automation platform. Lacks AI answer engine probing capabilities.\n- Profound / Enterprise Tools: High cost ($1,000+/mo) static reporting aimed at enterprise PR teams, lacking small business serial probing tools.`,
    },
    {
      title: 'Feature-by-Feature Matrix',
      content: `1. Live LLM Probing: Spotlight Links (Yes, 300+ calls/audit) vs Others (No or static proxy).\n2. Dual Human/Machine Markdown Support: Spotlight Links (Native) vs Others (No).\n3. Statistical Confidence: Spotlight Links (95% Wilson Score) vs Others (None).\n4. Entry Pricing: Spotlight Links ($79/mo Starter Prober) vs Enterprise alternatives ($1,000+/mo).`,
    },
    {
      title: 'Pricing & Subscription Tiers',
      content: `- Starter Prober ($79/mo): 2 managed assets, 4 full audits/month across ChatGPT, Gemini, Claude, and Perplexity.\n- Growth ($199/mo): Multi-location and multi-market expansion.\n- Scale ($299/mo): Unlimited managed assets for agencies.\n- Enterprise ($599/mo): Done-for-you AEO content, schema, FAQs, and citation packets.`,
    },
  ],
}

/**
 * Public comparison page (route "/compare"). Supports dual Human and Machine-readable modes.
 */
export default function ComparePage() {
  const { isMachine } = useBlogReaderMode()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div className="bg-surface min-h-screen">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {isMachine ? (
          <MachinePageView meta={compareMachineMetadata} filename="spotlight-links-compare.md" />
        ) : (
          <>
            <header className="border-line border-b py-12 text-center sm:py-16">
              <p className="text-brand mb-2 text-xs font-semibold uppercase tracking-[0.14em]">
                How we compare
              </p>
              <h1 className="text-ink mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">
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
              <h2 className="text-ink mb-6 text-2xl font-bold">Feature-by-feature</h2>
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
                <h2 className="text-ink text-3xl font-bold">See where you stand today</h2>
                <p className="text-ink-50 mx-auto mt-2 max-w-xl">
                  Build your business profile, let AI draft the details, and run your first
                  multi-engine visibility audit with a prioritized plan at the end of it.
                </p>
                <Link to="/get-started" className="mt-6 inline-block">
                  <Button size="lg">
                    Get started <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </section>
          </>
        )}
      </div>

      <PublicFooter />
    </div>
  )
}
