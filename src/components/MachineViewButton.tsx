import { useLocation } from 'react-router-dom'
import { Bot, X } from 'lucide-react'
import clsx from 'clsx'
import { useBlogReaderMode } from '../context/blog-reader-context'

/**
 * The machine-readable (markdown) view is an AI-crawler affordance, not a
 * feature humans came here for — so it lives as one small pill pinned to the
 * bottom-left corner of the public site rather than a mode switch sitting in
 * the header of every page.
 *
 * Bottom-LEFT on purpose: bottom-right is taken — by the cookie banner
 * (ConsentBanner), and on the blog by the booking button (BookDemoFab).
 */

/** Public marketing surfaces only — never over the signed-in console or auth. */
const MACHINE_VIEW_ROUTES = [/^\/$/, /^\/about$/, /^\/compare$/, /^\/blog(\/|$)/, /^\/get-started$/]

export function MachineViewButton() {
  const { pathname } = useLocation()
  const { isMachine, setMode } = useBlogReaderMode()

  if (!MACHINE_VIEW_ROUTES.some((re) => re.test(pathname))) return null

  return (
    <button
      type="button"
      onClick={() => setMode(isMachine ? 'human' : 'machine')}
      title={
        isMachine
          ? 'Back to the normal site'
          : 'Machine-readable view — plain markdown for AI agents and crawlers'
      }
      aria-pressed={isMachine}
      aria-label={isMachine ? 'Exit machine-readable view' : 'Switch to machine-readable view'}
      className={clsx(
        'fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-full border px-2.5 py-1.5',
        'text-[11px] font-medium shadow-sm backdrop-blur transition',
        'opacity-60 hover:opacity-100 focus-visible:opacity-100',
        isMachine
          ? 'border-brand bg-brand text-white opacity-100'
          : 'border-line bg-surface/90 text-ink-50 hover:text-ink'
      )}
    >
      {isMachine ? <X className="size-3.5" /> : <Bot className="size-3.5" />}
      <span className="font-mono">{isMachine ? 'exit' : '.md'}</span>
    </button>
  )
}
