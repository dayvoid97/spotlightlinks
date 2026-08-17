import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutGrid, Trash2, CreditCard, UserCircle2, LogOut, Radar } from 'lucide-react'
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
    <div className="min-h-screen">
      <header className="border-line bg-surface/85 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-brand flex size-8 items-center justify-center rounded-lg">
              <img src={logo} />
            </div>
            <div className="leading-none">
              <p className="text-ink text-sm font-semibold">Spotlight Links</p>
              <p className="text-ink-50 text-[10px]">AI search visibility console</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
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

          <div className="ml-auto flex items-center gap-3">
            <EngineStatusPill />
            <ThemeToggle />
            <Link
              to="/profile"
              className="hover:bg-surface-2 text-ink-70 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm"
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
              className="hover:bg-surface-2 text-ink-50 hover:text-ink flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
        <nav className="border-line flex items-center gap-1 overflow-x-auto border-t px-4 py-1.5 sm:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                  isActive ? 'bg-brand text-white' : 'text-ink-50'
                )
              }
            >
              <item.icon className="size-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
