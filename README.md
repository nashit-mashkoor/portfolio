# portfolio — terminal edition

A terminal-emulator style single-page portfolio: boot sequence, command prompt,
phosphor themes, CRT effects, and a registry-driven command engine. Original
implementation modeled on the UX patterns of classic terminal portfolios.

## Stack

Vite + React 19 + TypeScript (strict). Static SPA — the production build emits
plain files to `dist/`. No backend, no runtime network calls, system monospace
font stack only.

## Commands

```bash
npm install        # install deps
npm run dev        # dev server
npm run build      # type-check (strict) + production build to dist/
npm run preview    # serve dist/ locally
npm run lint       # eslint (type-checked)
```

## Editing content

All site content (identity, bio, socials, skills, projects, résumé link) lives
in **`src/content.ts`**. Placeholder values are marked `// PLACEHOLDER:` and
render with obvious `[placeholder]` markers. No other file needs touching for a
content pass.

## Terminal features

- Skippable BIOS-style boot sequence (any key/click)
- Commands: `help`, `about`, `projects`, `project <id>`, `skills`, `contact`,
  `resume`, `themes`, `theme <name>`, `crt [on|off]`, `sound [on|off]`,
  `whoami`, `clear` (+ hidden easter eggs)
- History recall (↑/↓) and Tab completion
- 5 phosphor themes (green/amber/ice/paper/plasma), persisted in localStorage
- CRT scanlines/flicker/vignette, toggleable; `prefers-reduced-motion` disables
  flicker/typing animations
- WebAudio-synthesized keypress/beep sounds (off by default)
- Touch-friendly command chips below 768px / coarse pointers
