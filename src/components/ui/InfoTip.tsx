import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Info } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  /** Read aloud on the trigger, e.g. "What does the Decision intent mean?" */
  label: string
  children: ReactNode
  className?: string
}

/**
 * A small "what is this?" affordance.
 *
 * Opens on hover for mice, on focus for keyboards, and on click for touch —
 * a hover-only tooltip is invisible on a phone, which is where a fair share of
 * owners read their report. Escape closes it, and so does a click anywhere
 * outside, so it can never get stranded open over the row beneath it.
 */
export function InfoTip({ label, children, className }: Props) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span
      ref={wrapRef}
      className={clsx('relative inline-flex items-center', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-ink-30 hover:text-brand focus-visible:text-brand inline-flex shrink-0 items-center transition"
      >
        <Info className="size-3" />
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="border-line bg-surface text-ink-70 absolute bottom-full left-1/2 z-50 mb-1.5 w-64 -translate-x-1/2 rounded-lg border p-2.5 text-[12px] leading-relaxed font-normal normal-case tracking-normal shadow-lg"
        >
          {children}
        </span>
      )}
    </span>
  )
}
