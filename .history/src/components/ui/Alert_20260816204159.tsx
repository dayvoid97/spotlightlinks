import type { ReactNode } from 'react'
import clsx from 'clsx'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

type Tone = 'info' | 'success' | 'warning' | 'error'

const config: Record<Tone, { icon: typeof Info; classes: string }> = {
  info: {
    icon: Info,
    classes: 'bg-cyan-50 border-cyan-200 text-cyan-800',
  },
  success: {
    icon: CheckCircle2,
    classes: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  error: {
    icon: XCircle,
    classes: 'bg-red-50 border-red-200 text-red-800',
  },
}

export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: Tone
  title?: string
  children: ReactNode
}) {
  const { icon: Icon, classes } = config[tone]
  return (
    <div className={clsx('flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm', classes)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        <div className="text-[13px] opacity-90">{children}</div>
      </div>
    </div>
  )
}
