import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { fetchBlogPosts } from '../lib/blog'
import { BlogCard } from '../components/BlogCard'
import { BookDemoCta } from '../components/BookDemo'
import { PublicHeader, PublicFooter } from '../components/PublicChrome'
import { Spinner } from '../components/ui/Spinner'
import { useBlogReaderMode } from '../context/blog-reader-context'
import { MachinePageView, type PageMachineMetadata } from '../components/MachinePageView'
import { useDocumentHead } from '../lib/document-head'

const MAX_PILLS = 8

const BLOG_H1 = 'AEO, GEO, and what actually gets a business recommended by AI'
const BLOG_TAGLINE =
  'Field notes from running real Answer Engine Optimization for real businesses — the methods, the costs, and the results.'

/**
 * Public blog index (route "/blog"). Supports dual Human and Machine-readable mode.
 */
export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { isMachine } = useBlogReaderMode()

  // Mirrors what scripts/prerender.mjs bakes into dist/blog/index.html.
  useDocumentHead(`${BLOG_H1} | Spotlight Links`, BLOG_TAGLINE)

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
      .map(([name, count]) => ({ name, count }))
  }, [posts])

  const filtered = useMemo(() => {
    if (!activeCategory) return posts ?? []
    return (posts ?? []).filter((p) => p.categories.includes(activeCategory))
  }, [posts, activeCategory])

  const blogIndexMachineMeta: PageMachineMetadata = useMemo(() => {
    const articleList = (filtered || [])
      .map(
        (p) =>
          `### [${p.title}](https://spotlightlinks.com/blog/${p.slug})\n*${
            p.subtitle || ''
          }*\n- **Date**: ${p.date || 'N/A'} | **Read Time**: ${
            p.readTime || 'N/A'
          }\n- **Categories**: ${p.categories.join(
            ', '
          )}\n- **Raw Markdown URL**: [https://spotlightlinks.com/blog/${
            p.slug
          }.md](https://spotlightlinks.com/blog/${p.slug}.md)`
      )
      .join('\n\n')

    return {
      path: '/blog',
      title: 'Spotlight Links Blog — Machine-Readable Index',
      h1: BLOG_H1,
      description: BLOG_TAGLINE,
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
              <h1 className="text-ink max-w-3xl text-4xl font-semibold sm:text-5xl">{BLOG_H1}</h1>
              <p className="text-ink-50 mt-4 max-w-2xl text-lg">{BLOG_TAGLINE}</p>
            </header>

            {topCategories.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-2 py-6"
                role="region"
                aria-label="Filter blog posts by category"
              >
                <FilterPill
                  active={activeCategory === null}
                  onClick={() => setActiveCategory(null)}
                >
                  All {posts ? `(${posts.length})` : ''}
                </FilterPill>
                {topCategories.map(({ name, count }) => (
                  <FilterPill
                    key={name}
                    active={activeCategory === name}
                    onClick={() => setActiveCategory(name)}
                  >
                    {name} <span className="opacity-60">({count})</span>
                  </FilterPill>
                ))}
              </div>
            )}

            <main className="min-h-[400px]">
              {isLoading ? (
                <div className="flex justify-center py-24">
                  <Spinner className="size-6" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="border-line text-ink-50 my-12 rounded-xl border border-dashed py-16 text-center">
                  <p className="text-base font-medium">No articles found in this category.</p>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className="text-brand hover:underline mt-2 text-sm font-semibold"
                  >
                    View all posts
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((post) => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </main>

            <BookDemoCta source="blog-index" className="my-16" />
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
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        'focus-visible:ring-brand inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        active
          ? 'border-brand bg-brand-tint text-brand shadow-xs'
          : 'border-line bg-surface-2 text-ink-50 hover:border-ink-20 hover:text-ink'
      )}
    >
      {children}
    </button>
  )
}
