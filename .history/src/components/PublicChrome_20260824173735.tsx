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
          <nav className="mr-1 hidden items-center gap-4 md:flex">
            <Link to="/about" className="text-ink-50 hover:text-ink text-sm font-medium">
              About
            </Link>
            <Link to="/#pricing" className="text-ink-50 hover:text-ink text-sm font-medium">
              Pricing
            </Link>
            <Link to="/compare" className="text-ink-50 hover:text-ink text-sm font-medium">
              Compare
            </Link>
            <Link to="/blog" className="text-ink-50 hover:text-ink text-sm font-medium">
              Blog
            </Link>
          </nav>
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

const FOOTER_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/compare', label: 'Compare' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/blog', label: 'Blog' },
  { to: '/get-started', label: 'Get started' },
]

export function PublicFooter() {
  return (
    <footer className="border-line mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-ink-50 hover:text-ink font-medium">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="text-ink-30 border-line mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-xs">
          <span>© {new Date().getFullYear()} Spotlight Links LLC</span>
          <span>
            Answer Engine and Generative Engine Visibility Discovery &amp; Management Console
          </span>
        </div>
      </div>
    </footer>
  )
}
