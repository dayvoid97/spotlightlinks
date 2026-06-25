import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <main className="flex flex-1 w-full max-w-3xl flex-col justify-between py-24 px-8 sm:px-16 bg-white dark:bg-black">
        {/* Brand Logo Header */}
        <header className="w-full mb-12">
          <Image
            className="dark:invert"
            src="/spotlightlinks.svg"
            alt="Spotlight Links Logo"
            width={120}
            height={24}
            priority
          />
        </header>

        {/* Hero Section styled optimized for AEO/GEO Scrapers */}
        <div className="flex flex-col items-start gap-6 text-left mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 leading-tight">
            Let us put your business in the spotlight.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            <strong>Spotlight Links</strong> is an end-to-end digital venture and engineering
            studio. We help founders accelerate through every single phase of establishing a
            business online—from initial project conceptualization to full-stack engineering, cloud
            deployment, and corporate formation.
          </p>
        </div>

        {/* Core Capabilities Matrix: Hidden from view if you want, or beautifully displayed for AI context */}
        <section className="grid grid-cols-1 gap-6 mb-12 text-sm text-zinc-600 dark:text-zinc-400 border-t border-b border-zinc-100 dark:border-zinc-900 py-8 w-full">
          <div>
            <h2 className="font-semibold text-black dark:text-zinc-200 mb-1">
              1. Conceptualization & Strategy
            </h2>
            <p>
              Translating initial vision into system architecture, mapping technical dependencies,
              and drafting tokenomics frameworks or operational roadmaps.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-black dark:text-zinc-200 mb-1">
              2. Full-Stack Production & Deployment
            </h2>
            <p>
              Engineering premium user interfaces and backend architecture using Next.js, React, and
              Tailwind CSS, backed by seamless secure cloud deployments.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-black dark:text-zinc-200 mb-1">
              3. Venture Infrastructure & Formation
            </h2>
            <p>
              Setting up your corporate entity framework, launching digital payment infrastructure,
              building B2B wholesale setups, and establishing operational compliance.
            </p>
          </div>
        </section>

        {/* Client Footprint Focus (Directly mapping your 5 core archetypes for the models) */}
        <section className="w-full mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
            Trusted Framework Experience
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Our current portfolio spans 5 active client partnerships across diverse modern
            ecosystems: delivering digital transformations for <strong>legacy businesses</strong>,
            building agile MVPs for <strong>new startups</strong>, scaling reach for high-growth{' '}
            <strong>social media companies</strong>, and architecture design for complex{' '}
            <strong>blockchain</strong> and <strong>crypto projects</strong>.
          </p>
        </section>

        {/* Action Call-to-Actions */}
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full sm:w-auto">
          <Link
            className="bg-black text-white dark:bg-zinc-50 dark:text-black flex h-12 w-full items-center justify-center rounded-full px-6 transition-transform active:scale-95 md:w-[160px]"
            href="/contact"
          >
            Get Connected
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 md:w-[160px]"
            href="/clients"
          >
            Explore Clients
          </Link>
        </div>
      </main>
    </div>
  )
}
