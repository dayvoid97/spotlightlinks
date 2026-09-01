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
 * Every post carries the same frontmatter: `title`, `subtitle`, `date` (ISO),
 * `author`, optional `image`, then a `categories` block list. The legacy
 * `category`/`excerpt` keys are still accepted below so a stray old file cannot
 * break a build, but nothing in the folder uses them any more.
 *
 * Two display fields are *derived* rather than authored, so they read the same on
 * every post instead of only on the ones somebody remembered to fill in:
 * `date` (long form, from the ISO frontmatter) and `readTime` (from word count).
 * The parser and both derivations deliberately mirror `src/lib/blog.ts`, which
 * repeats this work client-side for the on-site reader. Keep them in step.
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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Frontmatter dates are authored as ISO (`2026-07-30`). Long form
 * (`August 10, 2026`) is still accepted for any file that predates that rule.
 * `<lastmod>` and schema.org `datePublished` both require W3C datetime, so
 * normalize to YYYY-MM-DD and drop anything unparseable rather than emitting an
 * invalid date.
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
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      // Titles and subtitles are double-quoted and carry \" for any quote of
      // their own; leaving the backslash in ships it to og:description verbatim.
      return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'")
    }
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
 * The byline date, derived from the ISO frontmatter so every post reads
 * "August 10, 2026" rather than half the folder showing a bare `2026-08-10`.
 * Built from the date parts directly — `new Date('2026-08-10')` parses as UTC
 * midnight and formats as the 9th in any timezone west of Greenwich.
 * Mirrors `formatPostDate()` in src/lib/blog.ts.
 */
export function formatPostDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  const month = MONTH_NAMES[Number(m) - 1]
  return month ? `${month} ${Number(d)}, ${y}` : iso
}

/** Words per minute used for the estimate. Ordinary prose, read attentively. */
const WORDS_PER_MINUTE = 200

/**
 * The byline read time, derived from the body so it is present and computed the
 * same way on every post — hand-written `readTime` frontmatter only ever covered
 * a third of the folder, which is what made the bylines look mismatched.
 * Markdown syntax, code fences and URLs are stripped first so a post heavy in
 * links does not read as longer than it is.
 * Mirrors `estimateReadTime()` in src/lib/blog.ts.
 */
export function estimateReadTime(body) {
  const prose = String(body)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~|-]/g, ' ')
  const words = prose.split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`
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
 * Drop a single leading `# Heading` from the body. No post in the folder carries
 * one any more — the frontmatter title is the page's only H1 — but this stays as
 * a safety net for a hand-written file that reintroduces the duplicate.
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
        ? fm.category.split(',').map((c) => c.trim()).filter(Boolean)
        : []

      const dateISO = normalizeDate(str(fm.date))

      return {
        slug,
        url: `${ORIGIN}/blog/${slug}`,
        path: `/blog/${slug}`,
        markdown: `${ORIGIN}/blog/${slug}.md`,
        title: str(fm.title) ?? slug.replace(/-/g, ' '),
        subtitle: str(fm.subtitle) ?? str(fm.excerpt),
        /** Long form, for the byline. Derived — see formatPostDate(). */
        date: formatPostDate(dateISO) ?? str(fm.date),
        /** W3C YYYY-MM-DD, for <lastmod> and schema.org. Null if unparseable. */
        dateISO,
        author: str(fm.author),
        categories,
        /** Derived from the body, not the frontmatter — see estimateReadTime(). */
        readTime: estimateReadTime(stripFrontmatter(raw)),
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
