import { useEffect } from 'react'

/**
 * Keeps `<title>` and `<meta name="description">` in step with the current route
 * during client-side navigation.
 *
 * The indexed values come from `scripts/prerender.mjs`, which bakes the right
 * head tags into a static file per route — crawlers never need this hook. What
 * it fixes is the browser: once React takes over, moving from /blog to an
 * article leaves the tab, the history entry, and any bookmark still reading the
 * previously loaded page's title. Setting it here means a tab, a bookmark, and
 * Google all say the same thing.
 *
 * Deliberately no cleanup on unmount: the next route sets its own values, and
 * restoring the previous title in between only causes a flicker.
 */
export function useDocumentHead(title: string | null, description?: string | null) {
  useEffect(() => {
    if (title) document.title = title
  }, [title])

  useEffect(() => {
    if (!description) return
    const tag = document.querySelector('meta[name="description"]')
    if (tag) tag.setAttribute('content', description)
  }, [description])
}
