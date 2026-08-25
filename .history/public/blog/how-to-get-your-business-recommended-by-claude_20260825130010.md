---
title: 'How to Get Your Business Recommended by Claude'
subtitle: Claude does not use Google or Bing. It runs on a separate index, uses three separately documented crawlers, and cites passages rather than pages. This guide covers what Claude reads before it recommends a business, and what the evidence actually supports.
date: '2026-08-25'
image: '/media/get-recommended-claude.jpeg'
author: Spotlight Links Team
categories:
  - Claude
  - Anthropic
  - AEO
  - GEO
  - Citation Building
---

Claude is the AI engine most businesses ignore, and the one where the optimization work you've already done is least likely to have helped.

It doesn't run on Google. It doesn't run on Bing. Its citations barely overlap with either. If you've optimized for Gemini and ChatGPT and assumed Claude came along for the ride, the evidence says you're wrong most of the time.

Here is what Claude actually reads before it names a business, what the public evidence supports, and where that evidence stops.

## The short answer

Claude recommendations depend on six things:

1. Visibility in **Brave Search**, which by all public evidence is Claude's retrieval backend
2. Correct configuration of Anthropic's **three separate crawlers**
3. Server-rendered HTML that a live fetch can read
4. Content structured so individual **passages** stand alone
5. **Third-party corroboration**, which Claude weights unusually heavily
6. Consistency over 45 to 60 days

---

## First: Is Claude Worth Your Time?

Not equally, for every business. This deserves saying plainly before you spend a quarter on it.

Claude has no Maps integration and no local business directory. Ask Claude for a plumber near you and it does a web search — it isn't reading a structured local listings database the way Gemini reads Google Maps. For a restaurant, salon, or walk-in retail business, Claude is the lowest-yield of the three engines, and you should fix Gemini first.

But [Claude's fastest growth is among technical and enterprise users — developers, researchers, and engineers](https://www.rivalhound.com/blog/claude-brave-search-visibility/). If you sell B2B software, professional services, consulting, legal or accounting work, industrial supply, or anything with a long consideration cycle and a research phase, your buyers are disproportionately here — and your competitors almost certainly haven't optimized for it.

Claude also has one structural advantage worth knowing about: [Anthropic respects all robots.txt directives including for user-initiated browsing, offers the most fine-grained crawler control of the major platforms, and operates no preferred publisher list](https://isagentready.com/en/blog/how-claude-selects-sources-to-cite). There is no deal to be cut. Content quality and technical execution decide visibility, which is the best news a small business gets in this entire category.

---

## What Claude Actually Reads

### The retrieval backend is Brave Search

This is the most important fact in this article and the one most guides get wrong.

Anthropic has never officially confirmed its search provider. But the public evidence chain is unusually strong:

- **The subprocessor listing.** [Anthropic's Trust Center lists Brave Search as a "Web Search" subprocessor, added March 19, 2025 — one day before Claude's web search launched — and scoped to all products](https://rankry.ai/blog/how-claude-finds-and-cites-sources/).
- **The code.** Within a day of launch, [developer Simon Willison found a parameter named `BraveSearchParams` inside Claude's search tool definition](https://rankry.ai/blog/how-claude-finds-and-cites-sources/).
- **The press confirmation.** TechCrunch reported the Brave relationship in March 2025.
- **The citation overlap.** Profound's analysis found an [86.7% overlap between Claude's cited results and Brave's top non-sponsored organic results — 13 of 15 in the sample, with a p-value below 0.0001](https://www.tryprofound.com/blog/what-is-claude-web-search-explained).

For comparison, the same study found [ChatGPT shows only 26.7% alignment with its Bing backend](https://generatemore.ai/blog/how-to-get-visibility-on-claude), and [Claude's results overlap with ChatGPT's by roughly 20%](https://www.tryprofound.com/blog/what-is-claude-web-search-explained).

**What this means practically:** Brave visibility is the gating factor for whether Claude can consider you at all. Brave operates an independent index of roughly 40 billion pages with its own ranking signals — it is not a Google or Bing wrapper.

**Two honest caveats.** First, [the 86.7% figure comes from a single study — directional evidence, not gospel — and Anthropic could change providers, add providers, or build its own index at any time without announcing it](https://www.rivalhound.com/blog/claude-brave-search-visibility/). Second, [Anthropic's subprocessor list includes a quieter second entry, TurboPuffer, suggesting a retrieval layer that may filter or reorder results beyond raw Brave rank](https://rankry.ai/blog/how-claude-finds-and-cites-sources/). Optimize to be genuinely citable, not to game one index's ranking, because there may be a second selection step nobody can see.

That said, the dependency looks durable rather than fragile: [Microsoft retired the public Bing Search API in August 2025, and Google's Custom Search API is closed to new customers and scheduled to shut down in January 2027](https://rankry.ai/blog/how-claude-finds-and-cites-sources/). Independent search backends are scarce.

### Anthropic runs three crawlers, each with a documented consequence

In February 2026, [Anthropic formally documented three separate crawlers, each with its own robots.txt user-agent string and its own "what happens when you disable it" explanation](https://www.searchenginejournal.com/anthropics-claude-bots-make-robots-txt-decisions-more-granular/568253/):

| Crawler            | Job                                            | Consequence of blocking                                                                                                                                                         |
| ------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ClaudeBot`        | Collects web content for model training        | Your future material is excluded from training datasets                                                                                                                         |
| `Claude-User`      | Fetches pages live when a user asks a question | Your site won't surface when Claude users ask — the equivalent of opting out of a search index                                                                                  |
| `Claude-SearchBot` | Indexes content for Claude's search results    | Anthropic's wording: this "prevents our system from indexing your content for search optimization, which may reduce your site's visibility and accuracy in user search results" |

Two details matter enormously:

**Blocking one does not block the others.** [Each bot requires its own directive, on each subdomain you want to restrict](https://searchengineland.com/anthropic-claude-bots-470171). Blocking `ClaudeBot` to opt out of training leaves `Claude-SearchBot` and `Claude-User` fully able to read you — which is very likely what you want.

**Anthropic honors robots.txt on the user-initiated fetcher too.** [All three Claude bots respect robots.txt, including Claude-User — where OpenAI warns robots.txt rules may not apply to ChatGPT-User, and Perplexity says they generally don't apply to Perplexity-User](https://www.searchenginejournal.com/anthropics-claude-bots-make-robots-txt-decisions-more-granular/568253/). Claude is the platform that most reliably does what your robots.txt tells it to. That cuts both ways: a careless blanket block is fully honored.

**Don't try IP blocking either way.** [Anthropic states IP-based blocking is unreliable, because its bots use public cloud provider IP addresses and blocking those ranges could prevent the bot from reaching your robots.txt at all](https://searchengineland.com/anthropic-claude-bots-470171). Anthropic doesn't publish IP ranges.

### Citations happen at the passage level

[Claude queries the search backend, receives passage-level chunks, generates an answer grounded in those chunks, and returns inline citations linking to source URLs](https://generatemore.ai/blog/how-to-get-visibility-on-claude). [A single well-structured paragraph can earn a citation, while a page with excellent overall quality but poorly structured sections may be read and never cited](https://www.erlin.ai/blog/claude-seo).

Sentence-level and section-level structure matters more here than on any other platform.

---

## 1. Get Visible in Brave Search

Brave is the index nobody optimizes for, which is exactly why it's the opportunity.

**Verify in Bing Webmaster Tools anyway.** Brave runs an independent index, but Brave also draws on other sources for some results, and Bing indexing remains foundational for ChatGPT. Do it once; it serves two engines.

**Fix your fundamentals, because Brave rewards them directly.** The Brave relationship means Claude reflects organic ranking signals more faithfully than Google's AI surfaces do — [Google's AI surfaces re-rank far more aggressively against their own organic results](https://generatemore.ai/blog/how-to-get-visibility-on-claude). Clean crawlability, fast pages, good internal linking, and genuine topical depth translate more directly into Claude citations than into any Google AI placement.

**Check where you actually rank in Brave.** Search your core service-plus-location queries in Brave Search directly. If you're absent from the top results, you are effectively absent from Claude. This takes ten minutes and almost nobody does it.

**Publish deep pages, not homepages.** An analysis of 2,170 URLs cited by Claude found [a consistent preference for niche industry and SaaS sites, article and blog paths, and deep article pages over homepages](https://www.oltre.ai/blog/how-claude-picks-sources-technical-breakdown-claude-citations/). Your homepage is not your citation asset. A specific, thorough page answering one real question is.

## 2. Configure Anthropic's Crawlers Deliberately

The whole configuration is four lines, and the default in many CMS templates and privacy plugins is wrong.

To allow search visibility while opting out of training:
