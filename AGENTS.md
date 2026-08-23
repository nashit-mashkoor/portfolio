# AGENTS.md

Terminal-emulator portfolio SPA. Vite + React 19 + TypeScript (strict), plain
static build to `dist/`. The previous Next.js + react-three-fiber
implementation was fully removed; git history preserves it.

## Commands

- `npm install` — install
- `npm run dev` — dev server
- `npm run build` — `tsc --noEmit` (strict) + `vite build` → `dist/`
- `npm run preview` — serve the production build
- `npm run lint` — ESLint (type-checked flat config)

## Project notes

- ALL user-visible content lives in `src/content.ts` (identity, bio, socials,
  skills, projects, résumé). Placeholder values carry a `// PLACEHOLDER:`
  comment and render with `[placeholder]` markers; a content pass should touch
  only that file.
- Theme palettes are defined twice by design: CSS custom properties in
  `src/styles.css` (`[data-theme=…]` blocks) are the source of truth for
  rendering; theme NAMES must stay in sync with `src/themes.ts`.
- Command set lives in `src/commands.ts` (registry-driven); hidden easter-egg
  commands are flagged `hidden: true` there.
- No backend, no runtime network calls, no CDN fonts (system monospace stack),
  no analytics.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
