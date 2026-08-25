/**
 * Global light / dark / system theme control.
 *
 * How the switch actually recolors the app: the whole design system in
 * src/index.css is built on semantic CSS variables (--color-surface,
 * --color-ink, --color-line, …). Dark mode just re-points those same
 * variables under a `data-theme` attribute on <html>. So this provider's
 * entire job is to set/clear that one attribute — the CSS does the rest, and
 * every element reading a var(--color-*) recolors instantly.
 *
 * Three stored states:
 *   'light'  → data-theme="light" (forced)
 *   'dark'   → data-theme="dark"  (forced)
 *   'system' → attribute removed; index.css's prefers-color-scheme media
 *              query takes over and follows the OS.
 *
 * The initial attribute for 'light'/'dark' is also set by a tiny inline
 * script in index.html *before* React mounts, so there's no flash of the
 * wrong theme on first paint. This provider re-applies it on mount to stay
 * the source of truth, and keeps it in sync afterward.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeChoice = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

interface ThemeContextValue {
  /** The user's stored preference, including 'system'. */
  theme: ThemeChoice
  /** What's actually on screen right now — 'system' resolved against the OS. */
  resolvedTheme: ResolvedTheme
  setTheme: (choice: ThemeChoice) => void
  /** Flip between light and dark based on what's currently showing. */
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStored(): ThemeChoice {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* localStorage can throw in private mode / sandboxed frames — fall through */
  }
  return 'system'
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyAttribute(choice: ThemeChoice) {
  const root = document.documentElement
  if (choice === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', choice)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(readStored)
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark)

  // Track OS preference changes so resolvedTheme stays correct while in 'system'.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  // Keep the DOM attribute and persisted value in lockstep with state.
  useEffect(() => {
    applyAttribute(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore persistence failures */
    }
  }, [theme])

  const resolvedTheme: ResolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  const setTheme = useCallback((choice: ThemeChoice) => setThemeState(choice), [])

  const toggle = useCallback(() => {
    // Flip to the opposite of whatever is currently showing, and make it explicit.
    setThemeState(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
