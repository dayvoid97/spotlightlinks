---
title: 'How AI Answer Engines Actually Pick Who to Cite'
subtitle: 'ChatGPT runs on Bing. Claude runs on Brave. Perplexity runs on its own index and mostly ignores Google. Before you can get cited, you have to know which index each engine is actually reading — because winning one wins you nothing in the others.'
date: '2026-07-26'
author: 'Kanchan Sharma'
image: '/blog/aeo/engine-source-map.svg'
categories:
  - AEO
  - GEO
  - SEO
  - Strategy
---

Most advice about getting cited by AI is written as though "AI search" is one thing you optimize for once.

It isn't. ChatGPT, Gemini, Perplexity, and Claude each answer from a **different index**. Not different algorithms reading the same web — different underlying search engines entirely. Rank beautifully in Google and you may be invisible to Claude. Get cited constantly by Perplexity and never appear in ChatGPT.

The numbers make this brutally clear: across an analysis of 680 million citations, **only 11% of domains cited by ChatGPT were also cited by Perplexity.** Same web, same questions, almost no overlap.

So before any tactics, here's the map.

![Where each AI answer engine sources its citations](/blog/aeo/engine-source-map.svg)

## ChatGPT reads Bing

ChatGPT Search doesn't crawl the open web to answer you in real time. It queries **Bing's index**, and it does so aggressively: a single prompt gets fanned out into roughly **5 to 15 sub-queries**, each returning candidates that the model then synthesizes into one answer.

Measured alignment between ChatGPT's citations and Bing's top organic results runs about **87%**. If you are not in Bing, you are functionally not in ChatGPT.

This is the single most-ignored fact in the entire field. Businesses pour years into Google rankings and never once check whether Bing has even indexed them. **Bing Webmaster Tools is free**, takes about ten minutes, and is the highest-leverage unglamorous thing most businesses can do this quarter.

ChatGPT also shows a strong bias toward information that appears **early on the page** — critical facts in the first 200–500 words get pulled far more often than the same facts buried under 1,200 words of preamble. And its citation pool skews toward established authority: Wikipedia, government and university domains, and major publications.

## Gemini and Google AI Overviews read Google

No surprise here, and that's the point. Gemini and AI Overviews sit on top of the **Google index** you already understand.

An Ahrefs analysis of 1.9 million AI Overview citations found **76% came from URLs already ranking in Google's top 10 organic results.**

That means for this engine specifically, classic SEO is not obsolete — it's the _entry ticket_. You cannot be cited by Google's AI if Google's regular search doesn't already rank you. Anyone selling you "AEO instead of SEO" is describing a strategy that fails on the largest surface of all.

The AEO work sits **on top** of that ranking: being the page that answers the question cleanly enough to be worth quoting once you're in the candidate pool.

## Perplexity reads its own index — and it's the contrarian

Perplexity built and runs its **own index**, and this makes it the strangest and most winnable of the four.

Roughly **80% of what Perplexity cites is not in Google's top results.** It weights **freshness** enormously. It hands out **20+ citation slots** per answer where ChatGPT might use three. And it leans into user-generated content, Reddit threads, forums, and small niche sites carrying granular specifics that big encyclopedic domains never bother with.

For a small local business, Perplexity is the most accessible engine in existence. You do not need domain authority built over a decade. You need **specific, current, genuinely useful detail** that nobody else has written down — exactly what a working business knows and rarely publishes.

## Claude reads Brave Search

This one surprises nearly everyone, including people who do this professionally.

When Claude runs a live search, it queries **Brave Search**. This was confirmed from two directions: developer Simon Willison inspected Claude's tool definition within 24 hours of launch and found an internal parameter named `BraveSearchParams`; and a Profound analysis found Claude's cited results overlapped Brave's top non-sponsored organic results **86.7% of the time — 13 of the top 15, with a p-value below 0.0001.**

Claude does not independently crawl the live web to answer you. It reads what Brave has indexed.

So your Bing playbook does not carry over, and neither does your Google one. Brave operates its own independent index. If Brave hasn't indexed you, Claude cannot cite you — full stop.

## Training crawlers and retrieval crawlers are not the same thing

Here is where a genuinely expensive mistake gets made, and where a lot of businesses have quietly locked themselves out.

Each major AI company runs **separate crawlers for separate jobs**:

| Company    | Training          | Live search index  | User-triggered fetch |
| ---------- | ----------------- | ------------------ | -------------------- |
| OpenAI     | `GPTBot`          | `OAI-SearchBot`    | `ChatGPT-User`       |
| Anthropic  | `ClaudeBot`       | `Claude-SearchBot` | `Claude-User`        |
| Google     | `Google-Extended` | `Googlebot`        | —                    |
| Perplexity | —                 | `PerplexityBot`    | —                    |

Two years ago, a wave of well-meaning advice told site owners to block `GPTBot` to keep their content out of AI training. Plenty of businesses did — often by pasting in a broad rule they never revisited.

**Blocking `GPTBot` does not remove you from ChatGPT Search. Blocking `OAI-SearchBot` does.** They are independent switches. You can refuse training and still be cited — that combination is entirely available to you, and it's what most businesses actually want.

But the reverse is the disaster case: a robots.txt that blocks the _retrieval_ crawler makes you permanently uncitable no matter how good your content is. Anthropic added `Claude-SearchBot` to its documentation as recently as **February 2026**, which means a robots.txt written before then almost certainly doesn't account for it.

**Go read your robots.txt today.** This is a five-minute check that decides whether everything else you do is even possible.

## A note on llms.txt, since someone will sell it to you

You will be pitched `llms.txt` as the key to AI visibility. Be skeptical.

As of June 2026, **8.7% of the top 1,000 websites publish one — and 39.6% of those are empty plugin stubs.** More importantly: **no major AI engine has committed to consuming it.** It is not part of any documented citation or retrieval pipeline at OpenAI, Anthropic, Google, or Perplexity. Google's John Mueller stated publicly that Search does not use or endorse it.

It has real value in one narrow place: developer documentation, where an `llms-full.txt` lets a coding assistant pull clean Markdown instead of scraping HTML. Stripe, Vercel, and Cloudflare ship one for exactly that reason.

If you run a garage door company, an optical shop, or an ice cream store, `llms.txt` will do approximately nothing for you. Anyone charging you for it as an AEO deliverable is charging for a file nothing reads.

We'd rather tell you that and lose the upsell.

## What actually moves the needle

The mechanism dictates the work. Across all four engines, the same short list does the heavy lifting:

1. **Get indexed everywhere that matters** — Google, _and Bing_, _and Brave_. Most businesses have done one of three.
2. **Answer the question in the first paragraph** — with the real number, the real timeline, the real service area. Engines quote specifics; they skip throat-clearing.
3. **Publish the granular detail nobody else will** — this is what wins Perplexity and it's the material only an operator has.
4. **Be a legible entity** — consistent name, phone, and address everywhere; structured data; verifiable registration; real reviews.
5. **Keep it fresh** — freshness is a heavy Perplexity signal and a real one elsewhere.
6. **Let the right robots in** — retrieval crawlers allowed, training your choice.

None of that is a hack. There's no prompt to game and no schema trick that manufactures trust. It's building a business that deserves to be recommended, then making sure four different machines can read it.

## We do this, and it works

[Open Sesame Garages](https://www.opensesamegarages.info) is a one-technician garage door company in Oklahoma City. Ask an AI-powered search about garage door repair in OKC and the answer comes back quoting their site **verbatim** — the $150–$350 spring replacement range, the coverage across Edmond, Norman, Moore, and Midwest City.

Not paraphrased. Quoted. From FAQ content we wrote and structured for exactly that outcome.

That's a small local business being recommended by the same systems your customers are querying right now, achieved without a national brand budget.

[Read the full case study →](/blog/open-sesame-garages-aeo-geo-seo-case-study)

---

**Want to know which engines can currently see you?** We'll audit your indexing across Google, Bing, and Brave, read your robots.txt, and show you exactly where you're invisible. [Book a strategy call](/contact) — the first four booked from this site are free.

**Next:** [The engine-by-engine playbook →](/blog/how-to-get-recommended-by-chatgpt-gemini-perplexity-claude)

---

### Sources

- Profound, Claude / Brave Search citation overlap analysis (86.7%, p &lt; 0.0001)
- Simon Willison, inspection of Claude's web search tool definition (`BraveSearchParams`)
- Ahrefs, analysis of 1.9 million Google AI Overview citations
- 680-million-citation cross-platform domain overlap analysis (ChatGPT / AI Overviews / Perplexity)
- Anthropic crawler documentation, updated February 20, 2026
- OpenAI user-agent documentation (`GPTBot`, `OAI-SearchBot`, `ChatGPT-User`)
- Rankability, llms.txt adoption across the top 1,000 websites, June 2026
