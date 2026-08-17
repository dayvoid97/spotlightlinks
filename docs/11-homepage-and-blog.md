# Homepage & Blog Section

Frontend only — nothing here calls `xsl-backend` except indirectly, through `useAuth()` for the
one thing that changes on this page: which CTA button renders.

Source: `src/pages/HomePage.tsx`, `src/lib/blog.ts`, `src/components/BlogCard.tsx`.

## Routing

`/` is now the **public homepage** — reachable whether or not anyone is signed in, unlike every
other route in this app. The authenticated console (client list, onboarding, billing, etc.) moved
from `/` to **`/dashboard`**. If you're looking for where the old root-level dashboard went, or
why a bookmark to `/` now shows a landing page instead, that's this change — see
`src/App.tsx` for the full route table.

The homepage's CTA button (`CtaButton`) reads `useAuth()` directly and swaps between two states:

```tsx
{user ? 'Go to Dashboard' : 'Get started free'}
```

Signed out, it links to **`/get-started`** — the public onboarding funnel where a visitor can
build a client context and use the free AI synthesize step before ever creating an account (see
[docs/03-client-onboarding.md](03-client-onboarding.md#public-onboarding-funnel--get-started)).
Signed in, it links to `/dashboard`. The header also carries a plain "Log in" text link for
returning users while signed out, so the funnel CTA doesn't bury the login path. Nothing else on
the homepage changes with auth state — same hero and blog grid either way, matching how LinkedIn's
own logged-out homepage shows real content around its auth buttons rather than gating everything.

## The hero image

`public/679.png` is a transparent-background PNG (confirmed via `sips -g hasAlpha`) exported from
Figma — a car rendered against nothing, meant to sit directly on a dark background without a
visible bounding box. It's small (439×169) as shipped, so `Hero` in `HomePage.tsx` caps its
rendered width at `560px` rather than stretching it to fill a hero-width background — past that
size it starts looking soft. It's positioned to the right of the headline the way LinkedIn
anchors its own hero illustration to the right, with a soft violet glow (`blur-[100px]`) behind it
for depth rather than a hard image edge.

## The blog section

### Where the content lives, and the on-site reader

`public/blog/*.md` are the posts — plain markdown with YAML frontmatter — plus `index.json`
listing them. They're served as static files, and the app renders them itself:

- **`/blog`** (`BlogIndexPage`) — the index: hero, category filter, a grid of `<BlogCard>`s.
- **`/blog/:slug`** (`BlogPostPage`) — the on-site reader that renders the full article body.

`<BlogCard>` links **internally** (React Router `Link` to `/blog/:slug`), not out to
spotlightlinks.com. (`blogPostUrl()` still exists in `src/lib/blog.ts` for a canonical external URL
if ever needed, but nothing routes through it now.)

Static `.md`/`.json` under `/blog/` and the extension-less SPA routes `/blog` and `/blog/:slug`
coexist without clashing: the dev/prod static layer serves a request only when a real file matches
(`/blog/foo.md`, `/blog/index.json`), and everything else (`/blog`, `/blog/some-slug`) falls
through to the SPA. So `BlogPostPage` fetches `/blog/${slug}.md` as a static asset while the router
owns the pretty URL.

### Rendering the article body

`fetchBlogPost(slug)` (in `src/lib/blog.ts`) fetches the `.md`, strips the frontmatter block, drops
a single leading `# Heading` (most posts repeat their title as an H1 — the page renders the
frontmatter title itself, so this avoids doubling it), and runs the rest through **`marked`**
(the one added dependency — pure JS, no native binaries). The content is first-party, so the
rendered HTML is injected directly.

It reads as a **blog article, not console UI**, for free: the design system's base-layer element
styles in `index.css` (`h1`–`h6` in Playfair, Inter body, styled blockquotes / code / tables /
links) already _are_ blog typography, because they're plain element selectors. `BlogPostPage` wraps
the body in a `.blog-body` container that adds reading rhythm (heading top-spacing, image
treatment, wider measure). The public pages use a shared `PublicHeader`/`PublicFooter`
(`src/components/PublicChrome.tsx`) so `/`, `/blog`, and an article feel like one site.

Two HTML post-processing passes run on the rendered output (`enhanceArticleHtml`): image `src`s are
localized to `/mediasets/<basename>` with an inline `onerror` that hides any that 404 (see below),
and external links get `target="_blank" rel="noreferrer"`.

### Parsing frontmatter without a YAML library

Each post's frontmatter block uses one of two shapes (see `parseFrontmatter()` in `src/lib/blog.ts`
for the full implementation):

```yaml
---
title: Plain or 'single' or "double" quoted, all three appear
date: August 10, 2026        # or '2026-07-30' — format is not normalized, shown as-is
author: Spotlight Links Research
category: Case Studies       # singular string, OR:
categories: ["Strategy", "AEO", "GEO"]     # inline array, OR:
categories:
  - AEO                       # YAML bullet list, both styles appear in this folder
  - GEO
readTime: 5 min read
excerpt: Older posts use this instead of subtitle
subtitle: Newer posts use this instead of excerpt
image: /media/some-image.png
---
```

`fetchBlogPosts()` fetches `index.json` for the file list, then every markdown file, and runs each
through a small hand-written parser rather than pulling in a YAML dependency — the format is
narrow enough (checked against all 20 files in this folder while building this) that a line-based
parser handles every case actually present. `subtitle` and `excerpt` are treated as the same field
client-side (`subtitle ?? excerpt`), and `category`/`categories` are normalized into a single
`categories: string[]` on the returned `BlogPost` — callers never need to know which shape a given
post's frontmatter used.

### Images that don't exist in this project

Most posts' `image` frontmatter points at paths like `/media/...`, `/blog/aeo/...`, or
`/spotlightskills/...` — real paths on spotlightlinks.com, but only one of them
(`aeo-for-brick-and-mortar.png`) has a local copy, sitting in `public/mediasets/`. Rather than
hard-code that one mapping, `guessLocalImage()` always guesses `/mediasets/<basename>` for
whatever the frontmatter says, and `<BlogCard>` tries to load it with a plain `onError` handler
that falls back to a gradient placeholder card (showing the post's primary category as a label
instead) when the guess 404s. Drop more matching images into `public/mediasets/` later and the
matching posts will pick them up automatically — no code change needed.

### Category pills

`BlogSection` in `HomePage.tsx` counts how often each category appears across all posts and shows
the top 7 as filter pills (plus "All"), rather than every category the content happens to use —
there are roughly 30 distinct tags across 20 posts, and showing all of them would be exactly the
kind of clutter the "keep it simple" brief was pushing against. Filtering is client-side only
(`Array.prototype.filter` on the already-fetched list); there's no per-category endpoint to call.
