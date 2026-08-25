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
      return v.slice(1, -1)
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
      // Empty value on its own line means a YAML bullet list follows.
      currentListKey = key
      out[key] = []
    } else if (value.startsWith('[') && value.endsWith(']')) {
      out[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => unquote(s.trim()))
        .filter(Boolean)
      currentListKey = null
    } else {
      out[key] = unquote(value)
      currentListKey = null
    }
  }

  return out
}

function toStringField(v: string | string[] | undefined): string | null {
  if (typeof v === 'string' && v.length > 0) return v
  return null
}

/**
 * Shape of the generated feed at /blog/posts.json. Each post carries a few
 * build-time extras beyond `BlogPost` (`url`, `markdown`, `dateISO`) that the UI
 * has no use for, but that make the file worth something to anything crawling it.
 */
interface BlogFeed {
  count: number
  posts: BlogPost[]
}

/** Every post, newest first, exactly as generated at build time. */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch('/blog/posts.json')
  if (!res.ok) return []
  const feed: BlogFeed = await res.json()
  return Array.isArray(feed.posts) ? feed.posts : []
}

/**
 * Frontmatter image paths point at spotlightlinks.com's own asset layout
 * (`/media/...`, `/blog/aeo/...`, `/spotlightskills/...`) which mostly
 * wasn't copied into this project — only `public/mediasets/` has local
 * copies. Rather than hard-code which basenames exist, this guesses
 * `/mediasets/<basename>` and lets <BlogCard>'s onError fall back to a
 * plain gradient card for anything that 404s. Drop more images into
 * `public/mediasets/` later and matching posts pick them up automatically.
 */
export function guessLocalImage(rawPath: string | null): string | null {
  if (!rawPath) return null
  const basename = rawPath.split('/').pop()
  return basename ? `/mediasets/${basename}` : null
}

export function blogPostUrl(slug: string): string {
  return `https://spotlightlinks.com/blog/${slug}`
}

/** Strip the leading `---\n…\n---` frontmatter block, returning just the body. */
function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
}

/**
 * Drop a single leading `# Heading` from the body. Most posts repeat their
 * title as an H1 at the top of the markdown; since BlogPostPage renders the
 * frontmatter title as the page heading, that would double it.
 */
function stripLeadingH1(body: string): string {
  return body.replace(/^\s*#\s+.*(?:\r?\n|$)/, '')
}

/** Site-relative image paths → local /mediasets copy (basename match); http(s)/data left as-is. */
function localizeImgSrc(src: string): string {
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) return src
  const basename = src.split('/').pop()
  return basename ? `/mediasets/${basename}` : src
}

/**
 * Post-process marked's HTML: point images at their local copies and have any
 * that 404 remove themselves (most article images live on spotlightlinks.com
 * and weren't copied here), and open external links in a new tab.
 */
function enhanceArticleHtml(html: string): string {
  return html
    .replace(/<img\b[^>]*>/gi, (tag) => {
      const src = tag.match(/\ssrc="([^"]*)"/i)
      if (!src) return tag
      let out = tag.replace(/\ssrc="[^"]*"/i, ` src="${localizeImgSrc(src[1])}"`)
      if (!/\sloading=/i.test(out)) out = out.replace(/<img/i, '<img loading="lazy"')
      if (!/\sonerror=/i.test(out))
        out = out.replace(/<img/i, `<img onerror="this.style.display='none'"`)
      return out
    })
    .replace(/<a\b([^>]*?)href="(https?:\/\/[^"]*)"([^>]*)>/gi, (_m, pre, href, post) => {
      const attrs = `${pre}${post}`
      const rel = /\srel=/i.test(attrs) ? '' : ' rel="noreferrer"'
      const target = /\starget=/i.test(attrs) ? '' : ' target="_blank"'
      return `<a${pre}href="${href}"${post}${target}${rel}>`
    })
}

export interface BlogPostDetail {
  post: BlogPost
  /** Rendered, image-localized article HTML, safe to inject (first-party content). */
  html: string
  /** Pristine raw markdown content including YAML frontmatter. */
  raw: string
}

/** Fetch and render a single post for the on-site reader (/blog/:slug). */
export async function fetchBlogPost(slug: string): Promise<BlogPostDetail | null> {
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
  const html = enhanceArticleHtml(marked.parse(body, { gfm: true, async: false }))

  return { post, html, raw }
}
