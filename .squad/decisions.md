# Decisions

_Team decisions are recorded here. Append-only._

---

## Math/KaTeX Plugin — Not Preview-Gated

**Date:** 2026-02-22  
**Author:** Dallas (Frontend Dev)  
**Phase:** 2

The reveal.js Math plugin is loaded whenever a slide deck has `math: true` in frontmatter, regardless of whether it's in preview (thumbnail) or full viewer mode. Math expressions are visual content — if a slide preview contains `$E = mc^2$`, it should render correctly in the thumbnail, not show raw LaTeX. Zoom and Search are interactive features that don't affect rendering, so gating those behind preview mode made sense. Math is different.

**Schema Additions:**
- `math: z.boolean().default(false)` — opt-in per deck, avoids loading KaTeX CSS/plugin for decks that don't need it
- `slideNumber: z.boolean().default(true)` — allows authors to hide slide numbers per deck

**KaTeX CSS Strategy:** Loaded from CDN (`cdn.jsdelivr.net/npm/katex@latest/dist/katex.min.css`) on demand with a dedup check (`data-katex-css` attribute on the `<link>` tag).

---

## Auto-Animate Config + Auto-Slide Architecture

**Date:** 2026-02-22  
**Author:** Dallas (Frontend Dev)  
**Phase:** 3

### Auto-Animate — Global Defaults, Content-Driven Opt-In

Auto-animate is a core reveal.js feature (no plugin needed). Rather than adding a schema field, the config sets global animation defaults (`autoAnimateEasing: 'ease'`, `autoAnimateDuration: 1.0`, `autoAnimateUnmatched: true`). Individual slides opt-in via the standard reveal.js markdown attribute syntax:

```markdown
<!-- .slide: data-auto-animate -->
```

This is purely content-driven — no frontmatter change needed. The defaults apply universally to any deck that uses the attribute.

### Auto-Slide — Schema-Driven with Preview Gating

Added `autoSlide: z.number().default(0)` to the slides schema. The value is in milliseconds (e.g., `autoSlide: 5000` for 5-second auto-advance). Zero means disabled.

**Preview gating:** Auto-slide is disabled in preview/thumbnail mode (`autoSlide: preview ? 0 : value`). Thumbnails shouldn't auto-advance.

**Toggle pattern:** Uses `reveal-autoslide-toggle` custom window event. The Astro `[slug].astro` page dispatches this event from a play/pause button (and `A` key shortcut). The React `SlideViewer` listens for it and calls `revealRef.current.configure({ autoSlide: 0 | originalValue })` to toggle. This is the same Astro ↔ React event bridge pattern used for `reveal-relayout`.

**UI:** Play/pause button only renders when `autoSlide > 0`. Styled consistently with expand button. Instruction bar conditionally adds `A` key hint.

---

## PDF Export — Print Mode via Query Parameter

**Date:** 2026-02-22  
**Author:** Lambert (UX/Design)  
**Phase:** 3

PDF export uses reveal.js's native `?print-pdf` mechanism. A print button in the slide header opens the same slide URL with `?print-pdf` appended in a new tab. The Astro page detects this query parameter at build/render time and switches to a dedicated print layout.

**How It Works:**
1. **Normal mode:** Embedded viewer with header, instruction bar, expand/collapse — unchanged.
2. **Print mode (`?print-pdf`):** Full-viewport layout, no chrome. SlideViewer receives `embedded={false}` so reveal.js renders in standalone mode. The browser's native Print dialog (Ctrl+P) then produces a PDF with correct page breaks.

**Key Design Choices:**
- `embedded={false}` for print — reveal.js's `?print-pdf` layout only works in non-embedded mode.
- `pdfSeparateFragments: false` — keeps all fragment steps on the same page.
- `transition: "none"` in print — prevents visual artifacts during layout phase.
- Print button styled like expand button — same border-accent pattern, hover fill, scale transform.
- New `.slide-header-buttons` container — all header action buttons (autoslide, print, expand) in a single flex row with consistent spacing.

**Tradeoffs:**
- SSG compatible — `Astro.url.searchParams` check works for both SSG and SSR.
- No dedicated `/print/` route — simpler, minimal impact from unused JS loading in print mode.

---

## Phase 1 reveal.js UX Review

**Date:** 2026-02-22  
**Author:** Lambert (UX/Design)  
**Re:** Dallas's Phase 1 quick wins implementation

**Verdict:** Overall quality is solid. Feature gating (preview vs full mode) is correct.

**Fixes Applied:**
1. Instruction bar — mobile responsive split (`.instructions-desktop` / `.instructions-mobile`, toggled via `@media (max-width: 767px)`)
2. Search plugin overlay styling — custom CSS to match terminal theme (`--theme-background`, `--theme-accent`, top-right positioning)
3. Touch config cleanup — `touch: true` → `touch: !preview` for semantic consistency

**UX Concern — Hash Mode and Browser Back Button:** Each slide advance pushes to browser history, so Back steps through slides instead of returning to the listing page. Current behavior is standard reveal.js and acceptable; monitor user feedback.

---

## Vertical Slide Indicators + Per-Slide Background Approach

**Date:** 2026-02-22  
**Author:** Lambert (UX/Design)  
**Status:** Implemented

**Decisions Made:**
1. **Vertical navigation bounce animation** — 2s ease, 4px travel `bounce-down` animation on down arrow using `--theme-accent` color. Non-intrusive.
2. **Per-slide background syntax** — HTML comment attribute syntax: `<!-- .slide: data-background-color="#1a1a2e" -->`, must be first line after `---` separator.
3. **Arrow key hint in instruction bar** — Changed to "Arrow keys ↑↓←→ to navigate" to communicate all four directions are valid.

No schema changes needed — these are Markdown-level features, not frontmatter.
---

## PDF Export — Client-Side Print Detection (Correction)

**Date:** 2026-02-23  
**Author:** Dallas (Frontend Dev)  
**Supersedes:** Phase 3 "PDF Export — Print Mode via Query Parameter" (server-side detection claim)

The original decision stated `Astro.url.searchParams` works for SSG. This is incorrect — during static site generation the URL has no query string, so the check always returns `false`. Print mode never activated.

**Fix:** Detection moved entirely to the client side:
- `slide-viewer.tsx` reads `window.location.search` for `?print-pdf` and overrides `embedded` to `false`.
- `[slug].astro` uses an `initPrintMode()` script that checks `window.location.search`, hides header/instructions, and applies full-viewport layout via CSS class toggles.

All other print-mode design choices (no chrome, `pdfSeparateFragments: false`, `transition: "none"`) remain unchanged.