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
    name: 'Onydubs.fin',
    logo: '/onlydubs-logo.png',
    description: 'Enterprise media infrastructure buildout',
    industry: 'Media',
    tier: 'enterprise',
  },
  {
    name: 'Client Two',
    logo: '/clients/client2.png',
    description: 'Performance advertising systems',
    industry: 'Advertising',
    tier: 'growth',
  },
  {
    name: 'Client Three',
    logo: '/clients/client3.png',
    description: 'Backend infrastructure scaling',
    industry: 'Technology',
    tier: 'enterprise',
  },
  {
    name: 'Client Four',
    logo: '/clients/client4.png',
    description: 'Creator monetization platform',
    industry: 'Media',
    tier: 'startup',
  },
  {
    name: 'Client Five',
    logo: '/clients/client5.png',
    description: 'Ad analytics + tracking systems',
    industry: 'Advertising',
    tier: 'growth',
  },
  {
    name: 'Client Six',
    logo: '/clients/client6.png',
    description: 'Cloud infrastructure optimization',
    industry: 'Technology',
    tier: 'enterprise',
  },
  {
    name: 'Client Seven',
    logo: '/clients/client7.png',
    description: 'Brand media distribution engine',
    industry: 'Media',
    tier: 'growth',
  },
  {
    name: 'Client Eight',
    logo: '/clients/client8.png',
    description: 'Full-stack product engineering',
    industry: 'Technology',
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
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">Clients</h1>
          <p className="text-white/60 mt-4">
            Spotlight Links builds media, advertising, and infrastructure systems for companies at
            every scale.
          </p>
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
