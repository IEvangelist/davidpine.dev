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
