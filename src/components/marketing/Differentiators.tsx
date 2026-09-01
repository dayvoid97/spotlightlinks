import { Target, Wallet, MapPin, BarChart3 } from 'lucide-react'
import { DIFFERENTIATORS } from '../../lib/marketing'

const icons = [Target, Wallet, MapPin, BarChart3]

/** The four "why we're different" cards. Used on the homepage teaser and /compare. */
export function Differentiators() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {DIFFERENTIATORS.map((d, i) => {
        const Icon = icons[i % icons.length]
        return (
          <div key={d.title} className="border-line bg-surface rounded-2xl border p-5">
            <div className="bg-brand-tint text-brand flex size-9 items-center justify-center rounded-lg">
              <Icon className="size-4.5" />
            </div>
            <h3 className="text-ink mt-3 text-base font-bold">{d.title}</h3>
            <p className="text-ink-50 mt-1.5 text-sm leading-relaxed">{d.body}</p>
          </div>
        )
      })}
    </div>
  )
}
