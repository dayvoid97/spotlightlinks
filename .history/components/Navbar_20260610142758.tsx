'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const linkClass = (path: string) =>
    `text-sm font-medium transition ${
      pathname === path ? 'text-white' : 'text-white hover:text-white'
    }`

  return (
    <nav className="w-full flex  justify-between px-6 py-5 bg-black text-white border-b ">
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
