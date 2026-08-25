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
      ? [fm.category]
      : []

    const post: BlogPost = {
      slug,
      title: toStringField(fm.title) ?? slug.replace(/-/g, ' '),
      subtitle: toStringField(fm.subtitle) ?? toStringField(fm.excerpt),
      date: toStringField(fm.date),
      author: toStringField(fm.author),
      categories,
      readTime: toStringField(fm.readTime),
      image: toStringField(fm.image),
    }

    const body = stripLeadingH1(stripFrontmatter(raw))
    const parsed = marked.parse(body, { gfm: true, breaks: false }) as string
    const html = enhanceArticleHtml(parsed)

    return { post, html, raw }
  } catch {
    return null
  }
}
