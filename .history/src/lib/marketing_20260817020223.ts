/**
 * Marketing copy for the public surfaces (homepage pricing/FAQ/comparison and
 * the /compare page). Kept in one place so those pages never drift apart.
 *
 * Product claims here are grounded in the docs and the company's own published
 * blog copy (public/blog/how-spotlight-links-ai-audit-engine-works.md): 30+
 * geo-targeted prompts, 3–5 samples per prompt across the answer engines,
 * 300+ live calls per audit, 95% Wilson-score confidence, ~10-minute run.
 *
 * NOTE: the $49 offer described here ("2 assets · 4 audits each / month") is
 * the marketing framing dictated for the public site. The authenticated
 * BillingPage still renders the real plan objects from the backend
 * (GET /api/checkout/plans) for actual purchase — see docs/08-billing-and-plans.md.
 */

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
    a: "It's $49 a month. Nothing in this world is free — a single audit fires 300+ live calls to frontier AI models, and that costs real money to run. For $49 you get two managed assets, each audited up to four times a month, plus every new feature we ship. No enterprise contract, no sales call.",
  },
  {
    q: 'What is an "asset," and what exactly do I get for $49?',
    a: 'An asset is one business you manage — a name plus a ZIP code (a company, a website, a location). $49 covers two assets, each audited up to four times per month. So you can keep two businesses under watch, see what is working and what is not across every audit, act on the recommendations, and stay ahead as the AI engines shift week to week.',
  },
  {
    q: 'Can I try it before paying?',
    a: 'Yes. You can build your client context and use our AI synthesize step — which drafts your whole business profile from a paragraph — completely free. You only create an account when you are ready to run your first live audit.',
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
  price: '$49',
  cadence: '/ month',
  tagline: 'Add two businesses. Four weekly audits upon request. One flat price.',
  features: [
    '2 managed assets — two businesses, sites, or locations',
    'Up to 4 full AI-visibility audits per asset, monthly',
    'ChatGPT, Google Gemini, Anthropic Claude & Perplexity',
    '30+ geo-targeted prompts, sampled 3–5× each',
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
    body: 'Multi-engine AEO for $49 a month — not an annual enterprise contract. A two-location business can actually afford to stay visible.',
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
      { kind: 'text', text: '$49 / mo' },
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
