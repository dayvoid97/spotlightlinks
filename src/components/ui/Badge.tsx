import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'violet'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-70 border-line',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/10 text-red-400 border-red-500/30',
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  violet: 'bg-brand-tint text-brand border-brand',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        toneClasses[tone],
        className
      )}
      {...rest}
    />
  )
}
