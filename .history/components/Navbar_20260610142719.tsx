'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const linkClass = (path: string) =>
    `text-sm font-medium transition ${
      pathname === path ? 'text-white' : 'text-white/60 hover:text-white'
    }`

  return (
    <nav className="justify-left  w-full flex items-center px-6 py-5 bg-black text-white border-b border-white/10">
      {/* Brand */}
      <a href="/">
        <div className="text-4xl font-semibold tracking-tight">Spotlight Links</div>
      </a>

      {/* Links */}
      <div className="flex gap-6">
        <Link href="/clients" className={linkClass('/clients')}>
          Clients
        </Link>
        <Link href="/contact" className={linkClass('/contact')}>
          Contact
        </Link>
      </div>
    </nav>
  )
}
