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
    <Link to="/" className={clsx('flex items-center gap-2.5', className)}>
      <img
        src="/logo.png"
        alt="Spotlight Links"
        className="size-10 shrink-0 object-contain"
      />
      <span className="flex flex-col justify-center leading-tight">
        <span className="text-ink text-base font-semibold">Spotlight Links</span>
        <span className="text-ink-50 text-xs">Let us spotlight your business</span>
      </span>
    </Link>
  )
}
