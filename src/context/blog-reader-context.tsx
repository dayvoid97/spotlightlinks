import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useSearchParams } from 'react-router-dom'

export type BlogReaderMode = 'human' | 'machine'

interface BlogReaderContextValue {
  mode: BlogReaderMode
  isMachine: boolean
  /** True when machine mode was chosen for us (crawler UA or ?mode=machine), not by a click. */
  isAutoMachine: boolean
  setMode: (mode: BlogReaderMode) => void
  toggleMode: () => void
}

const BlogReaderContext = createContext<BlogReaderContextValue | null>(null)

/**
 * User agents that either are answer-engine crawlers or are a model fetching a
 * page on a user's behalf. They get the markdown view automatically; everyone
 * else gets the designed page unless they ask for machine view themselves.
 *
 * Note this is a best-effort assist, not the primary machine-readable channel:
 * most of these crawlers never execute our JS, so they are actually served by
 * /llms.txt, the raw /blog/*.md files, the JSON-LD in index.html, and the
 * <link rel="alternate" type="text/markdown"> hints. This branch only catches
 * the agents that do run JS.
 */
const BOT_UA =
  /bot|crawler|spider|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-user|claude-searchbot|anthropic-ai|perplexitybot|perplexity-user|google-extended|googleother|bingbot|applebot|duckassistbot|amazonbot|meta-externalagent|ccbot|bytespider|diffbot|cohere-ai|youbot|semrushbot|ahrefsbot|headlesschrome/i

function isMachineAgent(): boolean {
  if (typeof navigator === 'undefined') return false
  try {
    if (navigator.webdriver) return true
    return BOT_UA.test(navigator.userAgent)
  } catch {
    return false
  }
}

export function BlogReaderProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')

  /**
   * Deliberately NOT persisted to localStorage. It used to be, which meant a
   * single curious click left every future visit — and every future page —
   * rendering as raw markdown. A human's toggle now lasts for the browsing
   * session only; a reload returns to the real site.
   */
  const [chosenMode, setChosenMode] = useState<BlogReaderMode | null>(null)
  const [agentIsMachine] = useState(isMachineAgent)

  // Precedence: explicit ?mode= param → in-session click → crawler sniffing → human.
  const mode: BlogReaderMode =
    modeParam === 'machine'
      ? 'machine'
      : modeParam === 'human'
        ? 'human'
        : (chosenMode ?? (agentIsMachine ? 'machine' : 'human'))

  const isAutoMachine = mode === 'machine' && chosenMode !== 'machine'

  const setMode = useCallback(
    (newMode: BlogReaderMode) => {
      setChosenMode(newMode)
      const newParams = new URLSearchParams(searchParams)
      if (newMode === 'machine') newParams.set('mode', 'machine')
      else newParams.delete('mode')
      setSearchParams(newParams, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const toggleMode = useCallback(() => {
    setMode(mode === 'machine' ? 'human' : 'machine')
  }, [mode, setMode])

  const value = useMemo(
    () => ({ mode, isMachine: mode === 'machine', isAutoMachine, setMode, toggleMode }),
    [mode, isAutoMachine, setMode, toggleMode]
  )

  return <BlogReaderContext.Provider value={value}>{children}</BlogReaderContext.Provider>
}

export function useBlogReaderMode() {
  const ctx = useContext(BlogReaderContext)
  if (!ctx) {
    // Graceful fallback if context isn't wrapped
    return {
      mode: 'human' as BlogReaderMode,
      isMachine: false,
      isAutoMachine: false,
      setMode: () => {},
      toggleMode: () => {},
    }
  }
  return ctx
}
