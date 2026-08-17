import { ShieldCheck, Zap, Link2 } from 'lucide-react'

export function TrustStrip() {
  const trustSignals = [
    {
      icon: ShieldCheck,
      title: 'AUDIT WITH AI ENGINES',
      subtitle: 'AEO & GEO Deep Analysis',
    },
    {
      icon: Zap,
      title: 'FULL CYCLE IN 10 MINS',
      subtitle: 'Real-time Execution Pipeline',
    },
    {
      icon: Link2,
      title: '100% VERIFIABLE SOURCES',
      subtitle: 'Every Claim Carries Direct Citation',
    },
  ]

  return (
    <section className="border-ink-border bg-ink-950/90 relative w-full border-y backdrop-blur-md overflow-hidden">
      {/* Top subtle Lambo Gold highlight line */}
      <div className="via-lambo-gold/40 absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="divide-ink-border grid grid-cols-1 divide-y md:grid-cols-3 md:divide-y-0 md:divide-x">
          {trustSignals.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="group hover:bg-ink-900/50 flex items-center justify-center gap-4 py-2.5 px-4 transition-all duration-300"
              >
                {/* Icon Container with Blood Red Glow */}
                <div className="bg-blood-900/40 border-blood-700/50 text-blood-glow group-hover:border-blood-500 relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-[0_0_12px_rgba(163,24,31,0.25)] group-hover:shadow-[0_0_18px_rgba(230,35,45,0.4)] transition-all duration-300">
                  <Icon className="h-5 w-5" />
                  {/* Yin/Yang subtle pulse dot */}
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="pulse-dot bg-lambo-gold inline-flex h-full w-full rounded-full opacity-75" />
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col text-left">
                  <span className="text-yang-white group-hover:text-lambo-gold text-xs font-bold tracking-widest uppercase font-mono transition-colors duration-200">
                    {item.title}
                  </span>
                  <span className="text-yang-muted/80 text-[11px] font-sans">{item.subtitle}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom subtle Crimson highlight line */}
      <div className="via-blood-700/30 absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent" />
    </section>
  )
}
