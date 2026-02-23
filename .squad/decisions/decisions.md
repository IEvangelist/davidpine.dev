# Decisions Log

---

## Decision: Phase 1 reveal.js Quick Wins

**Author:** Dallas (Frontend Dev)
**Date:** 2026-02-22
**Status:** Implemented

### What Changed

1. **Slide numbers** (`c/t` format) enabled in full viewer, disabled in preview thumbnails.
2. **Hash navigation** enabled in full viewer (`hash: !preview`) — supports speaker view sync and URL-based slide linking.
3. **Zoom plugin** loaded dynamically, non-preview only — Alt+click to zoom into slide elements.
4. **Search plugin** loaded dynamically, non-preview only — Ctrl+Shift+F to search slide content.
5. **Touch support** explicitly enabled (`touch: true`).
6. **Instruction bar** updated to mention Overview (O) and Speaker Notes (S) shortcuts.

### Why

These are low-risk, high-value features already bundled with reveal.js. Gating plugins behind `!preview` keeps thumbnail rendering fast. Hash navigation is prerequisite for speaker view to work correctly.

### Files Modified

- `src/components/slide/slide-viewer.tsx`
- `src/pages/slides/[slug].astro`

---

## Decision: ResizeObserver + Custom Event for reveal.js Relayout

**Author:** Dallas (Frontend Dev)
**Date:** 2026-02-22
**Status:** Implemented

### Context

reveal.js in embedded mode (`embedded: true, width: "100%", height: "100%"`) calculates its internal layout dimensions once at initialization. It does NOT automatically relayout when its container changes size. This caused slides to render at stale dimensions after browser resize or expand/collapse transitions.

### Decision

1. **`ResizeObserver` in `slide-viewer.tsx`** — Observes `deckRef.current` and calls `revealRef.current.layout()` with a 100ms debounce whenever the container resizes.
2. **Custom `reveal-relayout` event** — The `[slug].astro` page dispatches `window.dispatchEvent(new Event('reveal-relayout'))` after CSS `transitionend` on the slide container. The React component listens for this event as a belt-and-suspenders measure alongside the ResizeObserver.
3. **Gated on `isInitialized`** — The ResizeObserver effect only activates after reveal.js is fully initialized, preventing premature layout calls.

### Rationale

- `ResizeObserver` is more accurate than `window.resize` for embedded containers that may not track window dimensions directly.
- The custom event ensures correctness after CSS transitions complete, even if the browser's ResizeObserver implementation batches observations across the transition boundary.
- 100ms debounce prevents excessive `layout()` calls during animated transitions (0.3s CSS transition fires multiple observations).

### Files Changed

- `src/components/slide/slide-viewer.tsx` — New `useEffect` with ResizeObserver + custom event listener
- `src/pages/slides/[slug].astro` — `transitionend` handler dispatching `reveal-relayout`

---

## Proposal: reveal.js Feature Enhancements

**Author:** Lambert (UX/Design)
**Date:** 2026-02-22
**Status:** Proposed (Phase 1 implemented by Dallas)
**Requested by:** David Pine

### Recommended Implementation Order

#### Phase 1 — Quick Wins (Implemented)
1. Enable `slideNumber: 'c/t'` in viewer mode
2. Enable `hash: true` in viewer mode (enables speaker view + URL navigation)
3. Load **Zoom** plugin
4. Load **Search** plugin
5. Update instruction bar: "Arrow keys to navigate • **O** overview • **S** speaker view • **E** expand • **Esc** exit"
6. Add `touch: true` explicitly

#### Phase 2 — Content Features (Pending)
7. Load **Math/KaTeX** plugin (conditionally based on frontmatter)
8. Document per-slide backgrounds in a README or example
9. Add vertical slide examples to the demo deck

#### Phase 3 — Polish (Pending)
10. Auto-Animate documentation and testing with Markdown plugin
11. PDF export button + non-embedded route
12. Auto-slide support with play/pause UI

#### Phase 4 — Future / Evaluate
13. Multiplexing (requires infrastructure)

### Key Insight

The biggest bang for the buck is Phase 1 — it requires no content changes, no schema changes, and makes every existing and future presentation immediately more professional. The Zoom, Search, slide numbers, and speaker view are features David will use in every talk.
