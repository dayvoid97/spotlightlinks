import { type ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

// Primary and danger sit on a solid colored fill, so their label stays white
// in both themes — that's not a theme token, it's white-on-brand contrast.
// Secondary and ghost sit on the page surface and use semantic ink tones so
// they adapt with the theme.
const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand text-white shadow-sm hover:bg-brand-dark disabled:opacity-60',
  secondary: 'bg-surface-2 text-ink border border-line hover:border-ink-30',
  ghost: 'bg-transparent text-ink-70 hover:bg-surface-2 hover:text-ink',
  danger: 'bg-red-600 text-white hover:bg-red-500',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-md',
  md: 'text-sm px-3.5 py-2 gap-2 rounded-lg',
  lg: 'text-sm px-5 py-2.5 gap-2 rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...rest}
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
