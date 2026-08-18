/**
 * Emits public/sitemap.xml and public/llms.txt from the static route list below
 * plus every post in public/blog/index.json. Runs as `prebuild`, so neither file
 * can drift from the blog folder — add a post, rebuild, it is in both.
 *
 * Only public, indexable routes belong here. Auth screens and the signed-in
 * console are deliberately excluded and are also Disallow-ed in robots.txt.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://spotlightlinks.com'
const BLOG_DIR = join(ROOT, 'public', 'blog')

/** Public marketing routes, in descending importance. */
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/compare', changefreq: 'monthly', priority: '0.9' },
  { path: '/get-started', changefreq: 'monthly', priority: '0.9' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
]

const MONTHS = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
}

/**
 * Frontmatter dates come in two shapes across the folder — ISO (`2026-07-30`)
 * and long form (`August 10, 2026`). <lastmod> requires W3C datetime, so
 * normalize both to YYYY-MM-DD and drop anything we cannot parse rather than
 * emitting an invalid date that would fail validation for the whole file.
 */
function normalizeDate(raw) {
  if (!raw) return null
  const value = raw.trim().replace(/^['"]|['"]$/g, '')

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const long = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/)
  if (long) {
    const month = MONTHS[long[1].toLowerCase()]
    if (month) return `${long[3]}-${month}-${long[2].padStart(2, '0')}`
  }
  return null
}

function frontmatterField(slug, field) {
  const raw = readFileSync(join(BLOG_DIR, `${slug}.md`), 'utf8')
  const block = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) return null
  const line = block[1].split(/\r?\n/).find((l) => new RegExp(`^${field}:`).test(l))
  if (!line) return null
  return line.replace(new RegExp(`^${field}:\\s*`), '').trim().replace(/^['"]|['"]$/g, '')
}

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

const slugs = JSON.parse(readFileSync(join(BLOG_DIR, 'index.json'), 'utf8')).map((f) =>
  f.replace(/\.md$/, ''),
)

const posts = slugs.map((slug) => ({
  path: `/blog/${slug}`,
  title: frontmatterField(slug, 'title') ?? slug.replace(/-/g, ' '),
  subtitle: frontmatterField(slug, 'subtitle'),
  lastmod: normalizeDate(frontmatterField(slug, 'date')),
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

## Pricing

- Starter Prober — $79/month. Two managed assets (businesses, sites, or locations), each audited
  up to four times per month, across all supported AI engines. This is the entry price.
- Growth — $199/month. More assets and more markets.
- Scale — $299/month. Unlimited managed assets for agencies and multi-location brands.
- Enterprise — $599/month. Adds done-for-you AEO content: schema, FAQs, and citation packets.

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
  `sitemap.xml — ${urls.length} URLs (${posts.length} posts), newest ${newest}\n` +
    `llms.txt — ${posts.length} articles, ${readFaqs().length} FAQs`,
)
