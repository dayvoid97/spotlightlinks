/* ── Engine focus ──────────────────────────────────────────────────────────
 * We probe four engines, but we do not weight them equally, and the site should
 * say so plainly rather than listing all four as though they mattered the same
 * amount. Gemini and ChatGPT are where nearly all everyday consumer AI use
 * happens — and Gemini is the one wired directly into Google Search, so it
 * reaches people who never opened a chatbot at all. Claude and Perplexity are
 * covered in every audit; they are not where we spend the optimization budget.
 * ────────────────────────────────────────────────────────────────────────── */

export const ENGINE_FOCUS = {
  /** Where the optimization work is aimed. Order is deliberate. */
  primary: ['Google Gemini', 'ChatGPT'] as string[],
  /** Still probed and reported on every cycle — just not the priority. */
  secondary: ['Anthropic Claude', 'Perplexity'] as string[],
  headline: 'We optimize for Gemini and ChatGPT first',
  rationale:
    'Almost all everyday consumer AI use runs through two engines: ChatGPT and Google Gemini. Gemini matters twice over, because it is built into Google Search itself — it reaches customers who never opened a chatbot in their life and simply searched the way they always have. So that is where we aim the work. We still probe Anthropic Claude and Perplexity on every audit cycle and report exactly where you stand on both, and we will optimize for them on request. But when there is a tradeoff to make, we make it in favor of the two engines your customers are actually using.',
}

export interface Faq {
  q: string
  a: string
}

export const FAQS: Faq[] = [
  {
    q: 'What is the difference between the Prober SaaS ($79–$299) and the $599 Managed Partner service?',
    a: 'Our Prober tiers ($79 for 1 asset, $199 for 3 assets, $299 for 7 assets) are automated software for businesses or agencies that just need weekly AI visibility audits, scores, and prioritized fix lists. Our $599/mo Full-Service plan is our dedicated done-for-you technical partner for 1 business entity: we build/revamp your website, set up your domain and technical infrastructure, write your citation schema, and execute ongoing AEO/GEO optimizations so you can focus entirely on running your business in real life.',
  },
  {
    q: 'What is an "asset"?',
    a: 'An asset is one distinct physical storefront, business location, website, or corporate entity. For example, 1 dental practice is 1 asset. A restaurant group with 3 distinct locations represents 3 assets.',
  },
  {
    q: 'Who is the $599 Full-Service Plan built for?',
    a: 'It is built for business owners who excel at running their physical business and know an online presence is vital, but do not have the time or technical background to manage websites, DNS, schema, and AI indexing. We act as your dedicated web and AI tech department for $599/month. We focus strictly on permanent, high-impact search and web infrastructure—no vanity social media posting.',
  },
  {
    q: 'Do you offer special pricing for new businesses?',
    a: 'Yes. We love seeing new businesses launch strong in competitive markets. If you are launching a brand-new entity and need full web setup plus AI visibility, book a demo to discuss our new-business launch partner pricing.',
  },
  {
    q: 'Which AI engines do you probe?',
    a: 'We probe all major AI engines — ChatGPT, Google Gemini, Anthropic Claude, and Perplexity — on every audit cycle, at 300+ live multi-sample calls for statistically reliable 95% Wilson-score confidence scoring. Our optimization work focuses on Google Gemini and ChatGPT, because that is where nearly all everyday consumer AI use happens, and because Gemini is built into Google Search itself. Claude and Perplexity are always measured and reported, and we optimize for them on request.',
  },
  {
    q: 'What if I need prober tracking for more than 7 locations?',
    a: 'We offer Custom Prober pricing for enterprise brands, large multi-location franchises, and marketing agencies managing 8+ client locations.',
  },
]

/* ── /about FAQ ────────────────────────────────────────────────────────────
 * A second, separate list rather than more entries in FAQS, because these
 * answer "what is this company and how does it work with me" rather than the
 * pricing-desk questions the homepage and /compare are answering. Both lists
 * are lifted into llms.txt by scripts/generate-sitemap.mjs, which reads this
 * file as text and matches every q/a pair — so a string containing an
 * apostrophe must use double quotes, or the regex stops at the apostrophe.
 * ────────────────────────────────────────────────────────────────────────── */

export const ABOUT_FAQS: Faq[] = [
  {
    q: 'What does the Spotlight Links Probe do?',
    a: 'The Probe measures what AI engines actually tell customers about your business. We build a grid of the real buying questions your customers ask, scoped to your city, ZIP code, and service radius, then run it live against ChatGPT, Google Gemini, Anthropic Claude, and Perplexity — 300+ multi-sample calls per audit cycle, because these models answer probabilistically and one screenshot proves nothing. You get your recommendation rate with 95% Wilson-score confidence bounds, a prompt-by-prompt record of what each engine said, a competitor leaderboard showing who gets named when you do not, and a prioritized list of what to fix. It runs in about ten minutes and exports to PDF, Word, RTF, and HTML. Pricing starts at $79 per month for one managed asset.',
  },
  {
    q: 'What does the Spotlight Links Enterprise Plan consist of?',
    a: 'Enterprise is $599 per month for one business entity, and it is the done-for-you tier: we act as your web and AI department instead of handing you a report. That covers a complete custom website design and build, or a full revamp of the site you have; the whole technical deployment including domain, fast hosting, SSL, and security; continuous multi-engine probing; and the AEO/GEO implementation itself — structured entity graphs, schema, FAQ and citation content written to be quoted by AI engines. You get hands-on implementation, monthly optimization, and direct access to the development team. It is strictly permanent web and search infrastructure. We do not do social media posting.',
  },
  {
    q: 'My business is a small business. Is Spotlight Links Enterprise only for big businesses?',
    a: 'No. Enterprise is the name of the plan, not the size of the customer. We take pride in bringing local businesses the same state-of-the-art tools and technology the big brands use, so that a neighborhood shop is not missing out on a single potential customer who is searching online. Most Enterprise clients are exactly that: one storefront, one owner, no in-house technical staff and no time to manage a website, DNS, schema, and AI indexing. That is the gap the plan exists to fill. If you already have someone managing your site, the cheaper path is often the Probe on its own — hand them the audit and let them execute.',
  },
  {
    q: 'How long does the Spotlight Links AEO/GEO implementation take?',
    a: 'Usually 45 to 60 days before everything is properly set up and working. That covers the baseline audit, the technical groundwork, the entity and schema work, the content, and enough re-probing to confirm the numbers actually moved rather than assuming they did. After that initial build, the work shifts to upkeep: we recommend keeping the site fresh as the business changes — new services, new pricing, new locations, seasonal hours — because AI engines reward current, accurate information and quietly stop citing content that has gone stale.',
  },
  {
    q: 'Does Spotlight Links serve customers in Europe?',
    a: 'Right now we are focused on serving American businesses. That said, we never say no to an opportunity — we can work globally, but only upon request. If you are outside the United States and want to talk, book a consultation and we will tell you honestly whether we are the right fit for your market.',
  },
  {
    q: 'Why is Spotlight Links focused on businesses in the United States?',
    a: 'Because our tools and technology are built progressively around the business landscape in the United States. The prompt grids, the local and ZIP-level geo probing, the directory and citation sources we repair, and the entity data the engines read all reflect how American customers search and how American businesses are recorded online. We would rather be genuinely good in one market than approximately right everywhere.',
  },
]

/* ── The Probe ─────────────────────────────────────────────────────────────
 * The product people ask about by name. PROBER_FLAGSHIP below is the pricing
 * card; this is the explanation — what the thing actually does, in the order a
 * business owner asks it. Rendered on /about and lifted into llms.txt, so it is
 * written to be quoted whole.
 * ────────────────────────────────────────────────────────────────────────── */

export const PROBE = {
  name: 'The Spotlight Links Probe',
  price: '$79',
  cadence: '/ month',
  priceNote: 'Starter Prober — 1 managed asset. Growth $199 · Scale $299 · Enterprise $599.',
  /** Two paragraphs, in reading order. Kept as prose because that is what gets quoted. */
  body: [
    'The Probe is our diagnostic engine, and it answers a question you cannot answer by searching for yourself: when a real customer asks an AI assistant for a business like yours, what does it actually say? We build a grid of the buying questions your customers genuinely ask — phrased their way, scoped to your city, your ZIP code, your service radius, and the neighboring markets you compete in — and we run that grid live against the engines. Not once. Every prompt is sampled repeatedly across engines and across cycles, at 300+ live calls per audit, because a single screenshot of one answer proves nothing: these models sample probabilistically, and the same question can return a different business twice in a row.',
    'What comes back is a measurement, not an impression. You get your recommendation rate with a 95% Wilson-score confidence interval, a prompt-by-prompt matrix of exactly what each engine said, a competitor leaderboard naming who is winning the answers you are losing, and an executive SWOT that turns all of it into a prioritized list of what to fix first. It runs in about ten minutes and exports to PDF, Word, RTF, and HTML, so you can hand it to whoever manages your website — or hand it back to us to execute. The Probe starts at $79 a month for one managed asset, which is one storefront, location, website, or business entity.',
  ] as string[],
  /** The four things the Probe produces. Short enough to render as a list. */
  outputs: [
    'Your recommendation rate per engine, with 95% Wilson-score confidence bounds',
    'A prompt-by-prompt matrix of what every engine actually answered',
    'A competitor leaderboard: who gets named when you do not',
    'An executive AI SWOT with fixes ranked by what moves the number most',
  ] as string[],
}

export interface PricingFeature {
  text: string
}

export const PROBER_FLAGSHIP = {
  name: 'Starter Prober',
  price: '$79',
  cadence: '/ month',
  badge: 'Automated SaaS',
  tagline: 'Weekly multi-engine AI probing for 1 business location or entity.',
  features: [
    '1 managed asset (1 store, clinic, or business entity)',
    'Weekly automated visibility audits across ChatGPT, Gemini, Claude & Perplexity',
    '300+ live multi-sample prompt calls per audit cycle',
    'Mention, citation & #1-recommendation scoring',
    'Competitor leaderboard + prompt-by-prompt answer matrix',
    'Executive AI SWOT with prioritized fixes',
    'PDF, Word, RTF, and HTML report exports',
  ] as string[],
}
export interface ScaleTier {
  name: string
  price: string
  blurb: string
}

export const PROBER_SCALE_TIERS = [
  {
    name: 'Growth Prober',
    price: '$199',
    cadence: '/ mo',
    blurb: 'Automated probing & recommendations for 3 managed assets (stores or locations).',
  },
  {
    name: 'Scale Prober',
    price: '$299',
    cadence: '/ mo',
    blurb:
      'Automated probing & recommendations for 7 managed assets. Ideal for regional chains & agencies.',
  },
  {
    name: 'Custom Prober',
    price: 'Custom',
    cadence: '',
    blurb: '8+ locations, high-volume multi-engine probing, and agency volume licensing.',
  },
]

export interface Differentiator {
  title: string
  body: string
}

export const DIFFERENTIATORS: Differentiator[] = [
  {
    title: 'Purpose-built for AI answers',
    body: 'Not an SEO suite with an AI checkbox bolted on. Every feature exists to measure and win recommendations inside ChatGPT, Gemini, Claude, and Perplexity.',
  },
  {
    title: 'Priced for real businesses',
    body: 'Multi-engine AEO for $79 a month — not an annual enterprise contract. A two-location business can actually afford to stay visible.',
  },
  {
    title: 'Local by default',
    body: 'ZIP-level, service-radius, and neighboring-market probing. Built for businesses that win or lose customers town by town, not just nationally.',
  },
  {
    title: 'Measured, not guessed',
    body: '300+ live calls, 3–5 samples per prompt, Wilson-score confidence. A number you can defend to a client — not a vibe or a single screenshot.',
  },
]

export const SERVICE_AREA = {
  headline: 'New York City',
  blurb:
    'Spotlight Links serves local and brick-and-mortar businesses across Queens, NYC — hardware stores, pizzerias, restaurants, takeout counters, and discount shops — with AI and search visibility audits scoped to their own ZIP code and surrounding neighborhoods.',
  neighborhoods: [
    'Astoria',
    'Jackson Heights',
    'Elmhurst',
    'Woodside',
    'Sunnyside',
    'Corona',
    'Long Island City',
  ] as string[],
}
export const MANAGED_SERVICE = {
  name: 'Full-Service Web & AI Management',
  price: '$599',
  cadence: '/ month',
  badge: 'Dedicated Technical Partner',
  scope: '1 Business Entity (Turnkey Solution)',
  tagline: 'You run your business in real life. We handle your entire internet and AI presence.',
  bullets: [
    'Complete custom website design & development (from scratch or complete revamp)',
    'Full technical deployment: domain setup, fast hosting, SSL, and security',
    'Continuous multi-engine AI probing (ChatGPT, Gemini, Claude, Perplexity)',
    'Done-for-you AEO/GEO content: structured entity graphs, FAQs, and citation packets',
    'Hands-on technical implementation and monthly optimization',
    'Direct access to our development team — zero agency bureaucracy',
    'Strictly permanent web/search infrastructure (no social media fluff)',
  ] as string[],
}

export const BOOKING = {
  url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0UN9c7_3_rnzBPiPp0e-o4Lrg9O6XtwR2LSmDBKr0PmSDvC_-gptahG4c0L3rxxEl_FWOcJC8p',
  label: 'Book a demo',
  cta: 'Schedule a consultation',
  /** The floating blog button. Spelled out because a bare calendar icon does
   * not tell a first-time reader what happens when they press it. */
  fabCta: 'Book a demo today',
  headline: 'Put your business in the spotlight',
  blurb:
    'Book a 1-on-1 walkthrough to inspect your AI visibility across ChatGPT, Gemini, Claude, and Perplexity, or discuss full $599/mo end-to-end web & AI management.',
}

/* ── Probe access policy ───────────────────────────────────────────────────
 * Probes run live against four frontier engines, and that compute is finite.
 * Onboarding is by request so a burst of self-serve runs cannot drain the
 * credit pool that existing clients are already depending on. Stated plainly
 * on every surface where somebody would otherwise expect a self-serve run:
 * /get-started, /signup, and /clients/new — see <ProbeAccessNotice>.
 * ────────────────────────────────────────────────────────────────────────── */

export const PROBE_ACCESS = {
  headline: 'The Spotlight Links Probe is available on request only',
  /** Always visible: what a visitor should actually do about it. */
  lead: 'Creating an account still works. But to get a probe run on your business we strongly recommend booking an appointment — it is simple: pick a time within the next 10 days, tell us how to reach you, and note that a $79 fee applies to the probe. We onboard you manually and set everything up nice and proper.',
  /** Behind the "Why are we doing this?" disclosure. Rendered as paragraphs. */
  why: [
    'Every probe runs live against ChatGPT, Gemini, Claude, and Perplexity, and the compute and AI credits behind those runs are finite. We watched them get sucked dry to the point where it hampered our ability to service the clients already relying on us, so we took the hard decision to make probe onboarding request-only.',
    'Our only reasons are to minimize credit leakage and keep the system available to our users. Thank you for understanding.',
  ] as string[],
}

/* ── Services ──────────────────────────────────────────────────────────────
 * The three things we actually sell. Rendered on /about and the homepage, and
 * lifted verbatim into public/llms.txt by scripts/generate-sitemap.mjs — the
 * answer engines quote this copy, so it is written to be quotable: concrete
 * nouns, no adjectives we cannot back up.
 * ────────────────────────────────────────────────────────────────────────── */

export interface Service {
  slug: string
  name: string
  abbr?: string

  plain: string
  short: string
  summary: string
  bullets: string[]
}

export const SERVICES: Service[] = [
  {
    slug: 'aeo',
    name: 'Answer Engine Optimization',
    abbr: 'AEO',
    plain:
      'Make sure the real facts about your shop — what you charge, when you open, what you actually do — are the ones getting quoted back to customers.',
    short: 'Turn your real prices, timelines, and service facts into answers an AI can quote.',
    summary:
      'AEO is the work of making your business answerable. We take what you actually charge, how long you actually take, what you actually serve, and the areas you actually cover, and publish them as structured, source-backed content an answer engine can lift into a reply without guessing. Then we measure whether it worked — by asking the engines the same buying questions your customers ask.',
    bullets: [
      'Buyer-intent prompt grid built for your niche and your city',
      'Fact extraction: prices, hours, service radius, credentials, guarantees',
      'FAQ and schema content written to be quoted, not skimmed',
      'Mention, citation, and #1-recommendation scoring with 95% Wilson confidence',
      'Competitor leaderboard showing who is winning the answer instead of you',
    ],
  },
  {
    slug: 'geo',
    name: 'Generative Engine Optimization',
    abbr: 'GEO',
    plain:
      'Fix the technical side of your website so Google and the AI assistants can read it, trust it, and know it is really you.',
    short: 'Configure your site so generative crawlers read you as a real, citable entity.',
    summary:
      'GEO is the plumbing underneath AEO. A generative crawler has to be able to reach your pages, parse them without running JavaScript, and resolve them to one unambiguous business entity. We fix the crawl path, publish the entity graph, and give the models a plain-text copy of every page so a model never has to infer what you are.',
    bullets: [
      'robots.txt that names and admits every answer-engine crawler on purpose',
      'JSON-LD entity graph — Organization, LocalBusiness, Service, Offer — served in static HTML',
      '/llms.txt site map plus raw markdown alternates for every public page',
      'Canonical, Open Graph, and sitemap hygiene so nothing reads as duplicate',
      'Citation-path repair: the pages models land on when they look you up',
    ],
  },
  {
    slug: 'custom-website-design-and-build',
    name: 'Custom Website Design & Build',
    plain:
      'No website, or one that is not working for you? We design and build a custom site and put it live on your domain.',
    short:
      'A custom website for your business — built from scratch or rebuilt right, live on your domain.',
    summary:
      'Some businesses do not have a website. Others have one that is not working — outdated, slow, or built for a different business than the one they run today. We build custom websites for local businesses: a new site from scratch, or a full revamp of what you already have. You get a site that shows customers what they need — hours, services, pricing, location, how to book or buy — and works on every device. We handle the design, the build, the domain, and the launch. You own all of it.',
    bullets: [
      'Free consultation to figure out exactly what your business needs',
      'Custom design built around your business, not a generic template',
      'New site from scratch, or a full revamp of what you already have',
      'Your own domain, hosting, and security — nothing shared or borrowed',
      'All the info customers actually need: hours, services, pricing, location, contact',
      'Mobile-friendly and fast, on every device',
      'Set up to be found — by Google, and by AI answer engines',
      'You own everything: the domain, the site, the content. No lock-in.',
    ],
  },
]

/** Deployment engagements are scoped per project — they are not the $79 subscription. */
export const DEPLOYMENT_NOTE =
  'Deployment work is scoped and quoted per project after a repository review, separately from the monthly AEO/GEO subscription. Typical launches run days, not quarters — the long pole is almost never the code, it is the accounts, domains, and data nobody set up yet.'

/* ── Comparison matrix ─────────────────────────────────────────────────────── */

export interface CompareColumn {
  name: string
  tagline: string
  us?: boolean
}

/** Order here is the column order; every row's `cells` array matches it 1:1. */
export const COMPARE_COLUMNS: CompareColumn[] = [
  { name: 'Spotlight Links', tagline: 'Purpose-built AEO/GEO for local & SMB', us: true },
  { name: 'Semrush', tagline: 'SEO suite with an AI toolkit add-on' },
  { name: 'SimilarWeb', tagline: 'Traffic & market intelligence' },
  { name: 'HubSpot', tagline: 'Marketing platform & CRM' },
  { name: 'Profound', tagline: 'Enterprise answer-engine analytics' },
]

export type CompareCell =
  | { kind: 'yes'; note?: string }
  | { kind: 'partial'; note: string }
  | { kind: 'no' }
  | { kind: 'text'; text: string }

export interface CompareRow {
  feature: string
  cells: CompareCell[]
}

export const COMPARE_ROWS: CompareRow[] = [
  {
    feature: 'Purpose-built for AI answer engines',
    cells: [
      { kind: 'yes' },
      { kind: 'partial', note: 'Add-on' },
      { kind: 'partial', note: 'Limited' },
      { kind: 'no' },
      { kind: 'yes' },
    ],
  },
  {
    feature: 'Multi-engine tracking (ChatGPT · Gemini · Claude · Perplexity)',
    cells: [
      { kind: 'yes' },
      { kind: 'partial', note: 'Partial' },
      { kind: 'partial', note: 'Limited' },
      { kind: 'no' },
      { kind: 'yes' },
    ],
  },
  {
    feature: 'ZIP-level local & geo probing',
    cells: [
      { kind: 'yes' },
      { kind: 'partial', note: 'Keyword-based' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'partial', note: 'Limited' },
    ],
  },
  {
    feature: 'Multi-sample statistical confidence',
    cells: [
      { kind: 'yes' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'partial', note: 'Varies' },
    ],
  },
  {
    feature: 'Actionable fixes + executive AI SWOT',
    cells: [
      { kind: 'yes' },
      { kind: 'partial', note: 'Generic' },
      { kind: 'partial', note: 'Generic' },
      { kind: 'partial', note: 'Generic' },
      { kind: 'partial', note: 'Reporting' },
    ],
  },
  {
    feature: 'Done-for-you AEO content (schema · FAQ · citations)',
    cells: [
      { kind: 'yes', note: 'Enterprise' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'partial', note: 'Generic' },
      { kind: 'no' },
    ],
  },
  {
    feature: 'Time to first insight',
    cells: [
      { kind: 'text', text: '~10-min audit' },
      { kind: 'text', text: 'Setup-heavy' },
      { kind: 'text', text: 'Setup-heavy' },
      { kind: 'text', text: 'Onboarding' },
      { kind: 'text', text: 'Onboarding' },
    ],
  },
  {
    feature: 'Indicative entry price',
    cells: [
      { kind: 'text', text: '$79 / mo' },
      { kind: 'text', text: 'from ~$139 / mo' },
      { kind: 'text', text: 'Custom / enterprise' },
      { kind: 'text', text: '$$$ / mo' },
      { kind: 'text', text: 'Enterprise / custom' },
    ],
  },
  {
    feature: 'Best for',
    cells: [
      { kind: 'text', text: 'Local & SMB going AI-first' },
      { kind: 'text', text: 'SEO teams' },
      { kind: 'text', text: 'Market intelligence' },
      { kind: 'text', text: 'Full-funnel marketing & CRM' },
      { kind: 'text', text: 'Enterprise brands' },
    ],
  },
]

export const COMPARE_DISCLAIMER =
  'Comparison reflects each platform’s publicly available positioning as of 2026 and is provided in good faith; every tool here serves a different primary use case. Prices are indicative entry pricing and may change — check each vendor for current terms.'
