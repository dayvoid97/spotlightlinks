'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface Client {
  name: string
  logo: string
  description?: string
  industry?: string
  tier?: 'enterprise' | 'growth' | 'startup' | 'smallbusiness'
}

const clients: Client[] = [
  {
    name: 'OnlyDubs.fun',
    logo: '/public/onlydubs-logo.png',
    description:
      'Ongoing partnership between Onlydubs and Spotlight Links to bring content monetization solutions. Learn more on onlydubs website.',
    industry: 'Internet',
    tier: 'startup',
  },
  {
    name: 'Open Sesame Doors',
    logo: '/clients/client2.png',
    description: 'Performance advertising systems',
    industry: 'Advertising',
    tier: 'small business',
  },
  {
    name: 'Precision Vision NJ',
    logo: '/clients/client3.png',
    description: 'Backend infrastructure scaling',
    industry: 'Technology',
    tier: 'small business',
  },
  {
    name: 'Bergen Wholesale LLC',
    logo: '/clients/client4.png',
    description: 'Creator monetization platform',
    industry: 'Media',
    tier: 'enterprise',
  },
  {
    name: 'Strum  - Lets Vibe Together',
    logo: '/clients/client5.png',
    description: 'Ad analytics + tracking systems',
    industry: 'Advertising',
    tier: 'startup',
  },
  {
    name: 'Client Six',
    logo: '/clients/client6.png',
    description: 'Cloud infrastructure optimization',
    industry: 'Technology',
    tier: 'enterprise',
  },
]

const tierStyles = {
  enterprise: 'border-white/20 bg-white/5',
  growth: 'border-white/10 bg-white/5',
  startup: 'border-white/5 bg-white/0',
  smallbusiness: 'border-white/5 bg-white/0',
}

export default function Clients() {
  return (
    <section className="w-full py-24 px-6 bg-black text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Trusted by clients across media, advertising & infrastructure
          </h2>
          <p className="text-white/60 mt-4 text-sm md:text-base">
            Spotlight Links builds systems that scale — from startups to enterprise-grade platforms.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {clients.map((client, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl border backdrop-blur-md p-5 flex flex-col gap-4 hover:border-white/30 transition-all ${
                tierStyles[client.tier || 'startup']
              }`}
            >
              {/* Logo */}
              <div className="relative w-full h-14 flex items-center justify-center">
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={120}
                  height={60}
                  className="object-contain opacity-80 hover:opacity-100 transition"
                />
              </div>

              {/* Info */}
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
    </section>
  )
}
