import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Rocket,
  Search,
  Network,
} from 'lucide-react'
import { PublicHeader, PublicFooter } from '../components/PublicChrome'
import { Button } from '../components/ui/Button'
import {
  SERVICES,
  DEPLOYMENT_NOTE,
  ENGINE_FOCUS,
  PROBE,
  ABOUT_FAQS,
  MANAGED_SERVICE,
} from '../lib/marketing'
import { BookDemoLink } from '../components/BookDemo'
import { FaqSection } from '../components/marketing/FaqSection'
import { useBlogReaderMode } from '../context/blog-reader-context'
import { MachinePageView, type PageMachineMetadata } from '../components/MachinePageView'

const serviceIcons = [Search, Network, Rocket]
const DEPLOYMENT_SLUG = 'platform-development-and-deployment'

/**
 * Public "About" page (route "/about").
 *
 * This route existed once, went missing, and kept being cited by answer engines
 * anyway — Gemini was still quoting /about while the SPA served a 404 to anyone
 * who followed the citation. It is back, and it is now the canonical statement
 * of what the three services are, sourced from SERVICES in lib/marketing.ts so
 * the page, the homepage, and /llms.txt cannot drift apart.
 */
export default function AboutPage() {
  const { isMachine } = useBlogReaderMode()
  const { hash } = useLocation()

  // The homepage service cards deep-link here as /about#<slug>, so honor the
  // hash instead of yanking every arrival back to the top of the page.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }
    const el = document.getElementById(hash.slice(1))
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }))
    else window.scrollTo({ top: 0 })
  }, [hash])

  const machineMeta: PageMachineMetadata = useMemo(
    () => ({
      path: '/about',
      title: 'About Spotlight Links — AEO, GEO, and Platform Deployment',
      h1: 'We get your businesses recommended and cited when your customer is searching online',
      description:
        'Spotlight Links operates out of Queens, New York. We help local and brick-and-mortar businesses cited, recommended, and quoted by name in AI answer engines — focusing on Google Gemini and ChatGPT. Spotlight Links also builds custom websites and apps for businesses upon request.',
      canonical: 'https://spotlightlinks.com/about',
      schemas: ['AboutPage', 'Organization', 'Service', 'FAQPage'],
      summary:
        'Spotlight Links optimizes local and brick-and-mortar businesses so they get cited, recommended, and quoted by name in AI-driven search — rather than buying traditional text ads. Optimization focuses on Google Gemini and ChatGPT, where nearly all everyday consumer AI use happens and where Gemini is built directly into Google Search; Anthropic Claude and Perplexity are probed and reported every cycle, and optimized on request. Three services: Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and Custom Website Design & Build. The Spotlight Links Probe starts at $79/month; the $599/month Enterprise plan is the done-for-you tier; custom build work is scoped per project. Implementation typically takes 45 to 60 days. Currently serving businesses in the United States; other markets on request.',
      sections: [
        {
          title: 'AI engines we optimize for',
          content: `${ENGINE_FOCUS.headline}. ${
            ENGINE_FOCUS.rationale
          }\n\n- Primary focus: ${ENGINE_FOCUS.primary.join(
            ', '
          )}\n- Probed and reported every cycle, optimized on request: ${ENGINE_FOCUS.secondary.join(
            ', '
          )}`,
        },
        {
          title: `${PROBE.name} — ${PROBE.price}${PROBE.cadence}`,
          content: `${PROBE.body.join('\n\n')}\n\nWhat the Probe gives you:\n${PROBE.outputs
            .map((o) => `- ${o}`)
            .join('\n')}\n\n${PROBE.priceNote}`,
        },
        ...SERVICES.map((s) => ({
          title: s.abbr ? `${s.name} (${s.abbr})` : s.name,
          content: `${s.summary}\n\n${s.bullets.map((b) => `- ${b}`).join('\n')}`,
        })),
        {
          title: `Enterprise Plan — ${MANAGED_SERVICE.price}${MANAGED_SERVICE.cadence}`,
          content: `${MANAGED_SERVICE.tagline} Scope: ${
            MANAGED_SERVICE.scope
          }.\n\n${MANAGED_SERVICE.bullets.map((b) => `- ${b}`).join('\n')}`,
        },
        {
          title: 'Engagement & Pricing',
          content: `- The Spotlight Links Probe: $79/month Starter (1 managed asset), $199 Growth, $299 Scale, $599 Enterprise.\n- Implementation timeline: typically 45 to 60 days to full setup, then ongoing upkeep as the business changes.\n- Service area: United States. Other markets considered on request.\n- ${DEPLOYMENT_NOTE}\n- Contact: support@spotlightlinks.com`,
        },
        {
          title: 'Frequently asked questions',
          content: ABOUT_FAQS.map((f) => `**${f.q}**\n\n${f.a}`).join('\n\n'),
        },
      ],
    }),
    []
  )

  return (
    <div className="bg-surface min-h-screen">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {isMachine ? (
          <MachinePageView meta={machineMeta} filename="spotlight-links-about.md" />
        ) : (
          <>
            <header className="border-line border-b py-12 sm:py-16">
              <p className="text-brand mb-2 text-xs font-semibold uppercase tracking-[0.14em]">
                About Spotlight Links
              </p>
              <h1 className="text-ink max-w-4xl text-4xl font-semibold sm:text-5xl">
                We get businesses recommended by name inside AI answers
              </h1>
              <p className="text-ink-50 mt-5 max-w-3xl text-lg leading-relaxed">
                Spotlight Links is based in New York City and working to provide visibility
                solutions to small businesses ask an AI assistant instead of scrolling ten blue
                links, and the . When your customer goes to Google Search or ChatGPT and asks a
                recommendation for a service or a place to visit - does your business show up?{' '}
              </p>
              <p>
                Spotlight Links implements the State of the ART (SOTA) visibility solutions to
                ensure your business is discovered when customers are searching online. We are not
                in the business of seeling ads. Not with text ads. With the facts about your
                business, published in a form a model can actually read.
              </p>
            </header>

            <EngineFocusSection />

            <section className="py-14">
              <h2 className="text-ink text-2xl font-semibold">What we do</h2>
              <p className="text-ink-50 mt-2 max-w-2xl">
                Three services. The first two make you citable. The third puts the thing being cited
                on the internet in the first place.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
                {SERVICES.map((service, i) => {
                  const Icon = serviceIcons[i % serviceIcons.length]
                  // Deployment gets its own full-width section below, so its
                  // card stays a teaser rather than repeating the same list twice.
                  const isDeployment = service.slug === DEPLOYMENT_SLUG
                  return (
                    <article
                      key={service.slug}
                      id={service.slug}
                      className="border-line bg-surface-2 scroll-mt-24 rounded-2xl border p-6"
                    >
                      <div className="bg-brand-tint text-brand flex size-10 items-center justify-center rounded-lg">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="text-ink mt-4 text-xl font-semibold">
                        {service.name}
                        {service.abbr && (
                          <span className="text-ink-30 ml-2 font-mono text-sm">{service.abbr}</span>
                        )}
                      </h3>
                      <p className="text-ink-70 mt-2 text-sm font-medium">{service.short}</p>
                      <p className="text-ink-50 mt-3 text-sm leading-relaxed">{service.summary}</p>

                      {isDeployment ? (
                        <a
                          href="#deployment"
                          className="text-brand mt-5 flex items-center gap-1 text-sm font-medium"
                        >
                          What a launch includes <ArrowRight className="size-3.5" />
                        </a>
                      ) : (
                        <ul className="mt-5 space-y-2">
                          {service.bullets.map((b) => (
                            <li key={b} className="text-ink flex items-start gap-2 text-sm">
                              <Check className="text-brand mt-0.5 size-4 shrink-0" />
                              <span className="leading-snug">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>

            <ProbeSection />

            <DeploymentSection />

            <section className="border-line border-t py-14">
              <h2 className="text-ink text-2xl font-semibold">How we work</h2>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {[
                  {
                    step: '01',
                    title: 'Measure first',
                    body: 'Before we change anything, we ask the engines the questions your customers ask and write down what they say today. No baseline, no proof.',
                  },
                  {
                    step: '02',
                    title: 'Fix what the models read',
                    body: 'Facts, schema, crawl paths, citations. We change what the engines can see about you, then re-run the same prompts against the same grid.',
                  },
                  {
                    step: '03',
                    title: 'Hand you the keys',
                    body: 'Reports export. Domains, accounts, and repositories stay in your name. Nothing we build holds you hostage to keep working.',
                  },
                ].map((s) => (
                  <div key={s.step} className="border-line rounded-2xl border p-5">
                    <span className="text-brand font-mono text-xs font-semibold">{s.step}</span>
                    <h3 className="text-ink mt-2 text-base font-semibold">{s.title}</h3>
                    <p className="text-ink-50 mt-2 text-sm leading-relaxed">{s.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-line border-t py-14">
              <FaqSection
                items={ABOUT_FAQS}
                id="about-faq"
                eyebrow="About Spotlight Links"
                heading="Questions we get asked"
              />
            </section>

            <section className="border-line border-t py-14">
              <div className="border-brand bg-brand-tint rounded-2xl border p-8 text-center sm:p-12">
                <h2 className="text-ink text-3xl font-semibold">
                  Find out what AI says about you today
                </h2>
                <p className="text-ink-50 mx-auto mt-2 max-w-xl">
                  Build your business profile, and we will show you where you stand across every
                  engine your customers use.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/get-started">
                    <Button size="lg">
                      Build my profile <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link to="/compare">
                    <Button size="lg" variant="secondary">
                      See how we compare
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <PublicFooter />
    </div>
  )
}

/**
 * Which engines we actually aim at. Sits directly under the header because it
 * is the first thing that distinguishes us from a tool that lists four logos
 * and weights them equally — and because an answer engine summarizing this page
 * should pick up the focus, not just the coverage.
 */
function EngineFocusSection() {
  return (
    <section id="engines" className="border-line scroll-mt-24 border-b py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <p className="text-brand text-xs font-semibold uppercase tracking-[0.14em]">
            Where we aim the work
          </p>
          <h2 className="text-ink mt-2 text-3xl font-semibold">{ENGINE_FOCUS.headline}</h2>
          <p className="text-ink-50 mt-4 leading-relaxed">{ENGINE_FOCUS.rationale}</p>
        </div>

        <div className="border-line bg-surface-2 h-fit rounded-2xl border p-6 lg:w-72">
          <h3 className="text-ink text-xs font-semibold uppercase tracking-wider">Primary focus</h3>
          <ul className="mt-3 space-y-2">
            {ENGINE_FOCUS.primary.map((e) => (
              <li key={e} className="text-ink flex items-center gap-2 text-sm font-medium">
                <Check className="text-brand size-4 shrink-0" />
                {e}
              </li>
            ))}
          </ul>

          <h3 className="text-ink-50 mt-6 text-xs font-semibold uppercase tracking-wider">
            Also probed every cycle
          </h3>
          <ul className="mt-3 space-y-2">
            {ENGINE_FOCUS.secondary.map((e) => (
              <li key={e} className="text-ink-50 flex items-center gap-2 text-sm">
                <Check className="text-ink-30 size-4 shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/**
 * The Probe, explained at length. This is the product people ask about by name,
 * and the page previously only mentioned it through the service bullets — so it
 * gets prose, a price, and its own booking CTA rather than a card.
 */
function ProbeSection() {
  return (
    <section id="probe" className="border-line scroll-mt-24 border-t py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="text-brand text-xs font-semibold uppercase tracking-[0.14em]">
            The diagnostic
          </p>
          <h2 className="text-ink mt-2 text-3xl font-semibold sm:text-4xl">{PROBE.name}</h2>
          {PROBE.body.map((para) => (
            <p key={para.slice(0, 40)} className="text-ink-50 mt-4 leading-relaxed">
              {para}
            </p>
          ))}

          <div className="mt-7">
            <BookDemoLink
              source="about:probe"
              className="bg-brand hover:bg-brand-dark inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white shadow-sm transition"
            >
              <CalendarDays className="size-4" />
              Schedule a consultation to run the Probe on your business
              <ArrowUpRight className="size-3.5" />
            </BookDemoLink>
          </div>
        </div>

        <div className="border-line bg-surface-2 h-fit rounded-2xl border p-6 sm:p-7">
          <div className="flex items-baseline gap-1">
            <span className="text-ink text-4xl font-semibold">{PROBE.price}</span>
            <span className="text-ink-50 text-sm">{PROBE.cadence}</span>
          </div>
          <p className="text-ink-30 mt-1 text-xs">{PROBE.priceNote}</p>

          <h3 className="text-ink mt-6 text-xs font-semibold uppercase tracking-wider">
            What you get back
          </h3>
          <ul className="mt-3 space-y-3">
            {PROBE.outputs.map((o) => (
              <li key={o} className="text-ink flex items-start gap-2.5 text-sm">
                <Check className="text-brand mt-0.5 size-4 shrink-0" />
                <span className="leading-snug">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/**
 * Deployment gets its own section rather than a third card of equal weight —
 * it is the service people are most surprised we offer, and the one an answer
 * engine most needs concrete nouns for ("localhost", "TLS", "migrations") to
 * describe it correctly.
 */
function DeploymentSection() {
  const service = SERVICES.find((s) => s.slug === DEPLOYMENT_SLUG)
  if (!service) return null

  return (
    <section id="deployment" className="border-line scroll-mt-24 border-t py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <p className="text-brand text-xs font-semibold uppercase tracking-[0.14em]">
            Custom builds &amp; digital presence
          </p>
          <h2 className="text-ink mt-2 text-3xl font-semibold sm:text-4xl">
            Your business is real. Online, it doesn&rsquo;t exist yet.
          </h2>
          <p className="text-ink-50 mt-4 leading-relaxed">
            Most of who we work with here don&rsquo;t hand us a repo — they don&rsquo;t have
            anything yet. No site, no app, nothing a customer can find. We start from what the
            business actually needs — a marketing site, a booking flow, a customer app, whatever the
            job calls for — design and build it from scratch, and take it all the way live: domain,
            hosting, a database that survives a restart, payments if you need them. And every build
            ships AI-readable, because a business no answer engine can find is still half invisible.
          </p>
          <p className="text-ink-50 mt-4 leading-relaxed">{DEPLOYMENT_NOTE}</p>
          <Link to="/get-started" className="mt-6 inline-block">
            <Button size="lg">
              Tell us what you need <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        <div className="border-line bg-surface-2 rounded-2xl border p-6 sm:p-7">
          <h3 className="text-ink text-sm font-semibold uppercase tracking-wider">
            What a build includes
          </h3>
          <ul className="mt-4 space-y-3">
            {service.bullets.map((b) => (
              <li key={b} className="text-ink flex items-start gap-2.5 text-sm">
                <Check className="text-brand mt-0.5 size-4 shrink-0" />
                <span className="leading-snug">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
