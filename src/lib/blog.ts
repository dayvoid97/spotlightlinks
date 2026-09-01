import { marked } from 'marked'

export interface BlogPost {
  slug: string
  title: string
  subtitle: string | null
  date: string | null
  author: string | null
  categories: string[]
  readTime: string | null
  image: string | null
}

function unquote(value: string): string {
  const v = value.trim()
  if (v.length >= 2) {
    const first = v[0]
    const last = v[v.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'")
    }
  }
  return v
}

function parseFrontmatter(raw: string): Record<string, string | string[]> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  const out: Record<string, string | string[]> = {}
  let currentListKey: string | null = null

  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.+)$/)
    if (listItem && currentListKey) {
      const arr = (out[currentListKey] as string[] | undefined) ?? []
      arr.push(unquote(listItem[1]))
      out[currentListKey] = arr
      continue
    }

    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!kv) continue
    const [, key, rawValue] = kv
    const value = rawValue.trim()

    if (value === '') {
      currentListKey = key
      out[key] = []
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Split by comma outside quoted strings
      const items = value.slice(1, -1).match(/(?:[^\s,"]+|"[^"]*"|'[^']*')+/g) ?? []
      out[key] = items.map((s) => unquote(s.trim())).filter(Boolean)
      currentListKey = null
    } else {
      out[key] = unquote(value)
      currentListKey = null
    }
  }

  return out
}

function toStringField(v: string | string[] | undefined): string | null {
  if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  return null
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * The byline date. Frontmatter dates are authored as ISO; the byline shows long
 * form, so every post reads "August 10, 2026" instead of half the folder showing
 * a bare `2026-08-10`. Built from the date parts directly, since
 * `new Date('2026-08-10')` parses as UTC midnight and renders as the 9th in any
 * timezone west of Greenwich. Anything not ISO is passed through untouched.
 *
 * Mirrors `formatPostDate()` in scripts/blog-data.mjs, which does this at build
 * time for posts.json — keep the two in step.
 */
function formatPostDate(raw: string | null): string | null {
  if (!raw) return null
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!iso) return raw
  const month = MONTH_NAMES[Number(iso[2]) - 1]
  return month ? `${month} ${Number(iso[3])}, ${iso[1]}` : raw
}

/** Words per minute used for the estimate. Ordinary prose, read attentively. */
const WORDS_PER_MINUTE = 200

/**
 * The byline read time, derived from the body so it is present and computed the
 * same way on every post — hand-written `readTime` frontmatter only ever covered
 * a third of the folder, which is what made the bylines look mismatched.
 *
 * Mirrors `estimateReadTime()` in scripts/blog-data.mjs — keep the two in step,
 * or a post's read time changes as you navigate from the index into the reader.
 */
function estimateReadTime(body: string): string {
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~|-]/g, ' ')
  const words = prose.split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`
}

interface BlogFeed {
  count: number
  posts: BlogPost[]
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch('/blog/posts.json')
    if (!res.ok) return []
    const feed: BlogFeed = await res.json()
    return Array.isArray(feed.posts) ? feed.posts : []
  } catch {
    return []
  }
}

export function guessLocalImage(rawPath: string | null): string | null {
  if (!rawPath) return null
  const basename = rawPath.split('/').pop()?.split('?')[0]
  return basename ? `/mediasets/${basename}` : null
}

export function blogPostUrl(slug: string): string {
  return `https://spotlightlinks.com/blog/${slug}`
}

function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
}

function stripLeadingH1(body: string): string {
  return body.replace(/^\s*#\s+.*(?:\r?\n|$)/, '')
}

function localizeImgSrc(src: string): string {
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) return src
  const basename = src.split('/').pop()?.split('?')[0]
  return basename ? `/mediasets/${basename}` : src
}

function enhanceArticleHtml(html: string): string {
  return html
    .replace(/<img\b([^>]*?)src=["']([^"']*)["']([^>]*?)>/gi, (_m, pre, src, post) => {
      const localSrc = localizeImgSrc(src)
      const rest = `${pre} ${post}`
      const loading = /\sloading=/i.test(rest) ? '' : ' loading="lazy"'
      const onError = /\sonerror=/i.test(rest) ? '' : ` onerror="this.style.display='none'"`
      return `<img${pre} src="${localSrc}"${post}${loading}${onError}>`
    })
    .replace(/<a\b([^>]*?)href=["'](https?:\/\/[^"']*)["']([^>]*?)>/gi, (_m, pre, href, post) => {
      const rest = `${pre} ${post}`
      const rel = /\srel=/i.test(rest) ? '' : ' rel="noreferrer noopener"'
      const target = /\starget=/i.test(rest) ? '' : ' target="_blank"'
      return `<a${pre} href="${href}"${post}${target}${rel}>`
    })
}

export interface BlogPostDetail {
  post: BlogPost
  html: string
  raw: string
}

export async function fetchBlogPost(slug: string): Promise<BlogPostDetail | null> {
  try {
    const res = await fetch(`/blog/${slug}.md`)
    if (!res.ok) return null
    const raw = await res.text()
    const fm = parseFrontmatter(raw)

    const categories = Array.isArray(fm.categories)
      ? fm.categories
      : typeof fm.category === 'string'
      ? fm.category.split(',').map((c) => c.trim()).filter(Boolean)
      : []

    const body = stripLeadingH1(stripFrontmatter(raw))

    const post: BlogPost = {
      slug,
      title: toStringField(fm.title) ?? slug.replace(/-/g, ' '),
      subtitle: toStringField(fm.subtitle) ?? toStringField(fm.excerpt),
      date: formatPostDate(toStringField(fm.date)),
      author: toStringField(fm.author),
      categories,
      readTime: estimateReadTime(body),
      image: toStringField(fm.image),
    }

    const parsed = marked.parse(body, { gfm: true, breaks: false }) as string
    const html = enhanceArticleHtml(parsed)

    return { post, html, raw }
  } catch {
    return null
  }
}
