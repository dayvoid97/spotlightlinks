import { type InputHTMLAttributes, type TextareaHTMLAttributes, type LabelHTMLAttributes, type SelectHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

export function Label({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx('mb-1.5 block text-xs font-medium text-ink-50', className)}
      {...rest}
    />
  )
}

const fieldClasses =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-ink-30 outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/20 disabled:opacity-50'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} className={clsx(fieldClasses, className)} {...rest} />
  )
)
Input.displayName = 'Input'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...rest }, ref) => (
    <select ref={ref} className={clsx(fieldClasses, className)} {...rest} />
  )
)
Select.displayName = 'Select'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => (
    <textarea ref={ref} className={clsx(fieldClasses, 'resize-y', className)} {...rest} />
  )
)
Textarea.displayName = 'Textarea'

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null
  return <p className="mt-1.5 text-xs text-red-400">{children}</p>
}
