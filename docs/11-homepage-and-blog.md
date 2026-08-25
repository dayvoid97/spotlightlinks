# Homepage & Blog Section

Frontend only — nothing here calls `xsl-backend` except indirectly, through `useAuth()` for the
one thing that changes on this page: which CTA button renders.

Source: `src/pages/HomePage.tsx`, `src/lib/blog.ts`, `src/components/BlogCard.tsx`, and the
build scripts in `scripts/` (`blog-data.mjs`, `generate-sitemap.mjs`, `prerender.mjs`).

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

`public/blog/*.md` are the posts — plain markdown with YAML frontmatter. **The folder is the
manifest**: nothing lists the posts by hand. `scripts/generate-sitemap.mjs` reads the folder on
every build and emits `public/blog/posts.json`, and the app renders from there:

- **`/blog`** (`BlogIndexPage`) — the index: hero, category filter, a grid of `<BlogCard>`s.
- **`/blog/:slug`** (`BlogPostPage`) — the on-site reader that renders the full article body.

`<BlogCard>` links **internally** (React Router `Link` to `/blog/:slug`), not out to
spotlightlinks.com. (`blogPostUrl()` still exists in `src/lib/blog.ts` for a canonical external URL
if ever needed, but nothing routes through it now.)

Static `.md`/`.json` under `/blog/` and the extension-less SPA routes `/blog` and `/blog/:slug`
coexist without clashing: the dev/prod static layer serves a request only when a real file matches
(`/blog/foo.md`, `/blog/posts.json`), and everything else falls through to the SPA — except that
`/blog` and `/blog/:slug` now match a real file too, the one the prerenderer writes (below).

### Never name anything in `/blog/` `index.<ext>`

The feed used to be `public/blog/index.json`, and that one filename was a live bug. A static host
resolving a bare request for `/blog` looks for a directory index inside `blog/` — so
`spotlightlinks.com/blog` answered a hard refresh with a raw JSON array of filenames instead of the
lander. In-app navigation looked fine, because React Router never asked the server. Anything
machine-readable that lives in this folder must avoid the `index` basename; `posts.json` is the
current name.

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

`fetchBlogPosts()` just reads `/blog/posts.json`, which already holds all of this parsed and
sorted newest-first — it used to fetch the file list and then all ~28 markdown files on every
visit to `/blog`. `fetchBlogPost()` still parses a single article's frontmatter itself, with a
small hand-written parser rather than a YAML dependency: the format is narrow enough that a
line-based parser handles every case actually present. The build-side copy in
`scripts/blog-data.mjs` mirrors it exactly — change one and change the other.

`subtitle` and `excerpt` are treated as the same field (`subtitle ?? excerpt`), and
`category`/`categories` are normalized into a single `categories: string[]` — callers never need to
know which shape a given post's frontmatter used.

### Images that don't exist in this project

Most posts' `image` frontmatter points at paths like `/media/...`, `/blog/aeo/...`, or
`/spotlightskills/...` — real paths on spotlightlinks.com, but only one of them
(`aeo-for-brick-and-mortar.png`) has a local copy, sitting in `public/mediasets/`. Rather than
hard-code that one mapping, `guessLocalImage()` always guesses `/mediasets/<basename>` for
whatever the frontmatter says, and `<BlogCard>` tries to load it with a plain `onError` handler
that falls back to a gradient placeholder card (showing the post's primary category as a label
instead) when the guess 404s. Drop more matching images into `public/mediasets/` later and the
matching posts will pick them up automatically — no code change needed.

The runtime `onError` fallback is invisible to a crawler, though, so the build-side resolver in
`scripts/blog-data.mjs` is stricter: it checks `public/mediasets/` for real and drops anything it
cannot resolve, rather than shipping a broken `<img>` or an `og:image` pointing at a 404 into the
indexed HTML. Posts with no usable image fall back to the site-wide OG image.

## The build pipeline: sitemap, feed, and prerendered HTML

Three generated artifacts, all derived from `public/blog/` and none hand-maintained. Adding an
article means dropping a `.md` in the folder and deploying — there is no list to update and nothing
to resubmit to Google Search Console or Bing Webmaster Tools, because the sitemap they already have
is rewritten on every build.

`scripts/blog-data.mjs` is the shared reader: it parses every post's frontmatter, normalizes both
date shapes to `YYYY-MM-DD`, resolves each post's `image` against the real files in
`public/mediasets/` (by basename, ignoring extension — at least one post records `.jpeg` for a file
saved as `.jpg`), and returns everything newest-first.

**`prebuild` → `scripts/generate-sitemap.mjs`** writes `public/blog/posts.json` (the blog's own
machine-readable feed, and what the app fetches), `public/sitemap.xml`, and `public/llms.txt`.
Committed to the repo as well as generated, so `npm run dev` has them without a build.

**`postbuild` → `scripts/prerender.mjs`** writes `dist/<route>/index.html` for every public route:
the four marketing pages, `/blog`, and all 28 articles.

That second step is the one that fixes what search results actually showed. This is a
client-rendered SPA behind a catch-all rewrite, so every URL used to return the same
`dist/index.html` — which is why an article appeared in Google as *"AI Search Visibility Console. -
Spotlight Links"*: the only title in the HTML was the shell's, and the real one existed solely
after React ran. Crawlers that never execute JS — GPTBot, ClaudeBot, PerplexityBot, most link
unfurlers — got an empty `<div id="root">`, on a site whose entire business is being citable by
exactly those crawlers.

Each prerendered file carries its own `<title>`, description, canonical, `og:*`/`twitter:*`, and
route-specific JSON-LD (`BlogPosting` + `BreadcrumbList` per article, `Blog` on the index, both
tied by `@id` into the `Organization` graph in the shell), plus the rendered article body and real
`<a href>` links to the rest of the site. React boots on top and replaces the container as usual,
so nothing about the in-app experience changes. It is additive, never load-bearing: a host that
failed to match the static file would simply fall through to the SPA rewrite and behave as before.

The prerenderer rewrites the shell's head **by regex**, so the meta tags in the root `index.html`
have to stay one-per-line in their current shape. `useDocumentHead()` (`src/lib/document-head.ts`)
keeps the title and description in step during client-side navigation, matching the values the
prerenderer baked in.

### The booking CTA

Onboarding is manual now — no self-serve checkout — so the blog's job is to end in a booked call.
`src/components/BookDemo.tsx` is the one place that links to the Google Calendar appointment
schedule, and it ships two exports: `<BookDemoLink>` (a bare anchor, used in `PublicFooter`) and
`<BookDemoCta>` (the card that closes every article and the blog index).

Both take a **`source`**, which is the reason they exist as a component rather than as a URL pasted
in five places. Every click fires a GA4 `book_demo_click` event carrying it — `blog:<slug>` from an
article, `blog-index`, `public-footer` — so "which post produced a booked call" is a question the
analytics can actually answer, and the content calendar can follow it.

The URL and copy live in `BOOKING` in `src/lib/marketing.ts`. The build reads that block as text
via `scripts/marketing-data.mjs` (the same regex trick used for the FAQs and services), so
`prerender.mjs` writes the CTA into every article's static HTML and `generate-sitemap.mjs` writes
it into `llms.txt` — a CTA that only exists after hydration is invisible to exactly the crawlers
this blog is written for. `readBooking()` throws rather than degrading: a build that silently
dropped the booking URL out of 28 articles is worse than a build that fails.

### Category pills

`BlogSection` in `HomePage.tsx` counts how often each category appears across all posts and shows
the top 7 as filter pills (plus "All"), rather than every category the content happens to use —
there are roughly 30 distinct tags across 20 posts, and showing all of them would be exactly the
kind of clutter the "keep it simple" brief was pushing against. Filtering is client-side only
(`Array.prototype.filter` on the already-fetched list); there's no per-category endpoint to call.
