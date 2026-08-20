import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { fetchBlogPosts } from '../lib/blog'
import { BlogCard } from '../components/BlogCard'
import { PublicHeader, PublicFooter } from '../components/PublicChrome'
import { Spinner } from '../components/ui/Spinner'
import { useBlogReaderMode } from '../context/blog-reader-context'
import { MachinePageView, type PageMachineMetadata } from '../components/MachinePageView'

const MAX_PILLS = 8

/**
 * Public blog index (route "/blog"). Supports dual Human and Machine-readable mode.
 */
export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { isMachine } = useBlogReaderMode()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: fetchBlogPosts,
    staleTime: Infinity,
  })

  const topCategories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of posts ?? []) {
      for (const c of post.categories) counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_PILLS)
      .map(([name]) => name)
  }, [posts])

  const filtered = useMemo(() => {
    if (!activeCategory) return posts ?? []
    return (posts ?? []).filter((p) => p.categories.includes(activeCategory))
  }, [posts, activeCategory])

  const blogIndexMachineMeta: PageMachineMetadata = useMemo(() => {
    const articleList = (filtered || [])
      .map(
        (p) =>
          `### [${p.title}](https://spotlightlinks.com/blog/${p.slug})\n*${p.subtitle || ''}*\n- **Date**: ${p.date || 'N/A'} | **Read Time**: ${p.readTime || 'N/A'}\n- **Categories**: ${p.categories.join(', ')}\n- **Raw Markdown URL**: [https://spotlightlinks.com/blog/${p.slug}.md](https://spotlightlinks.com/blog/${p.slug}.md)`
      )
      .join('\n\n')

    return {
      path: '/blog',
      title: 'Spotlight Links Blog — Machine-Readable Index',
      h1: 'AEO, GEO, and what actually gets a business recommended by AI',
      description:
        'Field notes from running real Answer Engine Optimization for real businesses — the methods, the costs, and the results.',
      canonical: 'https://spotlightlinks.com/blog',
      schemas: ['Blog', 'CollectionPage'],
      summary: `Field notes on Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and what actually gets a business recommended by ChatGPT, Gemini, Claude, and Perplexity. Includes serial probing breakdowns, token cost economics, and real-world case studies.`,
      sections: [
        {
          title: `Articles Directory (${filtered.length})`,
          content: articleList,
        },
      ],
    }
  }, [filtered])

  return (
    <div className="bg-surface min-h-screen">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {isMachine ? (
          <MachinePageView meta={blogIndexMachineMeta} filename="spotlight-links-blog-index.md" />
        ) : (
          <>
            <header className="border-line border-b py-10 sm:py-14">
              <p className="text-brand mb-2 text-xs font-semibold uppercase tracking-[0.14em]">
                The Spotlight Links Blog
              </p>
              <h1 className="text-ink max-w-3xl text-4xl font-semibold sm:text-5xl">
                AEO, GEO, and what actually gets a business recommended by AI
              </h1>
              <p className="text-ink-50 mt-4 max-w-2xl text-lg">
                Field notes from running real Answer Engine Optimization for real businesses — the
                methods, the costs, and the results.
              </p>
            </header>

            {topCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 py-6">
                <FilterPill active={activeCategory === null} onClick={() => setActiveCategory(null)}>
                  All
                </FilterPill>
                {topCategories.map((cat) => (
                  <FilterPill
                    key={cat}
                    active={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </FilterPill>
                ))}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-24">
                <Spinner className="size-6" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <PublicFooter />
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition',
        active
          ? 'border-brand bg-brand-tint text-brand'
          : 'border-line bg-surface-2 text-ink-50 hover:text-ink'
      )}
    >
      {children}
    </button>
  )
}
