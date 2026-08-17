import type { ReactNode } from 'react'
import { Radar } from 'lucide-react'

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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand">
            <Radar className="size-5.5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-50">{subtitle}</p>}
        </div>
        <div className="rounded-2xl border border-line bg-surface-2/60 p-6 shadow-xl shadow-black/30 backdrop-blur-sm">
          {children}
        </div>
        {footer && <div className="mt-5 text-center text-sm text-ink-50">{footer}</div>}
      </div>
    </div>
  )
}
