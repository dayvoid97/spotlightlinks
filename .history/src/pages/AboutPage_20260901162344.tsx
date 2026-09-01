import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CalendarDays } from 'lucide-react'
import { PublicHeader, PublicFooter } from '../components/PublicChrome'
import {
  SERVICES,
  DEPLOYMENT_NOTE,
  ENGINE_FOCUS,
  PROBE,
  ABOUT_FAQS,
  MANAGED_SERVICE,
  SERVICE_AREA,
} from '../lib/marketing'
import { BookDemoLink } from '../components/BookDemo'
import { FaqSection } from '../components/marketing/FaqSection'
import { useBlogReaderMode } from '../context/blog-reader-context'
import { MachinePageView, type PageMachineMetadata } from '../components/MachinePageView'

const DEPLOYMENT_SLUG = 'platform-development-and-deployment'

/**
 * Public "About" page (route "/about").
 *
 * This route existed once, went missing, and kept being cited by answer engines
 * anyway — Gemini was still quoting /about while the SPA served a 404 to anyone
 * who followed the citation. It is back, and it is now the canonical statement
 * of what the three services are, sourced from SERVICES in lib/marketing.ts so
 * the page, the homepage, and /llms.txt cannot drift apart.
 *
 * Set in New York civic signage: Helvetica, tight and heavy, ranged left, hard
 * rules, route-bullet numerals, inverted advisory bands. Nothing says a company
 * is from here like the typography the city itself prints in — see the
 * `.signage` block in src/index.css for the type system this page composes.
 * The look stops at this route on purpose; the rest of the site keeps its own
 * voice.
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
      title: 'About Spotlight Links — AEO, GEO, and Platform Deployment Solutions',
      h1: 'Spotlight Links gets your business recommended and cited when customers are searching online. Works with Google Gemini and ChatGPT.',
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
          <div>
            <Masthead />
            <AdvisoryBand />
            <EngineFocusSection />
            <ServicesSection />
            <ProbeSection />
            <DeploymentSection />
            <MethodSection />
            <FactsSection />

            <section className="border-line border-t py-14">
              <FaqSection
                items={ABOUT_FAQS}
                id="about-faq"
                eyebrow="About Spotlight Links"
                heading="Questions we get asked"
              />
            </section>

            <ClosingBand />
          </div>
        )}
      </div>

      <PublicFooter />
    </div>
  )
}

/* ── Shared signage parts ─────────────────────────────────────────────────── */

/** Ranged-left caps label. Every panel on a civic sign carries one. */
function Label({
  children,
  tone = 'brand',
}: {
  children: React.ReactNode
  tone?: 'brand' | 'mute'
}) {
  return (
    <p className={`signage-label ${tone === 'brand' ? 'text-brand' : 'text-ink-50'}`}>{children}</p>
  )
}

/** Square, heavy, high-contrast. Civic print has no rounded corners. */
const SIGNAGE_BUTTON =
  'inline-flex items-center justify-center gap-2 bg-brand px-6 py-3.5 ' +
  'text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-ink'

/* ── Sections ─────────────────────────────────────────────────────────────── */

/**
 * The masthead. A thin agency rule, then the word "About" at poster scale —
 * the two moves that make a page read as printed rather than designed.
 */
function Masthead() {
  return (
    <header className="pt-8">
      <div className="border-line flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-3">
        <span className="signage-label text-ink">Spotlight Links LLC</span>
        <span className="signage-label text-ink-50">
          {SERVICE_AREA.headline} &middot; Serving the United States
        </span>
      </div>

      <h1 className="signage-display text-ink mt-10">About</h1>

      <p className="text-ink mt-10 max-w-4xl text-2xl font-bold leading-[1.1] tracking-[-0.025em] sm:text-4xl">
        Spotlight Links gets your business recommended and cited by name when a customer asks an AI
        where to go.
      </p>

      <div className="mt-8 grid max-w-5xl gap-x-12 gap-y-5 pb-12 sm:grid-cols-2">
        <p className="text-ink-70 text-base leading-relaxed">
          We are based in New York City. Your customers have stopped scrolling ten blue links — they
          ask an assistant for a recommendation and act on the answer they get back. When someone
          goes to Google Search or ChatGPT looking for a service like yours, one question decides
          everything: does your business show up in that answer?
        </p>
        <p className="text-ink-70 text-base leading-relaxed">
          We are not in the business of selling ads, and we do not sell backlinks. Spotlight Links
          builds your facts, your schema, and your digital assets into a block that answer engines
          can read, trust, and quote — the state of the art in visibility, pointed at the place your
          customers are actually searching.
        </p>
      </div>
    </header>
  )
}

/**
 * The inverted advisory band — the black rectangle a station poster uses when
 * it has one thing to tell you. Ours states the shift the whole company exists
 * because of, so it is the first thing read and the last thing forgotten.
 */
function AdvisoryBand() {
  return (
    <section className="bg-brand px-6 py-12 text-white sm:px-10 sm:py-14">
      <p className="signage-label   text-white">Notice to business owners</p>
      <p className="mt-4 max-w-4xl text-2xl font-bold leading-[1.12] tracking-[-0.025em] sm:text-3xl">
        Search has become answers. The ten blue links are no longer the destination — the
        recommendation is.
      </p>
      <p className="text-white font-bold mt-4 max-w-3xl text-sm leading-relaxed">
        If Google Gemini or ChatGPT does not know who you are, it recommends your competitor it
        knows. You don't want to miss our here.
      </p>
    </section>
  )
}

/**
 * Which engines we actually aim at. Sits directly under the band because it is
 * the first thing that distinguishes us from a tool that lists four logos and
 * weights them equally — and because an answer engine summarizing this page
 * should pick up the focus, not just the coverage.
 */
function EngineFocusSection() {
  return (
    <section id="engines" className="border-line scroll-mt-24 border-b py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="max-w-3xl">
          <Label>Where we aim the work</Label>
          <h2 className="text-ink mt-3 text-3xl sm:text-4xl">{ENGINE_FOCUS.headline}</h2>
          <p className="text-ink-70 mt-5 leading-relaxed">{ENGINE_FOCUS.rationale}</p>
        </div>

        <div className="bg-surface-2 h-fit p-6 sm:p-7">
          <Label tone="mute">Primary focus</Label>
          <ul className="mt-3">
            {ENGINE_FOCUS.primary.map((e) => (
              <li
                key={e}
                className="border-line text-ink border-b py-2.5 text-lg font-bold tracking-[-0.02em] last:border-b-0"
              >
                {e}
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <Label tone="mute">Also probed every cycle</Label>
            <ul className="mt-3">
              {ENGINE_FOCUS.secondary.map((e) => (
                <li
                  key={e}
                  className="border-line text-ink-50 border-b py-2.5 text-base font-medium last:border-b-0"
                >
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * The three services, numbered with subway route bullets and separated by rules
 * rather than boxed into cards. Deployment keeps a teaser here because it gets
 * its own full-width section below.
 */
function ServicesSection() {
  return (
    <section className="py-14">
      <Label>What we do</Label>
      <h2 className="text-ink mt-3 max-w-3xl text-3xl sm:text-4xl">
        Three services. The first two make you citable. The third puts the thing being cited on the
        internet in the first place.
      </h2>

      <div className="mt-12 space-y-12">
        {SERVICES.map((service, i) => {
          const isDeployment = service.slug === DEPLOYMENT_SLUG
          return (
            <article
              key={service.slug}
              id={service.slug}
              className="border-line scroll-mt-24 border-t pt-7"
            >
              <div className="grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-[auto_1fr_1fr]">
                <span className="signage-bullet" aria-hidden="true">
                  {i + 1}
                </span>

                <div>
                  <h3 className="text-ink text-2xl sm:text-3xl">{service.name}</h3>
                  {service.abbr && <p className="signage-label text-brand mt-2">{service.abbr}</p>}
                  <p className="text-ink mt-4 text-base font-bold leading-snug tracking-[-0.01em]">
                    {service.short}
                  </p>
                </div>

                <div>
                  <p className="text-ink-70 leading-relaxed">{service.summary}</p>

                  {isDeployment ? (
                    <a
                      href="#deployment"
                      className="text-brand signage-label mt-5 inline-flex items-center gap-1.5 hover:underline"
                    >
                      What a launch includes <ArrowRight className="size-3.5" />
                    </a>
                  ) : (
                    <ul className="mt-5">
                      {service.bullets.map((b) => (
                        <li
                          key={b}
                          className="border-line text-ink flex gap-3 border-b py-2.5 text-sm leading-snug last:border-b-0"
                        >
                          <span className="text-brand font-bold" aria-hidden="true">
                            &mdash;
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

/**
 * The Probe, explained at length. This is the product people ask about by name,
 * so it gets prose, a fare-table price panel, and its own booking CTA.
 */
function ProbeSection() {
  return (
    <section id="probe" className="border-line scroll-mt-24 border-t py-14">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Label>The diagnostic</Label>
          <h2 className="text-ink mt-3 text-3xl sm:text-5xl">{PROBE.name}</h2>
          {PROBE.body.map((para) => (
            <p key={para.slice(0, 40)} className="text-ink-70 mt-5 leading-relaxed">
              {para}
            </p>
          ))}

          <div className="mt-8">
            <BookDemoLink source="about:probe" className={SIGNAGE_BUTTON}>
              <CalendarDays className="size-4" />
              Schedule a consultation
              <ArrowUpRight className="size-3.5" />
            </BookDemoLink>
          </div>
        </div>

        <div className="bg-surface-2 h-fit">
          <div className="border-line border-b p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-ink text-5xl font-bold tracking-[-0.04em]">{PROBE.price}</span>
              <span className="signage-label text-ink-50">{PROBE.cadence}</span>
            </div>
            <p className="text-ink-50 mt-2 text-xs leading-relaxed">{PROBE.priceNote}</p>
          </div>

          <div className="p-6">
            <Label tone="mute">What you get back</Label>
            <ul className="mt-3">
              {PROBE.outputs.map((o) => (
                <li
                  key={o}
                  className="border-line text-ink flex gap-3 border-b py-3 text-sm leading-snug last:border-b-0"
                >
                  <span className="text-brand font-bold" aria-hidden="true">
                    &mdash;
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
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
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <Label>Custom builds &amp; digital presence</Label>
          <h2 className="text-ink mt-3 text-3xl sm:text-5xl">
            Your business is real. Online, it doesn&rsquo;t exist yet.
          </h2>
          <p className="text-ink-70 mt-5 leading-relaxed">
            Most of who we work with here don&rsquo;t hand us a repo — they don&rsquo;t have
            anything yet. No site, no app, nothing a customer can find. We start from what the
            business actually needs — a marketing site, a booking flow, a customer app, whatever the
            job calls for — design and build it from scratch, and take it all the way live: domain,
            hosting, a database that survives a restart, payments if you need them. And every build
            ships AI-readable, because a business no answer engine can find is still half invisible.
          </p>
          <p className="text-ink-70 mt-4 leading-relaxed">{DEPLOYMENT_NOTE}</p>
          <Link to="/get-started" className={`${SIGNAGE_BUTTON} mt-8`}>
            Tell us what you need <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="bg-surface-2 h-fit p-6 sm:p-7">
          <Label tone="mute">What a build includes</Label>
          <ul className="mt-3">
            {service.bullets.map((b) => (
              <li
                key={b}
                className="border-line text-ink flex gap-3 border-b py-3 text-sm leading-snug last:border-b-0"
              >
                <span className="text-brand font-bold" aria-hidden="true">
                  &mdash;
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/** How the work runs, as three numbered stops. */
function MethodSection() {
  const steps = [
    {
      step: '1',
      title: 'Measure first',
      body: 'Before we change anything, we ask the engines the questions your customers ask and write down what they say today. No baseline, no proof.',
    },
    {
      step: '2',
      title: 'Fix what the models read',
      body: 'Facts, schema, crawl paths, citations. We change what the engines can see about you, then re-run the same prompts against the same grid.',
    },
    {
      step: '3',
      title: 'Hand you the keys',
      body: 'Reports export. Domains, accounts, and repositories stay in your name. Nothing we build holds you hostage to keep working.',
    },
  ]

  return (
    <section className="border-line border-t py-14">
      <Label>How we work</Label>
      <h2 className="text-ink mt-3 text-3xl sm:text-4xl">Three stops, in order.</h2>

      <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.step} className="border-line border-t pt-5">
            <span className="signage-bullet" aria-hidden="true">
              {s.step}
            </span>
            <h3 className="text-ink mt-4 text-xl">{s.title}</h3>
            <p className="text-ink-70 mt-3 text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * The fare table. Engagement facts existed only in the machine metadata before,
 * which meant answer engines could quote our timeline and pricing but a human
 * reading the page could not find them. Same facts, now printed.
 */
function FactsSection() {
  const rows = [
    { term: 'The Spotlight Links Probe', value: `${PROBE.price}${PROBE.cadence}` },
    { term: 'Growth / Scale tiers', value: '$199 · $299 / month' },
    {
      term: 'Enterprise, done-for-you',
      value: `${MANAGED_SERVICE.price}${MANAGED_SERVICE.cadence}`,
    },
    { term: 'Custom build work', value: 'Scoped per project' },
    { term: 'Implementation timeline', value: 'Typically 45 to 60 days' },
    { term: 'Service area', value: 'United States · Other markets on request' },
    { term: 'Onboarding', value: 'By consultation. No self-serve checkout' },
    { term: 'Contact', value: 'support@spotlightlinks.com' },
  ]

  return (
    <section className="border-line border-t py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Label>Engagement &amp; pricing</Label>
          <h2 className="text-ink mt-3 text-3xl sm:text-4xl">The terms, in plain numbers.</h2>
          <p className="text-ink-70 mt-5 text-sm leading-relaxed">{SERVICE_AREA.blurb}</p>
          <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-1">
            {SERVICE_AREA.neighborhoods.map((n) => (
              <li key={n} className="signage-label text-ink-50">
                {n}
              </li>
            ))}
          </ul>
        </div>

        <dl className="border-line border-t">
          {rows.map((row) => (
            <div
              key={row.term}
              className="border-line flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b py-3.5"
            >
              <dt className="signage-label text-ink-50">{row.term}</dt>
              <dd className="text-ink text-base font-bold tracking-[-0.02em]">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/** Closing advisory band, inverted to match the one at the top. */
function ClosingBand() {
  return (
    <section className="mb-16">
      <div className="bg-brand px-6 py-14 text-white sm:px-10 sm:py-16">
        <p className="signage-label text-white/70">Next step</p>
        <h2 className="mt-4 max-w-3xl text-3xl leading-[1.06] sm:text-5xl">
          Find out what AI says about you today.
        </h2>
        <p className="text-white/80 mt-5 max-w-2xl leading-relaxed">
          Build your business profile, and we will show you where you stand across every engine your
          customers use.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/get-started"
            className="text-brand hover:bg-ink inline-flex items-center justify-center gap-2 bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] transition hover:text-white"
          >
            Build my profile <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/compare"
            className="hover:text-brand inline-flex items-center justify-center gap-2 border border-white/50 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white"
          >
            See how we compare
          </Link>
        </div>
      </div>
    </section>
  )
}
