import { Moon, Sun } from 'lucide-react'
import clsx from 'clsx'
import { useTheme } from '../context/theme-context'

/**
 * Light/dark flip button. Styled with the app's semantic design tokens
 * (border-line, bg-surface-2, text-ink…) rather than fixed colors, so the
 * control itself looks correct in whichever theme it's switching between.
 *
 * Clicking always sets an explicit choice (light or dark) — the "system"
 * default only applies until the user first expresses a preference, which is
 * the conventional behavior. See src/context/theme-context.tsx.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggle } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg border border-line bg-surface-2 p-2 text-ink-50 transition hover:border-ink-30 hover:text-ink',
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
