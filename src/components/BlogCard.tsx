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
      className="group border-line bg-surface-2/60 hover:border-brand hover:bg-surface-2 flex h-full flex-col overflow-hidden rounded-2xl border transition"
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
        <div className="bg-brand flex aspect-[16/9] w-full items-center justify-center">
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

        <h3 className="text-ink group-hover:text-brand text-sm font-bold leading-snug">
          {post.title}
        </h3>

        {post.subtitle && <p className="text-ink-50 line-clamp-2 text-xs">{post.subtitle}</p>}

        <div className="text-ink-30 mt-auto flex items-center justify-between pt-2 text-[11px]">
          <span>{[post.date, post.readTime].filter(Boolean).join(' · ') || post.author}</span>
          <ArrowRight className="text-ink-30 group-hover:text-brand size-3.5 shrink-0 transition" />
        </div>
      </div>
    </Link>
  )
}
