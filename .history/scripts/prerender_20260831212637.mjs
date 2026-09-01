/**
 * Post-build prerender. Runs as `postbuild`, after Vite has written dist/.
 *
 * Why this exists
 * ---------------
 * This app is a client-rendered SPA behind a catch-all rewrite, so every URL used
 * to return the *same* `dist/index.html` — one title, one description, one
 * canonical-less head. That is why a blog post showed up in Google as
 * "AI Search Visibility Console. - Spotlight Links" instead of its own headline:
 * the title Google indexed was the shell's, and the article title only ever
 * existed after React ran. Crawlers that never execute JS (GPTBot, ClaudeBot,
 * PerplexityBot, most link unfurlers) saw an empty `<div id="root">` and nothing
 * else — on a site whose entire business is being citable by those crawlers.
 *
 * So for each public route we emit a real static file — `dist/<route>/index.html`
 * — carrying that route's own `<title>`, description, canonical, Open Graph and
 * Twitter tags, route-specific JSON-LD, and, for the blog, the actual article
 * body as HTML. A static host serves those before it reaches the SPA rewrite;
 * React then boots on top and takes over as usual, so nothing about the in-app
 * experience changes. If a host ever failed to match the static file it would
 * simply fall through to the rewrite and the old SPA behaviour — this is
 * additive, never load-bearing.
 *
 * The prerendered markup is the same content React renders, not a crawler-only
 * variant: no cloaking, and it doubles as the no-JS fallback.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { marked } from 'marked'
import {
  ROOT,
  ORIGIN,
  DEFAULT_OG_IMAGE,
  readPosts,
  resolveLocalImage,
  stripFrontmatter,
  stripLeadingH1,
} from './blog-data.mjs'
import { readBooking } from './marketing-data.mjs'

const DIST = join(ROOT, 'dist')
const SHELL = readFileSync(join(DIST, 'index.html'), 'utf8')
const BOOKING = readBooking()

const BLOG_H1 = 'AEO, GEO, and what actually gets a business recommended by AI'
const BLOG_TAGLINE =
  'Field notes from running real Answer Engine Optimization for real businesses — the methods, the costs, and the results.'

/** Descriptions longer than this get cut on a word boundary; ~2 lines of snippet. */
const MAX_DESCRIPTION = 300

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** JSON-LD payload, safe to drop between <script> tags. */
const ld = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj, (_k, v) => v ?? undefined).replace(
    /</g,
    '\\u003c'
  )}</script>`

function clamp(text, max = MAX_DESCRIPTION) {
  const value = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
  if (value.length <= max) return value
  const cut = value.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '')}…`
}

/**
 * Article images point at spotlightlinks.com's asset layout; only some have local
 * copies. The runtime renderer hides the misses with an inline `onerror`, but a
 * crawler never runs that — so here we drop unresolvable images outright rather
 * than shipping broken <img> tags into the indexed HTML.
 */
function renderArticleBody(raw) {
  const html = marked.parse(stripLeadingH1(stripFrontmatter(raw)), { gfm: true, async: false })
  return html
    .replace(/<img\b[^>]*>/gi, (tag) => {
      const src = tag.match(/\ssrc="([^"]*)"/i)
      if (!src) return ''
      if (/^(https?:)?\/\//i.test(src[1]) || src[1].startsWith('data:')) return tag
      const local = resolveLocalImage(src[1])
      if (!local) return ''
      return tag
        .replace(/\ssrc="[^"]*"/i, ` src="${local}"`)
        .replace(/<img/i, '<img loading="lazy"')
    })
    .replace(/<a\b([^>]*?)href="(https?:\/\/[^"]*)"([^>]*)>/gi, (_m, pre, href, post) => {
      const attrs = `${pre}${post}`
      const rel = /\srel=/i.test(attrs) ? '' : ' rel="noreferrer"'
      const target = /\starget=/i.test(attrs) ? '' : ' target="_blank"'
      return `<a${pre}href="${href}"${post}${target}${rel}>`
    })
}

/**
 * Real <a href> navigation around the prerendered content. The SPA's own header
 * uses React Router <Link>s, which a non-rendering crawler cannot follow — these
 * are how it discovers the rest of the site from any article it lands on.
 */
const chrome = (crumbs) => `
      <nav aria-label="Site" style="margin-bottom:2rem;font-size:0.875rem">
        <a href="/">Spotlight Links</a> ·
        <a href="/about">About</a> ·
        <a href="/compare">Compare</a> ·
        <a href="/blog">Blog</a> ·
        <a href="/get-started">Get started</a> ·
        <a href="${BOOKING.url}" target="_blank" rel="noreferrer">${BOOKING.label}</a>
      </nav>
      ${crumbs}`

/**
 * The booking CTA, in the static HTML rather than only in the React tree. This
 * is the site's one conversion path, so it has to survive a crawler that never
 * runs JS and a reader with scripting off — an end-of-article call to action
 * that only exists after hydration is not an end-of-article call to action.
 */
const FOOTER = `
      <hr />
      <section>
        <h2>${esc(BOOKING.headline)}</h2>
        <p>${esc(BOOKING.blurb)}</p>
        <p><a href="${esc(BOOKING.url)}" target="_blank" rel="noreferrer">${esc(
  BOOKING.cta
)} →</a></p>
      </section>`

/**
 * Rewrite the built shell's head for one route and, optionally, seed
 * `<div id="root">` with static content. React's createRoot() replaces whatever
 * is in the container when it mounts, so the seed is purely what non-JS clients
 * (and the moments before the bundle executes) get to see.
 */
function renderPage({ path, title, description, ogType = 'website', ogImage, head = '', body }) {
  const canonical = `${ORIGIN}${path === '/' ? '/' : path}`
  const image = ogImage ?? DEFAULT_OG_IMAGE
  let html = SHELL

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  html = html.replace(
    /<meta name="description" content="[\s\S]*?" \/>/,
    `<meta name="description" content="${esc(description)}" />`
  )
  html = html.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="${ogType}" />\n    <meta property="og:url" content="${canonical}" />\n    <link rel="canonical" href="${canonical}" />`
  )

  for (const [attr, key, value] of [
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:image', image],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:image', image],
  ]) {
    html = html.replace(
      new RegExp(`<meta ${attr}="${key}" content="[\\s\\S]*?" />`),
      `<meta ${attr}="${key}" content="${esc(value)}" />`
    )
  }

  // The shell's declared dimensions belong to the default image only.
  if (image !== DEFAULT_OG_IMAGE) {
    html = html.replace(/\s*<meta property="og:image:(?:width|height)" content="[^"]*" \/>/g, '')
  }

  if (head) html = html.replace('</head>', `${head}\n  </head>`)
  if (body) html = html.replace('<div id="root"></div>', `<div id="root">${body}\n    </div>`)

  const dir = path === '/' ? DIST : join(DIST, path)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html)
  return path
}

const posts = readPosts()
const written = []

// ── Marketing routes ──────────────────────────────────────────────────────────
// Head tags only. Their copy lives in React components rather than in markdown,
// so there is no build-time source to render a body from; the titles and
// descriptions below mirror each page's own H1 and standfirst.
const MARKETING = [
  {
    path: '/',
    title: 'Spotlight Links | AI Search Visibility Console.',
    description:
      "Find out exactly what ChatGPT, Gemini, Claude, and Perplexity tell customers about your business — and fix what's costing you the recommendation. Answer Engine Optimization and Generative Engine Optimization for small and medium sized businesses across the US. From $79/month.",
  },
  {
    path: '/about',
    title: 'About Spotlight Links — AEO, GEO, and Platform Deployment',
    description:
      'Spotlight Links gets businesses recommended by name inside AI answers, focusing on Google Gemini and ChatGPT — where nearly all everyday consumer AI use happens. The Spotlight Links Probe measures what the engines say about you today, from $79/month. Implementation typically runs 45 to 60 days.',
  },
  {
    path: '/compare',
    title: 'Spotlight Links vs Semrush, SimilarWeb, HubSpot and Profound',
    description:
      'Built for AI answers, not retrofitted for them. An honest look at how Spotlight Links compares to the established platforms on Answer Engine Optimization and Generative Engine Optimization, and where each one fits.',
  },
  {
    path: '/get-started',
    title: 'Start an AI Visibility Audit | Spotlight Links',
    description:
      'Build your business profile and run a multi-engine visibility audit across ChatGPT, Gemini, Claude, and Perplexity. A few plain questions about your business — we have already answered the ones we could guess.',
  },
]

for (const page of MARKETING) written.push(renderPage(page))

// ── /blog ─────────────────────────────────────────────────────────────────────
// The index also ships every article as a plain <a href>, which is the only way
// a non-rendering crawler discovers the posts at all — the live grid is built
// from a fetch() it never makes.
written.push(
  renderPage({
    path: '/blog',
    title: `${BLOG_H1} | Spotlight Links`,
    description: BLOG_TAGLINE,
    head: [
      `<link rel="alternate" type="application/json" href="/blog/posts.json" title="Spotlight Links blog feed" />`,
      ld({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${ORIGIN}/blog#blog`,
        url: `${ORIGIN}/blog`,
        name: 'The Spotlight Links Blog',
        headline: BLOG_H1,
        description: BLOG_TAGLINE,
        inLanguage: 'en-US',
        publisher: { '@id': `${ORIGIN}/#organization` },
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          '@id': `${p.url}#article`,
          url: p.url,
          headline: p.title,
          description: p.subtitle,
          datePublished: p.dateISO,
          author: p.author ? { '@type': 'Person', name: p.author } : undefined,
        })),
      }),
      ld({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${ORIGIN}/blog` },
        ],
      }),
    ].join('\n    '),
    body: `
      <main style="margin:0 auto;max-width:48rem;padding:2rem 1.25rem">${chrome(`
        <p style="font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase">The Spotlight Links Blog</p>
        <h1>${esc(BLOG_H1)}</h1>
        <p>${esc(BLOG_TAGLINE)}</p>`)}
        <h2>All articles (${posts.length})</h2>
        <ul>${posts
          .map(
            (p) => `
          <li style="margin-bottom:1rem">
            <a href="${p.path}">${esc(p.title)}</a>${p.date ? ` <small>${esc(p.date)}</small>` : ''}
            ${p.subtitle ? `<div><small>${esc(clamp(p.subtitle, 200))}</small></div>` : ''}
          </li>`
          )
          .join('')}
        </ul>${FOOTER}
      </main>`,
  })
)

// ── /blog/:slug ───────────────────────────────────────────────────────────────
for (const post of posts) {
  const description = clamp(post.subtitle ?? post.title)
  written.push(
    renderPage({
      path: post.path,
      title: post.title.includes('Spotlight Links')
        ? post.title
        : `${post.title} | Spotlight Links`,
      description,
      ogType: 'article',
      ogImage: post.image ? `${ORIGIN}${post.image}` : undefined,
      head: [
        `<link rel="alternate" type="text/markdown" href="/blog/${post.slug}.md" />`,
        post.dateISO
          ? `<meta property="article:published_time" content="${post.dateISO}" />`
          : null,
        post.author ? `<meta property="article:author" content="${esc(post.author)}" />` : null,
        ...post.categories.map((c) => `<meta property="article:tag" content="${esc(c)}" />`),
        ld({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          '@id': `${post.url}#article`,
          mainEntityOfPage: { '@type': 'WebPage', '@id': post.url },
          url: post.url,
          headline: clamp(post.title, 110),
          description,
          image: post.image ? `${ORIGIN}${post.image}` : DEFAULT_OG_IMAGE,
          datePublished: post.dateISO,
          dateModified: post.dateISO,
          inLanguage: 'en-US',
          keywords: post.categories.length ? post.categories.join(', ') : undefined,
          author: post.author
            ? { '@type': 'Person', name: post.author, url: `${ORIGIN}/about` }
            : { '@id': `${ORIGIN}/#organization` },
          publisher: { '@id': `${ORIGIN}/#organization` },
          isPartOf: { '@id': `${ORIGIN}/blog#blog` },
          // The .md beside every post is the canonical machine-readable copy.
          encoding: {
            '@type': 'MediaObject',
            encodingFormat: 'text/markdown',
            contentUrl: post.markdown,
          },
        }),
        ld({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${ORIGIN}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: post.url },
          ],
        }),
      ]
        .filter(Boolean)
        .join('\n    '),
      body: `
      <main style="margin:0 auto;max-width:48rem;padding:2rem 1.25rem">${chrome(`
        <p style="font-size:0.875rem"><a href="/blog">← All posts</a></p>`)}
        <article>
          <h1>${esc(post.title)}</h1>
          ${post.subtitle ? `<p class="lead">${esc(post.subtitle)}</p>` : ''}
          <p style="font-size:0.875rem">${[post.author, post.date, post.readTime]
            .filter(Boolean)
            .map(esc)
            .join(' · ')}</p>
          ${post.image ? `<img src="${post.image}" alt="" />` : ''}
          <div class="blog-body">${renderArticleBody(post.raw)}</div>
        </article>${FOOTER}
      </main>`,
    })
  )
}

console.log(
  `prerendered ${written.length} routes → dist/ (${MARKETING.length} marketing, ` +
    `1 blog index, ${posts.length} articles)`
)
