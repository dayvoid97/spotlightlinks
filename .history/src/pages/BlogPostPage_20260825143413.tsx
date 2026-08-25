import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchBlogPost, fetchBlogPosts, guessLocalImage } from '../lib/blog'
import { PublicHeader, PublicFooter } from '../components/PublicChrome'
import { BlogCard } from '../components/BlogCard'
import { Badge } from '../components/ui/Badge'
import { BookDemoCta } from '../components/BookDemo'
import { FullPageSpinner } from '../components/ui/Spinner'
import { useBlogReaderMode } from '../context/blog-reader-context'
import { MachinePageView, type PageMachineMetadata } from '../components/MachinePageView'
import { useDocumentHead } from '../lib/document-head'

/**
 * On-site article reader (route "/blog/:slug").
 * Supports dual Human and Machine-readable modes.
 */
export default function BlogPostPage() {
  const { slug = '' } = useParams()
  const { isMachine } = useBlogReaderMode()

  const { data, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchBlogPost(slug),
    staleTime: Infinity,
  })

  const { data: allPosts } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: fetchBlogPosts,
    staleTime: Infinity,
  })

  // Jump to top when navigating between articles.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  // Mirrors what scripts/prerender.mjs bakes into dist/blog/<slug>/index.html,
  // so a client-side navigation lands on the same title Google indexed.
  useDocumentHead(
    data?.post.title
      ? data.post.title.includes('Spotlight Links')
        ? data.post.title
        : `${data.post.title} | Spotlight Links`
      : null,
    data?.post.subtitle
  )

  const articleMachineMeta: PageMachineMetadata | null = useMemo(() => {
    if (!data) return null
    return {
      path: `/blog/${slug}`,
      title: `${data.post.title} — Spotlight Links Article`,
      h1: data.post.title,
      description: data.post.subtitle || '',
      canonical: `https://spotlightlinks.com/blog/${slug}`,
      schemas: ['BlogPosting', 'Article'],
      summary: data.post.subtitle || data.post.title,
      sections: [
        {
          title: 'Article Raw Markdown Content',
          content: data.raw,
        },
      ],
    }
  }, [data, slug])

  if (isLoading) return <FullPageSpinner label="Loading article…" />

  if (error || !data) {
    return (
      <div className="bg-surface min-h-screen">
        <PublicHeader />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-ink text-3xl font-semibold">Article not found</h1>
          <p className="text-ink-50 mt-2">This post doesn't exist or has moved.</p>
          <Link to="/blog" className="text-brand mt-4 inline-block text-sm hover:underline">
            ← Back to all posts
          </Link>
        </div>
        <PublicFooter />
      </div>
    )
  }

  const { post, html } = data
  const heroImage = guessLocalImage(post.image)
  const readNext = (allPosts ?? []).filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <div className="bg-surface min-h-screen">
      {/* BlogPosting/BreadcrumbList JSON-LD is baked into this route's static HTML
        by scripts/prerender.mjs — with a W3C-normalized datePublished, which the
        raw frontmatter date is not. Emitting a second copy here only gave
        crawlers two conflicting BlogPostings for one page. */}
      <link rel="alternate" type="text/markdown" href={`/blog/${slug}.md`} />

      <PublicHeader />

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/blog"
          className="text-ink-50 hover:text-ink mb-6 flex w-fit items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-3.5" /> All posts
        </Link>

        {/* Machine Mode View */}
        {isMachine && articleMachineMeta ? (
          <MachinePageView meta={articleMachineMeta} filename={`${slug}.md`} />
        ) : (
          /* Human Mode View */
          <>
            <header className="mt-4">
              {post.categories.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {post.categories.slice(0, 3).map((c) => (
                    <Badge key={c} tone="violet">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="text-ink text-4xl font-semibold sm:text-5xl">{post.title}</h1>

              {post.subtitle && <p className="lead text-ink-50 mt-4">{post.subtitle}</p>}

              <div className="text-ink-30 mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                {post.author && <span className="text-ink-50">{post.author}</span>}
                {post.author && (post.date || post.readTime) && <span>·</span>}
                {post.date && <span>{post.date}</span>}
                {post.date && post.readTime && <span>·</span>}
                {post.readTime && <span>{post.readTime}</span>}
              </div>
            </header>

            {heroImage && (
              <img
                src={heroImage}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
                className="border-line mt-8 w-full rounded-lg border"
              />
            )}

            {/* First-party content — rendered marked output injected directly. */}
            <div className="blog-body mt-10" dangerouslySetInnerHTML={{ __html: html }} />

            {/* Every article ends here. `source` carries the slug into GA4 so we can
              see which posts actually produce booked calls. */}
            <BookDemoCta source={`blog:${slug}`} className="mt-14" />
          </>
        )}
      </article>

      {!isMachine && readNext.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
          <h2 className="text-ink mb-5 text-xl font-semibold">Read next</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {readNext.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <PublicFooter />
    </div>
  )
}
