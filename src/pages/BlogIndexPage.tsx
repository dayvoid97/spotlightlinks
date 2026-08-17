import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { fetchBlogPosts } from '../lib/blog'
import { BlogCard } from '../components/BlogCard'
import { PublicHeader, PublicFooter } from '../components/PublicChrome'
import { Spinner } from '../components/ui/Spinner'

const MAX_PILLS = 8

/**
 * Public blog index (route "/blog"). Lists every post in public/blog/, with
 * category filtering. Cards link to the on-site reader at /blog/:slug.
 * See docs/11-homepage-and-blog.md.
 */
export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

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

  return (
    <div className="bg-surface min-h-screen">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="border-line border-b py-12 sm:py-16">
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
