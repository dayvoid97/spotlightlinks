/**
 * Build-time access to constants that live in `src/lib/marketing.ts`.
 *
 * The generators are plain node scripts with no TypeScript loader, so they read
 * the module as text and pull fields out by regex — the same trick
 * `generate-sitemap.mjs` already uses for the FAQs, services, and service area.
 * The cost is that the source has to keep its shape (`key: 'value',`, one per
 * line); the benefit is that the copy has exactly one home, and the prerendered
 * HTML can never quote a different booking URL than the app does.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './blog-data.mjs'

const MARKETING = join(ROOT, 'src', 'lib', 'marketing.ts')

/**
 * The `BOOKING` block: where inbound interest goes now that onboarding is a
 * conversation rather than a checkout. Throws rather than returning a partial
 * object — a build that silently dropped the booking URL out of every
 * prerendered article is worse than a build that fails.
 */
export function readBooking() {
  const src = readFileSync(MARKETING, 'utf8')
  const block = src.match(/export const BOOKING = \{([\s\S]*?)\n\}/)
  if (!block) throw new Error('marketing.ts: BOOKING block not found')

  const field = (key) => {
    const m = block[1].match(new RegExp(`${key}:\\s*\n?\\s*(['"])([\\s\\S]*?)\\1,`))
    if (!m) throw new Error(`marketing.ts: BOOKING.${key} not found`)
    return m[2]
  }

  return {
    url: field('url'),
    label: field('label'),
    cta: field('cta'),
    headline: field('headline'),
    blurb: field('blurb'),
  }
}
