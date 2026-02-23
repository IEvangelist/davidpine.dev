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

### 2026-02-22 — Phase 1 reveal.js UX Review
- **Slide numbers (`c/t`):** Properly gated — `preview ? false : 'c/t'`. Existing `.slide-number` CSS already uses `--theme-accent`, transparent bg, inherited font. Consistent with terminal theme. ✅
- **Hash mode:** `hash: !preview` — correctly off in preview. Concern: enables browser history entries per slide, which can trap the back button. Noted as tradeoff in decision inbox.
- **Zoom plugin:** Gated behind `!preview`. Alt+click is a power-user feature, intentionally omitted from instruction bar to keep it clean.
- **Search plugin:** Gated behind `!preview`. Added custom CSS for `.searchbox`, `.searchinput`, `.searchresults` to match terminal theme (accent border, theme bg, inherited font, rounded corners). Default reveal.js styles would have clashed.
- **Touch config:** Changed `touch: true` → `touch: !preview`. Preview cards already have `pointer-events: none` so functionally identical, but semantically cleaner.
- **Instruction bar fixes:** (1) Added `Ctrl+Shift+F` search shortcut. (2) Shortened phrasing ("Arrow keys to navigate" not "Use arrow keys or click to navigate"). (3) Split into `.instructions-desktop` / `.instructions-mobile` with media query toggle — mobile shows only "Swipe to navigate • E expand • Esc exit". (4) Added `font-size: 0.8em` and `white-space: nowrap` to `<kbd>` for tighter fit.
- **Preview mode isolation:** Verified SlideCard has `pointer-events: none` — all interactive features (touch, zoom, search, hash) are irrelevant in preview. No regression.

### 2026-02-22 — Phase 2: Vertical Slides & Per-Slide Backgrounds
- **Vertical slides demo:** Added one vertical sub-slide after "Astro: GitHub Stats 🚀" using `--` separator. Drills down into what the numbers mean (stars vs Next.js, contributor velocity, real adoption, weekly releases). `data-separator-vertical="^--$"` was already configured in `slide-viewer.tsx`.
- **Per-slide background:** Added `<!-- .slide: data-background-color="#1a1a2e" -->` to "The Lesson" slide — a dark navy background that creates visual contrast for the dramatic moment before the conclusion. reveal.js Markdown plugin parses these HTML comment attributes natively.
- **Vertical navigation CSS:** Added styles for `.navigate-down` and `.navigate-up` buttons using `--theme-accent`. Added a subtle `bounce-down` animation on `.navigate-down.enabled` to hint that users can scroll down. Animation is gentle (2s ease, 4px travel).
- **Instruction bar update:** Changed "Arrow keys to navigate" → "Arrow keys ↑↓←→ to navigate" with a `.arrow-hint` span for subtle letter-spacing. The arrows communicate that both horizontal and vertical navigation exist.
- **Pre-existing TS warnings:** `[slug].astro` has 4 "possibly null" warnings on `slideContainer`/`slidePage` — these are false positives (guarded by early return). Not my changes.