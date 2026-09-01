import { useEffect, useState } from 'react'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

/**
 * Fired on this window when the visitor accepts or declines. Same-tab writes to
 * localStorage do not fire `storage`, so anything else that has to yield this
 * corner while the banner is up (BookDemoFab) has no other way to learn that it
 * is gone.
 */
export const CONSENT_EVENT = 'cookie-consent-set'

/** Whether the visitor has already answered the banner, either way. */
export function hasConsentChoice() {
  return Boolean(localStorage.getItem('cookie_consent'))
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setShowBanner(true)
    } else if (consent === 'granted' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      })
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted')
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      })
    }
    window.dispatchEvent(new Event(CONSENT_EVENT))
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'denied')
    window.dispatchEvent(new Event(CONSENT_EVENT))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-zinc-900 text-white p-4 rounded-lg shadow-xl border border-zinc-800 z-50 flex flex-col gap-3">
      <p className="text-sm text-zinc-300">
        We use cookies to analyze traffic and improve your experience. Choose whether you consent to
        analytics tracking.
      </p>
      <div className="flex justify-end gap-2 text-sm">
        <button
          onClick={handleDecline}
          className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
        >
          Accept All
        </button>
      </div>
    </div>
  )
}
