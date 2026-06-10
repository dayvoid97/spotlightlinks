'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface Client {
  name: string
  logo: string
  description?: string
  industry?: string
  tier?: 'enterprise' | 'growth' | 'startup'
}

const clients: Client[] = [
  {
    name: 'Onydubs.fun',
    logo: '/onlydubs-logo.png',
    description: 'OnlyDubs X Spotlight Links to bring content monetization solutions ',
    industry: 'Internet',
    tier: 'enterprise',
  },
  {
    name: 'Bergen Wholesale',
    logo: '/bergen-wholesale-logo.png',
    description:
      'Spotlight Links built Bergen Wholesale Official Website and Ecommerce platform helping bring Wholesale Scale to average joes.',
    industry: 'Advertising',
    tier: 'growth',
  },
  {
    name: 'Precision Vision NJ',
    logo: '/precision-vision-nj-logo.png',
    description: 'Onboarded Precision Vision NJ, a legacy, 40+ years operational business online.',
    industry: 'Retail',
    tier: 'growth',
  },
  {
    name: 'Open Sesame Garages',
    logo: '/open-sesame-garages-logo.png',
    description:
      'Opened doors for Open Sesame Garages -  An OKC based garage and door servicing company.',
    industry: 'Media',
    tier: 'startup',
  },
]

const tierStyles = {
  enterprise: 'border-white/20 bg-white/5',
  growth: 'border-white/10 bg-white/5',
  startup: 'border-white/5 bg-white/0',
}

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="uppercase text-4xl md:text-6xl font-semibold tracking-tight">Clients</h1>
          <p className="text-white/60 mt-4">
            Spotlight Links builds media, advertising, and infrastructure systems for companies at
            every scale.
          </p>
          <p className="mt-4">Review some of our customers. HINT: You can google em'</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {clients.map((client, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl border backdrop-blur-md p-5 flex flex-col gap-4 transition-all hover:border-white/30 ${
                tierStyles[client.tier || 'startup']
              }`}
            >
              <div className="relative w-full h-14 flex items-center justify-center">
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={120}
                  height={60}
                  className="object-contain opacity-80 hover:opacity-100 transition"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium">{client.name}</h3>
                {client.description && (
                  <p className="text-xs text-white/60">{client.description}</p>
                )}
                {client.industry && (
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    {client.industry}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
