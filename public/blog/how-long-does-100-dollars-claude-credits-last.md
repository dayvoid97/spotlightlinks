---
title: 'How Long Does $100 in Claude Credits Last? Under a Week. Here Is Our Data.'
subtitle: Anthropic gave Spotlight Links a $100 Claude Code credit. We run five active clients on AEO, GEO, builds, and deployments. It lasted less than a week — about ten hours of dedicated work. Our AI bill is blowing through the roof.  These are real numbers, published real recognize real.
date: '2026-07-29'
author: Kanchan Sharma
image: '/blog/ai-costs/claude-credit-burn.svg'
categories:
  - AI Costs
  - Agency Life
  - Real Data
---

**How long does $100 in Claude credits last for a working agency? Less than one week.** In our case: roughly ten hours of dedicated Claude Code sessions on Fable 5, servicing five active clients, at an effective cost of about **$10 per hour of agency-grade output**. We know because we just burned through it — and this post exists because when we went looking for real burn numbers before spending, nobody had published any.

So here are ours.

![Where $100 of Claude credits went at Spotlight Links — real burn data](/blog/ai-costs/claude-credit-burn.svg)

## The setup

Recently, Anthropic offered Spotlight Links a $100 Claude Code credit. Our honest first reaction: that's a lot. The per-token prices look tiny — a few dollars per million output tokens reads like the meter will never move. We figured it would carry us for a month.

It didn't carry us for a week. By day six we were buying another $50, and not reluctantly.

## What the $100 actually bought

This wasn't chat. This was **Claude Code running an agency's production workload** across five clients who need active servicing:

- **Client site and app builds** — the largest share. New pages, components, whole features, shipped to real businesses.
- **AEO and GEO programs** — content architecture, structured data, schema graphs, crawler configuration, the [engine-by-engine visibility work](/blog/how-ai-answer-engines-choose-citations) we write about constantly, executed at scale.
- **Deployments** — moving builds from localhost to production, including the [seven classic failures](/blog/why-ai-built-apps-break-in-production) we've documented.
- **The connective tissue** — audits, fixes, the corners of the internet you don't bother looking at until a client needs them wired up.

Call it twenty hours of total Claude-assisted time, of which about **ten were the heavy kind** — post-gym, 40Hz-focus-music, late-morning sessions where the agent is reading repos, running builds, and writing production code continuously. That's the mode that eats credits, because the model isn't answering a question; it's _working_, with full context loaded.

## Why the per-token math fools everyone

Token prices are real, and they really are cheap per unit. What the unit price hides is **volume**. An agentic coding session doesn't send a paragraph and get a paragraph back. It loads files, re-reads them after edits, runs commands, ingests the output, and reasons across all of it — every round trip carrying context. A single focused hour of that is tens of millions of tokens moving in both directions.

So the honest unit isn't dollars per token. It's **dollars per hour of work the model does**, and our measured number is about $10.

## Is $10 an hour expensive?

Here's the part that reframes the whole question: the work those hours produced is the kind that bills at **hundreds of dollars per hour** when humans do it alone — full-stack builds, search architecture, deployment engineering. Ten dollars an hour for a tireless collaborator operating at that level isn't a cost problem. It's the widest margin in our entire stack.

We spent $100, flinched at the burn rate, looked at what got shipped in those ten hours, and bought more. That sequence — surprise, then immediate repurchase — is the most honest review of a tool we can give.

## The extrapolation, for anyone budgeting

From our logs, scaled linearly:

| Agency load                      | Realistic monthly credit budget |
| -------------------------------- | ------------------------------- |
| 1–2 clients, part-time           | $50–$100                        |
| 5 clients, active servicing (us) | $200–$400                       |
| 10 clients, active servicing     | **~$500**                       |

Treat those as floors, not caps — heavy build months run past them. If you're an agency owner doing this math for the first time: the number that matters isn't the credit line, it's what one serviced client pays you against it. Ours pays for the month's credits many times over.

And here's the part that makes the budget line _good news_: AI price-performance is improving at **at least 30% per year** — the same dollar buys meaningfully more model output every year, and that curve looks set to run for a decade or more. Token prices keep falling while capability keeps rising. So the $500 an agency budgets today buys next year what $650+ buys now, and compounds from there. This is the only line item in your business that gets 30% cheaper annually while getting better. You figure out what that means for whether $500 a month is expensive.

## The honest caveats

- **We weren't Claude-only.** Gemini and GPT ran alongside — research, drafts, second opinions. But none of them got paid like Claude did, because none of them were trusted with the production work.
- **Your burn will differ.** Sloppy prompting burns tokens on wrong turns; tight scoping stretches them. Our ten hours were practiced hours.
- **This is one agency's week, not a benchmark study.** We published it because one real data point beats zero, which is what existed when we searched.

---

**Want the output side of this math applied to your business?** Those credit-hours went into [getting clients cited by AI engines](/blog/how-to-get-recommended-by-chatgpt-gemini-perplexity-claude) and [deploying stuck projects](/blog/you-built-it-with-ai-now-deploy-it). [Book a free consultation](/contact) — the first four booked from this site are free.
