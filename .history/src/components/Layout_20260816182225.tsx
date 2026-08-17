import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutGrid, Trash2, CreditCard, UserCircle2, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/auth-context'
import { EngineStatusPill } from './EngineStatusPill'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/subdued', label: 'Subdued', icon: Trash2 },
  { to: '/billing', label: 'Billing', icon: CreditCard },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const logo = 'logo.png'

  return (
    <div className="bg-surface min-h-screen">
      <header className="border-line bg-surface/85 sticky top-0 z-40 border-b backdrop-blur">
        <div className="h-29 mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6">
          {/* Brand */}
          <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <div className="bg-brand flex size-8 items-center justify-center rounded-lg">
              <img src={logo} alt="Spotlight Links" className="size-full object-contain" />
            </div>

            <div className="hidden leading-none sm:block">
              <p className="text-ink text-sm font-semibold tracking-tight">Spotlight Links</p>
              <p className="text-ink-50 mt-0.5 text-[10px]">AI search visibility console</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-0.5 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition',
                    isActive
                      ? 'bg-brand text-white'
                      : 'hover:bg-surface-2 text-ink-50 hover:text-ink'
                  )
                }
              >
                <item.icon className="size-3.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="ml-auto flex items-center gap-1">
            <EngineStatusPill />

            <ThemeToggle />

            <Link
              to="/profile"
              className="hover:bg-surface-2 text-ink-70 ml-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] transition"
            >
              <UserCircle2 className="size-4" />

              <span className="hidden max-w-[140px] truncate sm:inline">
                {user?.name || user?.email}
              </span>
            </Link>

            <button
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
              className="hover:bg-surface-2 text-ink-50 hover:text-ink flex items-center justify-center rounded-md p-2 transition"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="border-line flex items-center gap-1 overflow-x-auto border-t px-4 py-1.5 sm:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition',
                  isActive ? 'bg-brand text-white' : 'text-ink-50 hover:bg-surface-2 hover:text-ink'
                )
              }
            >
              <item.icon className="size-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
        <Outlet />
      </main>
    </div>
  )
}
