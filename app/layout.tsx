import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Spotlight Links | Let us Spotlight your business',
  description:
    'Spotlight Links partners with founders to conceptualize projects, engineer high-performance software, manage deployments, and scale digital business infrastructure.',
  metadataBase: new URL('https://spotlightlinks.com'),
  keywords: [
    'Business Conceptualization',
    'Full-Stack Web Development',
    'Mobile App Engineering',
    'Cloud Architecture Deployment',
    'Digital Business Formation',
    'Next.js Development',
    'Solana Tokenomics & DeFi Architecture',
  ],
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Spotlight Links',
    url: 'https://spotlightlinks.com',
    logo: 'https://spotlightlinks.com/spotlight-links-card-front.png',
    description:
      'An end-to-end digital venture studio accelerating project conceptualization, custom full-stack software development, cloud infrastructure deployment, and online business formation.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@spotlightlinks.com', // Update to your official email
    },
    knowsAbout: [
      'Project Conceptualization',
      'Full-Stack Software Engineering',
      'Next.js & React Native Production',
      'AWS, Firebase, and Supabase Deployments',
      'Blockchain-Native Capital Formation & Tokenomics',
      'Digital Business Legal & Structural Setup',
    ],
  }
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body>
        <Navbar />

        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
        <Footer />
      </body>
    </html>
  )
}
