# Lambert — History

## Context
- **Project:** davidpine.dev — terminal-inspired Astro blog by David Pine (@IEvangelist)
- **Stack:** Astro 5, React, TypeScript, Tailwind CSS 4, MDX, reveal.js
- **User:** David Pine, Senior Software Engineer at Microsoft
- **Focus:** Slides UX improvements — resize bug fix, reveal.js feature expansion

## Key Files
- `src/components/slide/SlideCard.astro` — Card has `h-48` fixed height with `overflow-hidden`
- `src/components/slide/SlidesPage.astro` — Grid layout for slide cards
- `src/pages/slides/[slug].astro` — Expanded/collapsed CSS states for slide viewer
- `src/styles/global.css` — Global styles and CSS custom properties

## Known Issues
- Slide thumbnails don't resize when container size changes
- Preview mode uses absolute positioning that may not respond to container resize
- reveal.js instances in preview mode initialized with `width: "100%"` and `height: "100%"` but may need explicit resize handling

## Learnings
### 2026-02-22 — reveal.js Feature Audit
- **Current plugins:** Only Markdown, Highlight, Notes are loaded in `slide-viewer.tsx`
- **Reveal config:** `embedded: true`, `hash: false`, `width/height: "100%"` — embedded mode may limit some features (PDF export, speaker view sync)
- **Speaker view:** Notes plugin is loaded but `hash: false` prevents proper speaker view sync. Need `hash: true` in viewer (not preview) mode.
- **Slide numbers:** CSS for `.slide-number` already exists in `[slug].astro` — the styles are ready, just need `slideNumber: true` in config
- **Zoom/Search plugins:** Available in reveal.js npm package, zero-config to add
- **Overview mode (O key):** Already works in reveal.js core, just undocumented in the instruction bar
- **Math/KaTeX:** KaTeX is already a project dependency (`katex: ^0.16.25`). reveal.js has a built-in Math plugin that can use KaTeX.
- **Auto-Animate:** Core reveal.js feature, no plugin needed. Works via `data-auto-animate` slide attributes. Needs testing with Markdown plugin separator approach.
- **Vertical slides:** `data-separator-vertical="^--$"` is configured but no example content uses it
- **Fragments:** Used extensively in example deck — `class="fragment"` on `<li>` and `<p>` elements
- **Touch nav:** May need explicit `touch: true` since `embedded: true` could interfere
- **Content schema:** `content.config.ts` defines slides with theme (12 enum values), transition, controls, progress. Schema will need new fields for slideNumber, math, hash, autoSlide.
- **Proposal written to:** `.squad/decisions/inbox/lambert-revealjs-features.md`