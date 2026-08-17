# Theming (Light / Dark / System)

Frontend only — no `xsl-backend` involvement.

Source: `src/index.css` (token definitions), `src/context/theme-context.tsx` (the switch),
`src/components/ThemeToggle.tsx` (the control), `index.html` (anti-flash script).

## How the switch recolors the whole app from one attribute

The design system in `src/index.css` is built on **semantic CSS variables** — `--color-surface`,
`--color-ink`, `--color-line`, `--color-brand-tint`, etc. — defined in the `@theme` block. Light
is the base `:root` palette. Dark mode doesn't restyle anything component-by-component; it just
**re-points those same variables** to darker values under a `data-theme` attribute on `<html>`.
Because every Tailwind utility built from a token (`bg-surface`, `text-ink`, `border-line`, …)
compiles to `var(--color-*)`, flipping the variable recolors every one of them at once, at runtime,
with zero per-component work.

## Three states

Set by `ThemeProvider` (`src/context/theme-context.tsx`) as the `data-theme` attribute on the
`<html>` element:

| Stored choice | `data-theme` | Result |
|---|---|---|
| `'light'` | `light` | Forced light — base `:root` tokens win. |
| `'dark'` | `dark` | Forced dark — the `:root[data-theme='dark']` block in index.css applies. |
| `'system'` (default) | *(attribute removed)* | Follows the OS via `@media (prefers-color-scheme: dark)`. |

The CSS side of this lives at the bottom of `src/index.css`. Note the media-query selector is
`:root:not([data-theme='light'])`, not a bare `:root` — that's what lets an explicit **light**
choice override a dark OS setting, instead of the OS always winning. The dark token block is
duplicated between the explicit and system selectors on purpose (a plain attribute selector and a
media-query selector can't be merged into one rule); a comment there flags that they must be kept
in sync.

## Persistence and no flash of the wrong theme

- The choice is stored in `localStorage` under the key `theme`.
- A tiny inline script in `index.html` reads that key and sets `data-theme` **before React mounts**,
  so the first paint is already in the right theme — no flash. It only applies an explicit
  light/dark value; `system`/unset is left off so the media query decides.
- `ThemeProvider` re-applies the attribute on mount (staying the source of truth thereafter) and
  keeps `localStorage` in sync whenever the choice changes.
- While in `system` mode, the provider listens for OS changes via a `matchMedia` `change` listener,
  so `resolvedTheme` stays correct if the user flips their OS appearance with the app open.

## The `useTheme()` hook

```ts
const { theme, resolvedTheme, setTheme, toggle } = useTheme()
```

- `theme` — the stored preference, including `'system'`.
- `resolvedTheme` — `'light'` or `'dark'`, with `'system'` resolved against the current OS setting.
  Use this for anything that needs to know what's actually on screen (e.g. picking a sun vs. moon
  icon).
- `setTheme(choice)` — set `'light' | 'dark' | 'system'` explicitly.
- `toggle()` — flip to the opposite of `resolvedTheme` and make it explicit. This is what the
  header button calls: the `'system'` default holds only until the user first expresses a
  preference, which is the conventional behavior.

## The control

`<ThemeToggle />` is a single sun/moon flip button, placed in both headers — the authenticated
console (`src/components/Layout.tsx`) and the public homepage (`src/pages/HomePage.tsx`
`SiteHeader`). It's deliberately styled with the **semantic tokens** (`border-line`, `bg-surface-2`,
`text-ink`) so the button itself renders correctly in whichever theme it's switching between.

## Component token migration (done)

An earlier build of these components used a dark-only palette (`bg-ink-950`, `gradient-bar`,
`text-violet-glow`, `text-white` headings, `text-gray-*`, …) that predated the current `@theme`
and wasn't defined in it — so in light mode those elements rendered white-on-white or with no
fill at all. Every component in `src/` has since been migrated onto the semantic tokens, so the
whole app now themes from the single `data-theme` flip:

| Old (dark-only) | New (semantic) |
|---|---|
| `bg-ink-950` | `bg-surface` |
| `bg-ink-900` / `-800` / `-700` / `-600` | `bg-surface-2` |
| `border-ink-border`, `divide-ink-border` | `border-line`, `divide-line` |
| `text-white` (headings on a surface) | `text-ink` |
| `text-gray-300` / `-400` / `-500` / `-600` | `text-ink-70` / `-50` / `-50` / `-30` |
| `gradient-text`, `text-violet-*` | `text-brand` |
| `gradient-bar`, `bg-violet-glow` | `bg-brand` |
| `bg-violet-500/10`, `/15` | `bg-brand-tint` |
| `border-violet-*` | `border-brand` |

The one deliberate exception: `text-white` is kept where an element sits on a **solid colored
fill** (the brand-red logo circles, active nav pills, and the primary/danger buttons). That's not
a theme token — it's white-on-brand contrast that's correct in both light and dark, so it stays
literal rather than becoming `text-ink`.

Status colors (`text-emerald-*`, `text-red-*`, `text-amber-*`, `text-cyan-*` on Alerts and Badges)
were intentionally left on Tailwind's fixed palette — they read as success/error/warning/info in
both themes and aren't meant to change with the brand palette.

The payoff: because everything now reads `var(--color-*)`, adding or retuning a theme is a
variable-only change in `index.css` — no component edits.
