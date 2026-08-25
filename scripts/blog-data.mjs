/**
 * Build-time source of truth for the blog.
 *
 * Reads every `public/blog/*.md`, parses its frontmatter, and returns the posts
 * newest-first. **The folder is the manifest** — drop a `.md` in and it shows up
 * in `posts.json`, `sitemap.xml`, `llms.txt` and the prerendered HTML on the very
 * next build, with no hand-edited list to keep in sync. That is the point: the
 * sitemap submitted once to Search Console / Bing Webmaster Tools stays correct
 * forever, so a new article never needs to be submitted by hand.
 *
 * The frontmatter parser deliberately mirrors `parseFrontmatter()` in
 * `src/lib/blog.ts` — the same two shapes appear across this folder
 * (`category`/`readTime`/`excerpt` on older posts, `categories`/`subtitle` on
 * newer ones) and both sides must agree on how they normalize. Keep them in step.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
export const ORIGIN = 'https://spotlightlinks.com'
export const BLOG_DIR = join(ROOT, 'public', 'blog')
const MEDIA_DIR = join(ROOT, 'public', 'mediasets')

/** Site-wide OG image, used whenever a post has no usable image of its own. */
export const DEFAULT_OG_IMAGE = `${ORIGIN}/mediasets/aeo-for-brick-and-mortar.png`

const MONTHS = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
}

/**
 * Frontmatter dates come in two shapes across the folder — ISO (`2026-07-30`)
 * and long form (`August 10, 2026`). `<lastmod>` and schema.org `datePublished`
 * both require W3C datetime, so normalize both to YYYY-MM-DD and drop anything
 * unparseable rather than emitting an invalid date.
 */
export function normalizeDate(raw) {
  if (!raw) return null
  const value = String(raw)
    .trim()
    .replace(/^['"]|['"]$/g, '')

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const long = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/)
  if (long) {
    const month = MONTHS[long[1].toLowerCase()]
    if (month) return `${long[3]}-${month}-${long[2].padStart(2, '0')}`
  }
  return null
}

function unquote(value) {
  const v = value.trim()
  if (v.length >= 2) {
    const first = v[0]
    const last = v[v.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) return v.slice(1, -1)
  }
  return v
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  const out = {}
  let currentListKey = null

  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.+)$/)
    if (listItem && currentListKey) {
      const arr = out[currentListKey] ?? []
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

function str(v) {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null
}

/**
 * Frontmatter `image` paths point at spotlightlinks.com's own asset layout
 * (`/media/...`, `/blog/aeo/...`, `/spotlightskills/...`); only some of those
 * files have local copies in `public/mediasets/`. Resolve by basename, ignoring
 * the extension — at least one post records `.jpeg` for a file saved as `.jpg`,
 * and an og:image pointing at a 404 is worse than no og:image at all.
 *
 * Returns a site-absolute path (`/mediasets/foo.jpg`) or null when nothing matches.
 */
export function resolveLocalImage(rawPath) {
  if (!rawPath) return null
  const wanted = basename(rawPath).toLowerCase()
  const stem = wanted.slice(0, wanted.length - extname(wanted).length)
  if (!existsSync(MEDIA_DIR)) return null

  const files = readdirSync(MEDIA_DIR)
  const exact = files.find((f) => f.toLowerCase() === wanted)
  if (exact) return `/mediasets/${exact}`

  const byStem = files.find((f) => f.slice(0, f.length - extname(f).length).toLowerCase() === stem)
  return byStem ? `/mediasets/${byStem}` : null
}

/** Strip the leading `---\n…\n---` frontmatter block, returning just the body. */
export function stripFrontmatter(raw) {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
}

/**
 * Drop a single leading `# Heading` from the body — most posts repeat their
 * title as an H1, and every renderer here emits the frontmatter title itself.
 * Mirrors `stripLeadingH1()` in src/lib/blog.ts.
 */
export function stripLeadingH1(body) {
  return body.replace(/^\s*#\s+.*(?:\r?\n|$)/, '')
}

/**
 * Every post in `public/blog/`, newest first. Undated posts sort last, by slug,
 * so ordering is stable across builds rather than filesystem-dependent.
 *
 * Each post carries `raw` (the untouched file, frontmatter included) for callers
 * that need to render the body; strip it before serializing anything public.
 */
export function readPosts() {
  const posts = readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const raw = readFileSync(join(BLOG_DIR, filename), 'utf8')
      const fm = parseFrontmatter(raw)

      const categories = Array.isArray(fm.categories)
        ? fm.categories
        : typeof fm.category === 'string'
        ? [fm.category]
        : []

      return {
        slug,
        url: `${ORIGIN}/blog/${slug}`,
        path: `/blog/${slug}`,
        markdown: `${ORIGIN}/blog/${slug}.md`,
        title: str(fm.title) ?? slug.replace(/-/g, ' '),
        subtitle: str(fm.subtitle) ?? str(fm.excerpt),
        /** As written in the frontmatter — this is what the UI displays. */
        date: str(fm.date),
        /** W3C YYYY-MM-DD, for <lastmod> and schema.org. Null if unparseable. */
        dateISO: normalizeDate(str(fm.date)),
        author: str(fm.author),
        categories,
        readTime: str(fm.readTime),
        image: resolveLocalImage(str(fm.image)),
        raw,
      }
    })

  return posts.sort((a, b) => {
    if (a.dateISO && b.dateISO && a.dateISO !== b.dateISO) return b.dateISO.localeCompare(a.dateISO)
    if (a.dateISO && !b.dateISO) return -1
    if (!a.dateISO && b.dateISO) return 1
    return a.slug.localeCompare(b.slug)
  })
}
