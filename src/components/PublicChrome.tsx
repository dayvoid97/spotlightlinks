import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { BrandLockup } from './BrandLockup'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/Button'

/**
 * Header/footer shared by the public marketing surfaces (the blog). Mirrors
 * the homepage's own header so bouncing between /, /blog and an article feels
 * like one site. Auth-aware: the CTA points returning users at the dashboard.
 */
export function PublicHeader() {
  const { user, loading } = useAuth()
  return (
    <header className="border-line bg-surface/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <BrandLockup />
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link to="/blog" className="text-ink-50 hover:text-ink hidden text-sm font-medium sm:block">
            Blog
          </Link>
          <ThemeToggle />
          {!loading && !user && (
            <Link
              to="/login"
              className="text-ink-50 hover:text-ink whitespace-nowrap text-sm font-medium"
            >
              Log in
            </Link>
          )}
          <Link to={user ? '/dashboard' : '/get-started'}>
            <Button size="sm">{user ? 'Dashboard' : 'Get started'}</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-line mt-16 border-t">
      <div className="text-ink-30 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs sm:px-6">
        <span>© {new Date().getFullYear()} Spotlight Links LLC</span>
        <span>Answer Engine and Generative Engine Visibility Discovery &amp; Management Console</span>
      </div>
    </footer>
  )
}
