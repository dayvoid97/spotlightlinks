import type { ReactNode } from 'react'
import clsx from 'clsx'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

type Tone = 'info' | 'success' | 'warning' | 'error'

const config: Record<Tone, { icon: typeof Info; classes: string }> = {
  info: { icon: Info, classes: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200' },
  success: { icon: CheckCircle2, classes: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' },
  warning: { icon: AlertTriangle, classes: 'bg-amber-500/10 border-amber-500/30 text-amber-200' },
  error: { icon: XCircle, classes: 'bg-red-500/10 border-red-500/30 text-red-200' },
}

export function Alert({ tone = 'info', title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
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
