/**
 * Streams a Server-Sent-Events response from a POST endpoint.
 *
 * xsl-backend's probe endpoints (POST /api/probe/run and
 * POST /api/portal/clients/:slug/probe, both implemented by the shared
 * runProbeCycleSSE in xsl-backend/src/lib/runProbeCycle.ts) write
 * `event: <name>\ndata: <json>\n\n` frames directly onto the HTTP response
 * as the cycle progresses — it can legitimately stay open for the full
 * 10+ minutes a probe cycle takes to run all engines × prompts × locales.
 *
 * The browser's built-in `EventSource` only issues GET requests and this
 * route is a POST (it needs a JSON body — slug, engine selection, run
 * count), so EventSource is not an option here. Instead this reads the
 * `fetch` response body as a stream and parses the `event:`/`data:` frames
 * by hand. This is the standard workaround for POST-based SSE and is what
 * keeps the connection open for the full run without any polling.
 */

import { API_BASE_URL } from './api'

export type SSEHandler = (event: string, data: any) => void

export interface StreamSSEOptions {
  path: string
  body: unknown
  onEvent: SSEHandler
  signal?: AbortSignal
}

export async function streamSSE({ path, body, onEvent, signal }: StreamSSEOptions): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    // Errors here (401, 403, 429, 400) arrive as a plain JSON body, not an
    // SSE stream — the route rejects before ever calling res.setHeader for
    // text/event-stream. Surface it the same way api.ts does.
    let message = res.statusText || 'Probe request failed'
    let code: string | undefined
    try {
      const data = await res.json()
      message = data.error || message
      code = data.code
    } catch {
      /* body wasn't JSON either; fall back to statusText */
    }
    onEvent('error', { message, code })
    return
  }

  if (!res.body) {
    onEvent('error', { message: 'Streaming is not supported by this browser/response.' })
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE frames are separated by a blank line.
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)

      let eventName = 'message'
      let dataLines: string[] = []
      for (const line of frame.split('\n')) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim())
        }
      }

      if (dataLines.length > 0) {
        try {
          onEvent(eventName, JSON.parse(dataLines.join('\n')))
        } catch {
          onEvent(eventName, dataLines.join('\n'))
        }
      }

      boundary = buffer.indexOf('\n\n')
    }
  }
}
