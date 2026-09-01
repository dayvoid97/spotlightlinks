---
title: 'What AI Actually Costs a Small Agency in 2026: Our Stack, Our Bill'
subtitle: 'Everyone publishes token prices. Nobody publishes what a working agency actually spends. Here is our multi-model stack, what each model is for, when the burn spikes, and how to budget it — from the agency that just learned $100 lasts six days.'
date: '2026-07-29'
author: 'Kanchan Sharma'
image: '/blog/ai-costs/claude-credit-burn.svg'
categories:
  - AI Costs
  - Agency Life
  - Strategy
  - Real Data
---

A small agency primarily servicing web assets should budget **$500 per month** in AI model credits, and one servicing ten should plan on **roughly $1000**. Those numbers come from [our own measured burn](/blog/how-long-does-100-dollars-claude-credits-last) — $100 of Claude credits gone in under a week of real client work — not from a pricing page.

This post is the budgeting picture around that number: what we run, what each model is actually for, and where the money goes when it goes fast.

## The stack: three models, one payroll

We use Claude, Gemini, and GPT daily. They are not interchangeable, and pretending one model does everything is how you overspend on the wrong one.

**Claude (Fable 5, via Claude Code) — the one that gets paid.** Most of the production code, multi-file builds, deployments, schema architecture, anything where the model works _inside_ a real repository for an hour at a stretch. This is where nearly all our credit spend goes, because agentic coding is where volume lives: the model reads files, edits, runs builds, reads the output, and reasons over all of it, continuously. It's also simply the one we trust with work that ships to clients.

**Gemini — research and reach.** Long-context reading, summarizing big documents, second opinions on strategy, and anything adjacent to the Google ecosystem we're optimizing clients into anyway.

**GPT — drafts and breadth.** Quick copy passes, brainstorming, utility tasks. Fast, fine, everywhere.

The honest summary from our ledger: _some Gemini, some GPT — but none of them got paid like Claude did._ Budget accordingly: if your agency builds and deploys, expect 70–85% of AI spend to land on whichever frontier model does your agentic coding.

## Where the burn actually spikes

Credits don't drain evenly. Four patterns from our logs:

1. **Agentic sessions, not chat.** An hour of Claude Code on a real repo costs an order of magnitude more than an hour of asking questions. The model isn't responding — it's working, with full context reloaded on every step. This is the single biggest line item and the one token-price math never prepares you for.
2. **Deployment weeks.** Moving a build from [localhost to production](/blog/you-built-it-with-ai-now-deploy-it) means the model reads logs, DNS states, and build output across many services. Interleaved context is expensive context.
3. **Audit onboarding.** A new client's first week — reading their whole site, their schema, their crawler configuration — front-loads a month's worth of reading into days.
4. **Bad scoping.** Don't hangover-code. It's not worth it.

## How to budget it, practically

- **Price it per client, not per month.** Our rule of thumb from measured data: **$100 of model spend per actively serviced client asset per month**. This number is only bound to increase.The good part - client is getting the best, on time, and assets are performing better than expected. We'd love to rack it up to 500 per asset per month - Spotlight Links is slowly getting htere.
- **Treat credits as cost of goods sold, not overhead.** The spend maps directly to billable output. When we burned a hundred dollars in API credits, the work output produced was easily billed at several multiples — which is why the reorder took thirty seconds of deliberation.
- **Don't shop the stack on price.** The delta between models is a few dollars per million tokens. The delta in output quality on production work is your reputation. We pay Claude more because the work it ships is the work we'd sign. In plain words - pay for the best model and pay good. Don't be cheap.
- **Watch effective $/hour, not tokens.** This is early KPI numbers. What's our cost per hour of dedicated and state-of-the-art agentic work. How can we make it even better. Always ask questions and keep records.

## Models only get better

Here's the piece that changes the planning math entirely: **AI price-performance improves more than 30% per year.** Bleeding edge AI is going to cost less and perfornm better next year compared to today. Every year, the same dollar buys more work out and better, from a smarter model. There's plenty of runway because this is only the beginning.

Run that forward on our numbers. We are expecting our AI bill to to reach a few thousand this month. We are currently a 5-client agency and are looking to add 5 more for Q3 2026.

## The caveats, as always

This is one agency's operating data, published because zero others were findable when we searched. Your mix of build-work versus advisory work moves every number here. And model pricing changes — check current rates before quoting our figures at your accountant.

---

**Want this leverage pointed at your business instead of reading about ours?** The credits go into [AEO/GEO programs](/blog/how-to-get-recommended-by-chatgpt-gemini-perplexity-claude), builds, and [deployments](/faq/can-you-deploy-my-ai-built-project) for clients. [Book a free consultation](/contact) — the first four from this site are free.
