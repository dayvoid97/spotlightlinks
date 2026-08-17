import type { ReactNode } from 'react'
import { Radar } from 'lucide-react'
const logo = 'logo.png'
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="bg-surface flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-brand size-19 mb-3 flex items-center justify-center rounded-xl">
            <img src={logo} alt="spotlight links logo" />
          </div>
          <h1 className="text-ink text-lg font-semibold">{title}</h1>
          {subtitle && <p className="text-ink-50 mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="border-line bg-surface-2/60 rounded-2xl border p-6 shadow-xl shadow-black/30 backdrop-blur-sm">
          {children}
        </div>
        {footer && <div className="text-ink-50 mt-5 text-center text-sm">{footer}</div>}
      </div>
    </div>
  )
}
