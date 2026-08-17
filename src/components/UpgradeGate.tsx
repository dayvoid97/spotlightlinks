import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

/**
 * Shown in place of an action button when the backend would reject it with
 * 403 UPGRADE_REQUIRED (facts harvesting and asset building are both gated
 * to the Enterprise Suite plan — see facts.routes.ts / assets.routes.ts).
 * Purely a UX shortcut: the real gate is server-side, this just avoids a
 * guaranteed-to-fail round trip.
 */
export function UpgradeGate({ feature }: { feature: string }) {
  return (
    <Link
      to="/billing"
      className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
    >
      <Lock className="size-3.5" /> Upgrade to Enterprise for {feature}
    </Link>
  )
}
