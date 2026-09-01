---
title: "1000+ Reviews and Gemini Still Won't Recommend Your Business: Why Google Maps Alone Won't Get You Recommended"
subtitle: 'We probed one of the most-reviewed businesses in its category in New York — Thousands of reviews, a 4.7 average, and an SEO agency already on retainer — across 200 answer-engine runs. It was mentioned in 13% of them and cited in exactly zero. Here is what the data says actually decides who AI recommends.'
date: '2026-09-01'
author: 'Kanchan Sharma'
image: '/mediasets/barely-visible.jpeg'
categories:
  - Real Data
  - Case Study
  - AEO
  - GEO
  - Local Business
  - Gemini
---

You might have thousands of five-star reviews. In 2026 that no longer guarantees you the customer.

Someone better optimized than you — with a fraction of your reviews — can take the job, because the field where the decision happens has moved. It is not only Google anymore, and Google Maps is not the only answer surface anymore. Yelp was the reflex for restaurants a decade ago; it isn't now. The aggregator layer keeps shifting, and every shift resets who gets named when a customer asks a machine a question.

This is not a theory post. It comes out of our own research, run last week.

> **A note on sanitization.** This client is under an active engagement and has not agreed to be named, so the business name, its domain, and the competitors that beat it are withheld. Every number, every query, and every intent label below is verbatim from the probe. Nothing has been rounded in our favor.

## The setup

The subject: a locksmith and door-hardware business operating across Brooklyn, Queens, and greater New York. Long-established. **1000+ Google Maps Reviews reviews at a 4.7 average** — one of the most-reviewed businesses in its category in the city. Real crews, real trucks, decades of trading.

And here is the part that made us want to publish: they are **not neglected**. They had recently been onboarded by an agency that is actively doing SEO for them. Someone competent is being paid, every month, to make this business findable.

We ran a Spotlight Links probe against them: **200 individual answer-engine runs**, across a grid of the questions a real customer in their market actually asks, each question asked three times, across Google Gemini, Claude, and Perplexity.

## What 200 runs came back with

| Metric                              | Result                                                 |
| ----------------------------------- | ------------------------------------------------------ |
| Mention rate                        | **13%** — named in 26 of 200 answers                   |
| Citation rate                       | **0%** — their domain was cited as a source zero times |
| Top-slot rate                       | 10% — the #1 recommendation in 20 answers              |
| Spotlight Links AI Visibility Score | **0.9 / 10**                                           |
| Risk band                           | High Risk — effectively invisible to AI search         |

Read those two top lines together, because the gap between them is the whole story. In 87% of the questions their own customers are asking, the engines recommended someone else. And in the 13% where they _were_ named, not one answer pointed at their website. Directories, aggregators, and third-party lists were narrating this business's reputation to buyers, on the business's behalf, with no link back.

A 4.7 average across 5,000 reviews. Zero citations.

## Where it lost, question by question

These are real prompts from the grid, with the intent bucket each one tests:

| Customer question                                                        | Intent          | Market   | Outcome                              |
| ------------------------------------------------------------------------ | --------------- | -------- | ------------------------------------ |
| "locked out of my apartment in Queens who can open it"                   | Problem first   | Queens   | 0/3 — lost to a citywide competitor  |
| "best locksmith in Queens"                                               | Category & area | Queens   | 0/3 — lost to the same competitor    |
| "same day lock change after break in New York"                           | Urgent          | New York | 0/3 — lost to the same competitor    |
| "locksmith in New York authorized to copy medeco keys"                   | Qualification   | New York | 0/3 — lost to a second competitor    |
| "locksmith in Queens who can program a smart key fob for a honda"        | Long tail       | Queens   | 0/3 — not mentioned at all           |
| "where can i buy baldwin door hardware and get it installed in Brooklyn" | Long tail       | Brooklyn | 0/3 — Gemini named three other shops |

That last one is worth sitting with. Gemini answered it in detail — which showroom to buy from, which locksmith to call, and a genuinely useful aside about mortise locks needing deep pocket cuts and a routing-capable installer. It grounded that answer on 39 sources. Our client — who sells that exact hardware and installs it in that exact borough — was in none of them.

The engine did not fail the customer. It just answered the question using somebody else.

_(Each of those queries carries a wide Wilson confidence interval at three runs — the dashboard flags them "needs more runs" for a reason. Individually they are signals, not verdicts. The 200-run aggregate is the verdict.)_

## Four things the probe surfaced

### 1. Domain age is a real signal

The clearest comparison in the data: the competitors winning these answers hold older domains. Call it digital footprint seniority — a domain with years of continuous, indexed, corroborated history behind it has a materially higher chance of being surfaced by Gemini than a newer one making the same claims.

This is not a new mechanic bolted onto AI search. It is the old one, still running. Domain age mattered for SEO and it matters for [AEO](/blog/why-aeo-geo-matters-now) too. If you have an old domain, that is an asset you may be sitting on without using. If you have a new one, the honest answer is that you buy your way in with structure and answer coverage instead, and it takes longer.

### 2. Content written for SEO is not content written for AEO

When we dug into why a business with this much reputation was not making the cut, the pattern was immediate: their content is very SEO-specific. Keyword-shaped. Written to rank a page, in an era when the page was the product.

Google itself is transitioning from serving ten links to serving an answer. In that world what matters just as much as keywords is **how properly your schema is structured**, **how long you have been publishing**, and — most importantly — **whether your content is written to be an answer at all.**

Marketing copy does not get cited. A specific, confident, first-sentence answer to a question a real person asked does. We wrote about the mechanics of that split here: [why top-ranking Google businesses go missing in ChatGPT and Gemini](/blog/why-google-seo-fails-in-ai-search).

### 3. A mention is not a citation — and citations are the new backlinks

Publishing content is one thing. Whether Gemini or ChatGPT finds it _worth citing_ is another thing entirely, and it is the thing that pays.

**Citations are the new backlinks.** When an engine cites you, you are no longer a name in a list — you are the source the answer was built from, with a link the customer can act on. That difference shows up in revenue: AI-assistant recommendations have been reported converting near **14%**, against roughly **3% or less** for traditional search results. (We keep an honest ledger of that research, including the studies that show a thinner premium in commodity categories, [here](/blog/why-aeo-geo-matters-now).)

Our subject scored 0% on this. Everything their reviews earned them was being spent by somebody else's page.

### 4. Your query grid is the whole ballgame

This is exactly where the probe becomes critical rather than interesting.

A Spotlight Links probe runs 100+ queries and keywords, repeatedly, across Gemini, Claude, and Perplexity — phrased the way a real customer phrases them. Urgent. Problem-first. Qualification. Long tail. Category and area. Not the way a keyword tool phrases them.

Because you can tick every box — reviews, Google Maps presence, domain seniority, a clean site — and still lose, if your content sits there in plain language without ever _solving the need_ the question contains. If it does not answer, it does not get quoted. If it does not get quoted, you do not show up.

## What "we already have someone doing SEO" doesn't cover

Nothing above is a knock on the agency. They are doing the work they were hired to do, and by traditional measures this client is in good shape.

The problem is that the measurement moved. Rankings, impressions, and map-pack position describe a search results page. They say nothing about whether a machine recommends you when a customer asks it a question in plain English — which is the surface where an increasing share of high-intent local demand now gets decided.

You cannot fix what you are not measuring. This client's SEO reporting looked fine. Their AI visibility score was 0.9 out of 10.

## What we actually build after a probe like this

This is precisely why our work for enterprise clients starts where the probe ends:

1. **A few dozen major keywords and queries** — the ones real customers are likely to ask, chosen for untapped potential rather than vanity volume.
2. **The website set up properly**, with the technical foundation the engines need before anything else counts.
3. **Proper schema built for indexing**, so the entity behind the business is unambiguous to a machine.
4. **Analytics in place first**, so we are measuring from day one rather than claiming afterward.
5. **Answers built to be cited** — content engineered so that when an engine composes a response, our client's page is the material it composes from.

That is how a business captures the novelty and the conversion premium the AI engines are currently serving, while the field is still open. It will not stay open. The competitors already winning those Queens and Brooklyn queries are compounding a lead every week.

## Start with the probe

You do not need to take any of this on faith, and you should not. Run the probe on your own business first.

It takes under ten minutes and it answers one question with data: when your next customer asks Gemini, Claude, or Perplexity for exactly what you sell, in exactly the neighborhood you serve — does your name come out of the machine, and does your website come out with it?

For our subject, the answer was 13% and 0%. With 5,000 five-star reviews in the bank.

[Run your AI visibility probe on Spotlight Links →](/get-started) — or read [how the audit engine works](/blog/how-spotlight-links-ai-audit-engine-works) before you do.
