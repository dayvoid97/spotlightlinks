import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { guessLocalImage, type BlogPost } from '../lib/blog'
import { Badge } from './ui/Badge'

/** One card in a blog grid — links to the on-site reader at /blog/:slug. */
export function BlogCard({ post }: { post: BlogPost }) {
  const [imageBroken, setImageBroken] = useState(false)
  const localImage = guessLocalImage(post.image)
  const showImage = localImage && !imageBroken
  const primaryCategory = post.categories[0]

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-2/60 transition hover:border-brand hover:bg-surface-2"
    >
      {showImage ? (
        <img
          src={localImage}
          alt=""
          onError={() => setImageBroken(true)}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-brand">
          <span className="px-4 text-center text-xs font-semibold uppercase tracking-wide text-white/85">
            {primaryCategory ?? 'Spotlight Links'}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {post.categories.slice(0, 2).map((c) => (
            <Badge key={c} tone="violet">
              {c}
            </Badge>
          ))}
        </div>

        <h3 className="text-sm font-semibold leading-snug text-ink group-hover:text-brand">
          {post.title}
        </h3>

        {post.subtitle && <p className="line-clamp-2 text-xs text-ink-50">{post.subtitle}</p>}

        <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-ink-30">
          <span>{[post.date, post.readTime].filter(Boolean).join(' · ') || post.author}</span>
          <ArrowRight className="size-3.5 shrink-0 text-ink-30 transition group-hover:text-brand" />
        </div>
      </div>
    </Link>
  )
}
