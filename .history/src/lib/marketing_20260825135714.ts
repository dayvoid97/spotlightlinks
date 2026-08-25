export interface Faq {
  q: string
  a: string
}

export const FAQS: Faq[] = [
  {
    q: 'What does Spotlight Links actually do?',
    a: 'We run Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) audits. In plain terms: we ask the AI assistants your customers already use — ChatGPT, Google Gemini, Anthropic Claude, and Perplexity — the real questions they ask when choosing a business, then measure whether you get recommended, whether your site gets cited, and which competitors are winning the answer instead. Then we tell you exactly what to fix.',
  },
  {
    q: 'What are AEO and GEO, and why now?',
    a: 'Answer Engine Optimization and Generative Engine Optimization are what SEO was for Google — but for AI answers. More than half of people now ask an AI assistant instead of scrolling ten blue links, and the assistant returns one recommendation, not a page of options. If that recommendation is your competitor, you never even saw the conversation. AEO/GEO is how you make sure it is your name.',
  },
  {
    q: 'How much does it cost?',
    a: "It's $79 a month. Nothing in this world is free — a single audit fires 300+ live calls to frontier AI models, and that costs real money to run. For $79 you get two managed assets, each audited up to four times a month, plus every new feature we ship. No enterprise contract, no sales call.",
  },
  {
    q: 'What is an "asset," and what exactly do I get for $79?',
    a: 'An asset is one business you manage — a name plus a ZIP code (a company, a website, a location). $79 covers two assets, each audited up to four times per month. So you can keep two businesses under watch, see what is working and what is not across every audit, act on the recommendations, and stay ahead as the AI engines shift week to week.',
  },
  {
    q: 'What can I do before I subscribe?',
    a: 'You can build your full business profile and run our AI synthesize step — which drafts the whole thing from a paragraph you write — before you subscribe. Running live audits is what the subscription pays for: every audit fires 300+ real calls to frontier models, and those calls cost us money the moment they run.',
  },
  {
    q: 'Which AI engines do you check, and how accurate is it?',
    a: 'We probe Google Gemini, Anthropic Claude, and Perplexity today, with ChatGPT coverage expanding. Each audit builds a grid of 30+ real customer prompts tailored to your niche and city, samples every prompt 3–5 times per engine (300+ live calls in all), and scores the results with 95% Wilson-score confidence intervals — a 99.4% confident measurement that filters out one-off model noise rather than trusting a single lucky answer.',
  },
  {
    q: 'What do I actually receive?',
    a: 'A clear report: your mention rate, citation rate, and how often you are the #1 recommendation; a competitor leaderboard; a prompt-by-prompt matrix showing the actual AI answers for every query; and an executive AI SWOT with a prioritized list of what to fix. Every report exports to PDF, Word, RTF, and HTML.',
  },
  {
    q: 'How long does an audit take?',
    a: 'About ten minutes for a full cycle across all engines. You start it, keep the tab open, and watch it stream live — engine checks, progress, and per-prompt results as they come in.',
  },
  {
    q: 'Do you guarantee I will be recommended by AI?',
    a: 'No — and anyone who guarantees that is selling snake oil. AI answers change, and no honest vendor controls them. What we guarantee is a rigorous, repeatable measurement and a concrete, prioritized plan for what to change. On our higher tiers, we also build the source-backed content — schema, FAQs, citation packets — that moves the needle.',
  },
  {
    q: 'Do you also build and launch the website or app itself?',
    a: 'Yes — that is our Platform Development & Deployment service. If your site or app already works on localhost but is not live, we take the repository to production: hosting, custom domain and TLS, database with migrations and backups, secrets, continuous deploys from your Git branch, transactional email, billing, and monitoring. Every launch ships AI-readable — robots, sitemap, llms.txt, JSON-LD entity graph — so the engines can cite it from day one. It is scoped and quoted per project after a repository review, separately from the monthly subscription, and you keep ownership of the domain, the accounts, and the code.',
  },
  {
    q: 'Is this built for local businesses?',
    a: 'Yes. Everything is geo-aware: ZIP code, service radius, and neighboring markets. A local business sees exactly where it already wins and which nearby towns are handing the recommendation to a competitor — block by block, not just nationally.',
  },
  {
    q: 'Who is behind Spotlight Links?',
    a: 'A New York team building an AI-native business the hard way — shipping fast, publishing our real costs and results on the blog, and treating every audit like it is our own money on the line. This is new, it is moving quickly, and you get every improvement as we make it.',
  },
]

export interface PricingFeature {
  text: string
}

export const FLAGSHIP = {
  name: 'Starter Prober',
  price: '$79',
  cadence: '/ month',
  tagline: 'Add two businesses. Four weekly audits upon request.',
  features: [
    '50+ geo-targeted prompts',
    '2 managed assets — two businesses, sites, or locations',
    'Up to 4 full AI-visibility audits per asset, monthly',
    'ChatGPT, Google Gemini, Anthropic Claude & Perplexity',

    'Mention, citation & #1-recommendation scoring',
    'Competitor leaderboard + prompt-by-prompt matrix',
    'Executive AI SWOT with prioritized fixes',
    'PDF / Word / RTF / HTML report exports',
    'Every new feature we ship — included',
  ] as string[],
}

export interface ScaleTier {
  name: string
  price: string
  blurb: string
}

export const SCALE_TIERS: ScaleTier[] = [
  { name: 'Growth', price: '$199', blurb: 'More assets and more markets as you expand.' },
  {
    name: 'Scale',
    price: '$299',
    blurb: 'Unlimited managed assets for agencies and multi-location brands.',
  },
  {
    name: 'Enterprise',
    price: '$599',
    blurb: 'Everything, plus done-for-you AEO content — schema, FAQs, and citation packets.',
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

export const BOOKING = {
  url: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0UN9c7_3_rnzBPiPp0e-o4Lrg9O6XtwR2LSmDBKr0PmSDvC_-gptahG4c0L3rxxEl_FWOcJC8p',
  /** Short label — nav, footer, inline links. */
  label: 'Book a demo',
  /** Primary button copy on the CTA card. */
  cta: 'Schedule a consultation',
  headline: 'See what AI says about your business',
  blurb:
    'We onboard every business personally. Book a consultation and we will walk through where ChatGPT, Gemini, Claude, and Perplexity recommend you today, where they recommend a competitor instead, and what it takes to change that.',
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
  /**
   * Owner-facing one-liner for the homepage. No engine names, no acronyms —
   * the homepage's reader runs a pizzeria, not a marketing department. The
   * technical framing lives in `short`/`summary`, which serve /about and the
   * machine-readable copy in /llms.txt.
   */
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
