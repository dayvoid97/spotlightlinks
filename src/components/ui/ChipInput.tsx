import { useState, type KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import clsx from 'clsx'

/**
 * A list of short strings edited as removable chips.
 *
 * Replaces the comma-separated text inputs the intake form used for
 * competitors, categories, and highlights. Those asked someone to maintain
 * punctuation in a single-line box — you could not see how many items you had,
 * removing the middle one meant careful cursor work, and a trailing comma
 * silently produced an empty entry. Chips make the list legible and each entry
 * individually removable, which is what makes the "did we get these right?"
 * review on /get-started answerable at a glance.
 *
 * Deliberately presentational: it speaks `string[]`, and the form owns the
 * comma-joined storage format the draft and the Intake payload use.
 */
interface ChipInputProps {
  id?: string
  items: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  addLabel?: string
  /** Visually flags the box as something still worth filling in. */
  highlightEmpty?: boolean
}

export function ChipInput({
  id,
  items,
  onChange,
  placeholder,
  addLabel = 'Add',
  highlightEmpty = false,
}: ChipInputProps) {
  const [draft, setDraft] = useState('')

  function commit(raw: string) {
    // Someone pasting "Starbucks, Local Grind" means two chips, not one.
    const added = raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
    if (added.length === 0) return

    const seen = new Set(items.map((i) => i.toLowerCase()))
    const next = [...items]
    for (const entry of added) {
      if (seen.has(entry.toLowerCase())) continue
      seen.add(entry.toLowerCase())
      next.push(entry)
    }
    setDraft('')
    if (next.length !== items.length) onChange(next)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      // Enter in a bare text input would otherwise submit the whole form —
      // someone adding their third competitor would land on the sign-up
      // prompt instead.
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && draft === '' && items.length > 0) {
      onChange(items.slice(0, -1))
    }
  }

  const empty = items.length === 0

  return (
    <div>
      {!empty && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li key={item}>
              <span className="border-line bg-surface text-ink inline-flex items-center gap-1 rounded-full border py-1 pl-3 pr-1.5 text-xs font-medium">
                {item}
                <button
                  type="button"
                  onClick={() => onChange(items.filter((i) => i !== item))}
                  aria-label={`Remove ${item}`}
                  className="text-ink-30 hover:bg-surface-2 hover:text-brand rounded-full p-0.5 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          // Anything typed but never "added" would otherwise vanish on submit.
          onBlur={() => commit(draft)}
          placeholder={placeholder}
          className={clsx(
            'text-ink placeholder:text-ink-30 focus:border-brand/60 focus:ring-brand/20 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2',
            empty && highlightEmpty
              ? 'border-brand/40 bg-brand-tint/40 border-dashed'
              : 'border-line bg-surface-2'
          )}
        />
        <button
          type="button"
          onClick={() => commit(draft)}
          disabled={draft.trim() === ''}
          className="border-line bg-surface-2 text-ink hover:border-ink-30 inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-40"
        >
          <Plus className="size-3.5" />
          {addLabel}
        </button>
      </div>
    </div>
  )
}
