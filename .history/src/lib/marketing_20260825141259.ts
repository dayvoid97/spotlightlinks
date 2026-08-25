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
    a: 'We audit all major AI engines — ChatGPT, Google Gemini, Anthropic Claude, Perplexity, and active frontier models. Every audit cycle runs 300+ live multi-sample calls to deliver statistically reliable 95% Wilson-score confidence scoring.',
  },
  {
    q: 'What if I need prober tracking for more than 7 locations?',
    a: 'We offer Custom Prober pricing for enterprise brands, large multi-location franchises, and marketing agencies managing 8+ client locations.',
  },
]

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
  headline: 'Queens, New York City',
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
  headline: 'Put your business in the spotlight',
  blurb:
    'Book a 1-on-1 walkthrough to inspect your AI visibility across ChatGPT, Gemini, Claude, and Perplexity, or discuss full $599/mo end-to-end web & AI management.',
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
