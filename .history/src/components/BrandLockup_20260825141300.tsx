import { Link } from 'react-router-dom'
import clsx from 'clsx'

/**
 * The Spotlight Links brand lockup: a tight two-column row —
 *   [ logo ] | [ title (top) / subtitle (bottom) ]
 *
 * Shared by every public header (homepage, blog, get-started) so the spacing
 * and alignment stay identical everywhere. The two text rows are stacked in a
 * single flex column with tight leading, sitting right next to the logo with a
 * small fixed gap — no stray line breaks or centering wrappers adding width.
 */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <Link to="/" className={clsx('flex min-w-0 items-center gap-2.5', className)}>
      <img
        src="/logo.png"
        alt="Spotlight Links"
        className="size-9 shrink-0 object-contain sm:size-10"
      />
      <span className="flex min-w-0 flex-col justify-center leading-tight">
        <span className="text-ink truncate text-base font-semibold">Spotlight Links</span>
        {/* Subtitle is a nicety — drop it on narrow screens so the header stays one clean line. */}
        <span className="text-ink-50 hidden truncate text-xs sm:block">
          Let us spotlight your business
        </span>
      </span>
    </Link>
  )
}
