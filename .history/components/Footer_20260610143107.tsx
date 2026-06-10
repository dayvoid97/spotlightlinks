export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand */}
        <div className="text-sm font-medium tracking-tight">Spotlight Links</div>

        {/* Center: Links */}
        <div className="flex gap-6 text-sm text-white/60">
          <a href="/" className="hover:text-white transition">
            Home
          </a>
          <a href="/clients" className="hover:text-white transition">
            Clients
          </a>
          <a href="/contact" className="hover:text-white transition">
            Contact
          </a>
        </div>

        {/* Right: Legal */}
        <div className="text-xs text-white/40 text-center md:text-right">
          © {new Date().getFullYear()} Spotlight Links. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
