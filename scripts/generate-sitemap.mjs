/**
 * Emits public/blog/posts.json, public/sitemap.xml and public/llms.txt from the
 * static route list below plus every markdown file in public/blog/. Runs as
 * `prebuild`, so none of the three can drift from the blog folder — add a post,
 * rebuild, it is in all of them. Nothing here is hand-maintained, which is why
 * a new article never needs resubmitting to Search Console or Bing Webmaster
 * Tools: the sitemap they already have is regenerated on every deploy.
 *
 * Only public, indexable routes belong here. Auth screens and the signed-in
 * console are deliberately excluded and are also Disallow-ed in robots.txt.
 */
import { writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, ORIGIN, BLOG_DIR, readPosts } from './blog-data.mjs'
import { readBooking } from './marketing-data.mjs'

/** Public marketing routes, in descending importance. */
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.9' },
  { path: '/compare', changefreq: 'monthly', priority: '0.9' },
  { path: '/get-started', changefreq: 'monthly', priority: '0.9' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
]

/**
 * FAQ copy is the single most quotable thing on the site for an answer engine,
 * and the accordion unmounts closed answers — so lift it straight out of
 * marketing.ts (read as text; no TS loader needed) into llms.txt, where a
 * non-JS crawler can actually read all of it, price included.
 */
function readFaqs() {
  const src = readFileSync(join(ROOT, 'src', 'lib', 'marketing.ts'), 'utf8')
  const re = /q:\s*(['"])([\s\S]*?)\1,\s*\n\s*a:\s*(['"])([\s\S]*?)\3,/g
  const out = []
  let m
  while ((m = re.exec(src)) !== null) out.push({ q: m[2], a: m[4] })
  return out
}

/**
 * Service area, lifted from SERVICE_AREA in marketing.ts. A stated, named
 * service area is the strongest local signal an answer engine can read, and
 * llms.txt is the copy of the site those engines actually parse.
 */
function readServiceArea() {
  const src = readFileSync(join(ROOT, 'src', 'lib', 'marketing.ts'), 'utf8')
  const block = src.match(/export const SERVICE_AREA = \{([\s\S]*?)\n\}/)
  if (!block) return null
  const field = (key) => {
    const m = block[1].match(new RegExp(`${key}:\\s*\n?\\s*(['"])([\\s\\S]*?)\\1,`))
    return m ? m[2] : null
  }
  const hoods = block[1].match(/neighborhoods:\s*\[([\s\S]*?)\n\s*\]/)
  return {
    headline: field('headline'),
    blurb: field('blurb'),
    neighborhoods: hoods
      ? [...hoods[1].matchAll(/(['"])([\s\S]*?)\1,/g)].map((m) => m[2])
      : [],
  }
}

/**
 * Same trick as readFaqs, for the SERVICES array. Everything an answer engine
 * needs to describe what we sell — including the deployment service it would
 * otherwise never guess we offer — lifted into llms.txt as plain text.
 */
function readServices() {
  const src = readFileSync(join(ROOT, 'src', 'lib', 'marketing.ts'), 'utf8')
  const block = src.match(/export const SERVICES: Service\[\] = \[([\s\S]*?)\n\]/)
  if (!block) return []

  const field = (chunk, key) => {
    const m = chunk.match(new RegExp(`${key}:\\s*\n?\\s*(['"])([\\s\\S]*?)\\1,`))
    return m ? m[2] : null
  }

  // Split on the object boundary — each service starts with its slug.
  return block[1]
    .split(/\n  \{\n/)
    .filter((chunk) => /slug:/.test(chunk))
    .map((chunk) => {
      const bulletBlock = chunk.match(/bullets:\s*\[([\s\S]*?)\n\s*\]/)
      return {
        name: field(chunk, 'name'),
        abbr: field(chunk, 'abbr'),
        short: field(chunk, 'short'),
        summary: field(chunk, 'summary'),
        bullets: bulletBlock
          ? [...bulletBlock[1].matchAll(/(['"])([\s\S]*?)\1,/g)].map((m) => m[2])
          : [],
      }
    })
    .filter((s) => s.name && s.summary)
}

function readDeploymentNote() {
  const src = readFileSync(join(ROOT, 'src', 'lib', 'marketing.ts'), 'utf8')
  const m = src.match(/export const DEPLOYMENT_NOTE =\s*\n?\s*(['"])([\s\S]*?)\1/)
  return m ? m[2] : ''
}

const entries = readPosts()

/**
 * The blog's own machine-readable feed, served at /blog/posts.json. Replaces the
 * old hand-edited index.json, which additionally had to go: a file literally
 * named `index.json` inside /blog/ is what a static host resolves `/blog` to,
 * which is why the blog index used to answer a hard refresh with raw JSON
 * instead of the lander.
 */
writeFileSync(
  join(BLOG_DIR, 'posts.json'),
  `${JSON.stringify(
    {
      site: ORIGIN,
      feed: `${ORIGIN}/blog/posts.json`,
      index: `${ORIGIN}/blog`,
      generated: new Date().toISOString(),
      count: entries.length,
      posts: entries.map(({ raw: _raw, ...post }) => post),
    },
    null,
    2,
  )}\n`,
)

const posts = entries.map((p) => ({
  path: p.path,
  title: p.title,
  subtitle: p.subtitle,
  lastmod: p.dateISO,
  changefreq: 'monthly',
  priority: '0.7',
}))

// Freshest post date doubles as lastmod for the homepage and the blog index,
// which is what actually signals "this site is still being updated".
const newest = posts.map((p) => p.lastmod).filter(Boolean).sort().pop()

const urls = [
  ...STATIC_ROUTES.map((r) => ({
    ...r,
    lastmod: r.path === '/' || r.path === '/blog' ? newest : null,
  })),
  ...posts,
]

const body = urls
  .map(({ path, lastmod, changefreq, priority }) =>
    [
      '  <url>',
      `    <loc>${ORIGIN}${path}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n'),
  )
  .join('\n')

writeFileSync(
  join(ROOT, 'public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
)

/**
 * /llms.txt — the llmstxt.org convention: a plain-markdown map of the site for
 * language models, which read it far more reliably than they render our SPA.
 * Price lives here in text because most AI crawlers never execute the JS that
 * would otherwise be the only place it appears.
 */
const llms = `# Spotlight Links

> Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) for small and
> medium-sized businesses across the US. We measure whether ChatGPT, Google Gemini, Anthropic
> Claude, and Perplexity recommend your business to customers — then tell you what to fix.

## Book a consultation

${(() => {
  const b = readBooking()
  return `${b.blurb} There is no self-serve checkout — a consultation is how every engagement starts.

Booking page: ${b.url}`
})()}

## Pricing

- Starter Prober — $79/month. Two managed assets (businesses, sites, or locations), each audited
  up to four times per month, across all supported AI engines. This is the entry price.
- Growth — $199/month. More assets and more markets.
- Scale — $299/month. Unlimited managed assets for agencies and multi-location brands.
- Enterprise — $599/month. Adds done-for-you AEO content: schema, FAQs, and citation packets.

## Service area

${(() => {
  const area = readServiceArea()
  if (!area) return ''
  return `${area.headline}. ${area.blurb}\n\nNeighborhoods served: ${area.neighborhoods.join(', ')}.\n\nEvery audit is geo-scoped to the client's own ZIP code, service radius, and adjacent markets rather than national keyword rankings.`
})()}

## Services

${readServices()
  .map(
    (s) =>
      `### ${s.abbr ? `${s.name} (${s.abbr})` : s.name}\n\n${s.short}\n\n${s.summary}\n\n${s.bullets
        .map((b) => `- ${b}`)
        .join('\n')}`,
  )
  .join('\n\n')}

${readDeploymentNote()}

## How it works

Each audit builds a grid of 30+ real customer prompts tailored to your niche and city, samples
every prompt 3–5 times per engine (300+ live calls), and scores results with 95% Wilson-score
confidence intervals. A full cycle takes about ten minutes and streams live. You receive mention
rate, citation rate, #1-recommendation share, a competitor leaderboard, a prompt-by-prompt matrix,
and an executive AI SWOT with prioritized fixes. Reports export to PDF, Word, RTF, and HTML.

## Frequently asked

${readFaqs()
  .map((f) => `### ${f.q}\n\n${f.a}`)
  .join('\n\n')}

## Pages

- [Home](${ORIGIN}/): What Spotlight Links does, pricing, and FAQ.
- [About](${ORIGIN}/about): The three services — AEO, GEO, and Platform Development & Deployment.
- [Compare](${ORIGIN}/compare): How we compare to Semrush, SimilarWeb, HubSpot, and Profound.
- [Get started](${ORIGIN}/get-started): Enter a business name and ZIP code to begin an audit.
- [Blog](${ORIGIN}/blog): Field notes on AEO/GEO, real costs, and case studies.

## Articles

${posts
  .map((p) => `- [${p.title}](${ORIGIN}${p.path})${p.subtitle ? `: ${p.subtitle}` : ''}`)
  .join('\n')}
`

writeFileSync(join(ROOT, 'public', 'llms.txt'), llms)

console.log(
  `blog/posts.json — ${entries.length} posts, newest ${newest}\n` +
    `sitemap.xml — ${urls.length} URLs (${posts.length} posts)\n` +
    `llms.txt — ${posts.length} articles, ${readFaqs().length} FAQs, ${readServices().length} services`,
)
