import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutGrid, Trash2, CreditCard, UserCircle2, LogOut, Radar } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/auth-context'
import { EngineStatusPill } from './EngineStatusPill'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/subdued', label: 'Subdued', icon: Trash2 },
  { to: '/billing', label: 'Billing', icon: CreditCard },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-ink-border bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg gradient-bar">
              <Radar className="size-4.5 text-white" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-semibold text-white">Quasar Probe</p>
              <p className="text-[10px] text-gray-500">AI search visibility console</p>
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
                    isActive ? 'bg-ink-700 text-white' : 'text-gray-400 hover:bg-ink-800 hover:text-gray-200'
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
            <Link
              to="/profile"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-300 hover:bg-ink-800"
            >
              <UserCircle2 className="size-4" />
              <span className="hidden max-w-[140px] truncate sm:inline">{user?.name || user?.email}</span>
            </Link>
            <button
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 hover:bg-ink-800 hover:text-gray-200"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-ink-border px-4 py-1.5 sm:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                  isActive ? 'bg-ink-700 text-white' : 'text-gray-400'
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
