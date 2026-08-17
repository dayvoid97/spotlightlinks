import { Check, Minus } from 'lucide-react'
import clsx from 'clsx'
import {
  COMPARE_COLUMNS,
  COMPARE_ROWS,
  COMPARE_DISCLAIMER,
  type CompareCell,
} from '../../lib/marketing'

/**
 * Feature matrix: Spotlight Links vs. the tools businesses weigh it against
 * (Semrush, SimilarWeb, HubSpot, Profound). Data in src/lib/marketing.ts.
 * Scrolls horizontally on narrow screens so the table never breaks the page.
 */
export function ComparisonTable() {
  return (
    <div>
      <div className="border-line overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-line border-b">
              <th className="text-ink-50 w-56 px-4 py-4 text-left align-bottom text-xs font-medium uppercase tracking-wide">
                Feature
              </th>
              {COMPARE_COLUMNS.map((col) => (
                <th
                  key={col.name}
                  className={clsx(
                    'px-4 py-4 text-left align-bottom',
                    col.us && 'bg-brand-tint/50'
                  )}
                >
                  <div className={clsx('text-sm font-semibold', col.us ? 'text-brand' : 'text-ink')}>
                    {col.name}
                  </div>
                  <div className="text-ink-30 mt-1 text-[11px] font-normal leading-snug">
                    {col.tagline}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.feature} className="border-line border-b last:border-0">
                <td className="text-ink px-4 py-3 align-top text-[13px] font-medium">
                  {row.feature}
                </td>
                {row.cells.map((cell, i) => (
                  <td
                    key={i}
                    className={clsx(
                      'px-4 py-3 align-top',
                      COMPARE_COLUMNS[i]?.us && 'bg-brand-tint/40'
                    )}
                  >
                    <CellView cell={cell} highlight={Boolean(COMPARE_COLUMNS[i]?.us)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-ink-30 mt-3 text-xs leading-relaxed">{COMPARE_DISCLAIMER}</p>
    </div>
  )
}

function CellView({ cell, highlight }: { cell: CompareCell; highlight: boolean }) {
  if (cell.kind === 'yes') {
    return (
      <span className="flex items-center gap-1.5">
        <Check className={clsx('size-4 shrink-0', highlight ? 'text-brand' : 'text-emerald-500')} />
        {cell.note && <span className="text-ink-50 text-[11px]">{cell.note}</span>}
      </span>
    )
  }
  if (cell.kind === 'partial') {
    return (
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
        <span className="text-ink-50 text-[12px]">{cell.note}</span>
      </span>
    )
  }
  if (cell.kind === 'no') {
    return <Minus className="text-ink-30 size-4" />
  }
  return <span className={clsx('text-[12px]', highlight ? 'text-ink font-medium' : 'text-ink-50')}>{cell.text}</span>
}
