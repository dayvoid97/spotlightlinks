---
title: 'Why Your AI-Built App Works on Localhost but Breaks in Production'
subtitle: The seven failures we see in almost every AI-assisted build, in the order they usually appear — from the environment variables that vanish at build time to the CORS error that only shows up on the real domain.
date: '2026-07-29'
author: Kanchan Sharma
image: '/blog/deploy/localhost-to-live.svg'
categories:
  - Deployment
  - AI Development
  - Technical
---

An app that runs perfectly on your machine and dies on deploy isn't broken — it's *specialized*. Every AI coding assistant optimizes for the fastest path to "it works in front of you," and that path quietly bakes in assumptions that are only true on your laptop.

We deploy AI-built projects for clients regularly. The same seven failures account for nearly all of it, and they arrive in a predictable order. Here they are, with what each error actually looks like — so whether you fix it yourself or [hand it to us](/contact), you at least know what you're looking at.

## 1. The production build fails before anything else happens

`npm run dev` is forgiving. `npm run build` is not.

Dev mode skips or softens type checking, tolerates unused imports, and lazily compiles only the page you're looking at. The production build compiles *everything, strictly*. So the very first deploy attempt usually dies in minutes with TypeScript errors, ESLint failures, or imports of packages that were never actually installed — in code that "worked" for weeks.

**What it looks like:** a wall of red in the build log ending in `Command "npm run build" exited with 1`.

**The fix:** run `npm run build` locally *before* deploying, and fix what it reports. This one command, run early, would save most people days.

## 2. Environment variables don't exist on the server

On your machine, secrets live in a `.env` file — or worse, hardcoded in the source, which AI assistants do constantly because it makes the demo work.

Your hosting provider has never seen that file. It's (correctly) gitignored, so it never leaves your laptop. Every API call that depends on those keys returns `undefined` credentials and fails.

**What it looks like:** the app deploys, loads, and every feature that touches an external service — AI APIs, payments, email — silently fails or throws 500s.

**The fix:** move every secret to environment variables, then set those variables in the hosting dashboard. In Next.js, remember only `NEXT_PUBLIC_*` variables reach the browser; the rest are server-only, which is exactly what you want for API keys.

## 3. The database is a file on your laptop

AI assistants love SQLite for prototypes, and rightly — zero setup. But that database *is a file on your computer*. Deploy the app and the file either doesn't exist on the server or gets wiped on every redeploy, because most modern hosting has an ephemeral filesystem.

**What it looks like:** the deployed app works until anyone saves anything, or data mysteriously vanishes after each redeploy.

**The fix:** a managed database — Postgres on Neon or Supabase, or similar — with the connection string in an environment variable and your schema migrated. This is usually the biggest single chunk of deployment work.

## 4. `localhost` is hardcoded somewhere

Somewhere in your code there's a `fetch('http://localhost:3000/api/...')` — the AI wrote it to make the prototype work. On the deployed site it points at a server that doesn't exist (or, entertainingly, at whatever is running on the *visitor's* machine).

**What it looks like:** features that work in dev return network errors in production; the console shows requests to `localhost` from a live website.

**The fix:** relative URLs for same-app calls (`/api/...`), and a `NEXT_PUBLIC_SITE_URL` environment variable anywhere an absolute URL is genuinely required.

## 5. CORS only breaks on the real domain

On localhost, your frontend and backend often share an origin, so the browser's cross-origin rules never fire. Deploy them — especially to different subdomains — and suddenly the browser blocks requests the AI never had a reason to configure for.

**What it looks like:** `Access to fetch at '…' has been blocked by CORS policy` in the console, on the live site only, while everything still works locally.

**The fix:** explicit allowed-origin configuration on the backend, listing your real domain. Not `*` — that disables the protection instead of configuring it.

## 6. Email works in testing and vanishes in production

Your app sent email fine in development — to *you*, from a test address. In production, mail sent from an unverified domain goes straight to spam, or is refused outright. AI assistants wire up the sending code and skip domain verification entirely, because verification lives in DNS, not in code.

**What it looks like:** password resets and contact forms "work" — no errors — but nothing ever arrives.

**The fix:** a transactional email service with your domain verified via the SPF and DKIM records they give you. Twenty minutes of DNS work that no amount of code can substitute for.

## 7. It deploys — and nobody can find it, including the AI engines

The app is live. It's also invisible: no metadata, no sitemap, no structured data, not indexed by Google, let alone Bing or Brave. For a business, undiscoverable and undeployed are the same state with different hosting bills.

This is where deployment stops being purely technical and becomes [the visibility work we write about constantly](/blog/how-ai-answer-engines-choose-citations): indexing across all three engines that power AI search, answer-structured content, entity signals. We wire the foundations — metadata, sitemap, schema, Search Console, analytics — into every deployment on day one, because retrofitting it later costs more and ranks slower.

## The pattern behind all seven

Notice what these have in common: **none of them are application-code bugs.** Your AI-built features are probably fine. The failures live in the seams between your code and the world — builds, environments, data, DNS, browsers, deliverability, discoverability.

That's also why the fix is fast for someone who does it weekly. These aren't seven mysteries; they're seven checklist items.

---

**Want them handled?** We deploy AI-built projects in about a week, in your accounts, with the search foundations included. [Book a free consultation](/contact) — bring the repo, and we'll diagnose it on the call. The first four calls from this site are free.
