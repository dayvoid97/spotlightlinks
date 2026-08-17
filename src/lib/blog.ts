/**
 * Reads the Spotlight Links blog copy shipped in `public/blogcopy/` — plain
 * markdown files with YAML frontmatter, plus an `index.json` listing them.
 * These are local copies of posts that live for real at
 * spotlightlinks.com/blogsets/:slug — this app never renders the article
 * body, only the frontmatter, and links out to the real post for reading.
 *
 * There's no YAML/markdown parser dependency here on purpose: the
 * frontmatter block is small and hand-written, not user input, so a plain
 * line-based parser is enough and keeps this a zero-dependency read. It
 * handles the two shapes actually present in this folder: `category: "x"`
 * / `readTime: "y"` / `excerpt: "z"` (older posts), and `categories:` as a
 * YAML bullet list or an inline `["a", "b"]` array with `subtitle`/`image`
 * (newer posts). See docs/11-homepage-and-blog.md for the full field
 * reference this was read from.
 */

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

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const indexRes = await fetch('/blog/index.json')
  if (!indexRes.ok) return []
  const files: string[] = await indexRes.json()

  const posts = await Promise.all(
    files.map(async (filename): Promise<BlogPost | null> => {
      const res = await fetch(`/blogcopy/${filename}`)
      if (!res.ok) return null
      const raw = await res.text()
      const fm = parseFrontmatter(raw)

      const categories = Array.isArray(fm.categories)
        ? fm.categories
        : typeof fm.category === 'string'
        ? [fm.category]
        : []

      const slug = filename.replace(/\.md$/, '')

      return {
        slug,
        title: toStringField(fm.title) ?? slug.replace(/-/g, ' '),
        subtitle: toStringField(fm.subtitle) ?? toStringField(fm.excerpt),
        date: toStringField(fm.date),
        author: toStringField(fm.author),
        categories,
        readTime: toStringField(fm.readTime),
        image: toStringField(fm.image),
      }
    })
  )

  return posts.filter((p): p is BlogPost => p !== null)
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
