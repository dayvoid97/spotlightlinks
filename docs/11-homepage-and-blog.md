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

### Where the content actually lives

`public/blogcopy/*.md` are local copies of posts that are live at
`spotlightlinks.com/blogsets/:slug` — `blogPostUrl()` in `src/lib/blog.ts` builds that exact URL,
and every `<BlogCard>` links out to it in a new tab rather than rendering the article body inside
this app. There's no in-app blog reader here on purpose: the content already has a canonical home,
and duplicating a markdown renderer plus routing for it would just be a second copy of something
that already works.

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
