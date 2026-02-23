# Dallas — History

## Context
- **Project:** davidpine.dev — terminal-inspired Astro blog by David Pine (@IEvangelist)
- **Stack:** Astro 5, React, TypeScript, Tailwind CSS 4, MDX, reveal.js
- **User:** David Pine, Senior Software Engineer at Microsoft
- **Focus:** Slides UX improvements — resize bug fix, reveal.js feature expansion

## Key Files
- `src/components/slide/slide-viewer.tsx` — 332-line React component wrapping reveal.js
  - Uses `useRef`, `useState`, `useEffect` for lifecycle management
  - Dynamic theme loading from CDN
  - Preview mode with scaled styles
  - Handles embedded mode with `width: "100%"` and `height: "100%"`
- `src/components/slide/SlideCard.astro` — Preview card using SlideViewer in preview mode
- `src/pages/slides/[slug].astro` — Full slide viewer with expand/collapse functionality
  - Has expand button and keyboard shortcut (E key)
  - CSS transitions for expanded state

## Known Issues
- Thumbnail not resizing when slide is opened then reduced in size
- Preview mode uses `pointer-events: none` which may cause interaction issues

## Learnings
- **ResizeObserver for reveal.js relayout:** When reveal.js is initialized with `embedded: true` and percentage-based `width`/`height`, it calculates dimensions once at init. A `ResizeObserver` on the deck container is required to call `revealRef.current.layout()` on resize. Debounce at 100ms to avoid thrashing.
- **Custom event bridge for Astro ↔ React:** The `[slug].astro` page dispatches a `reveal-relayout` custom event on `window` after CSS `transitionend` from expand/collapse. The React `SlideViewer` listens for this event to ensure layout recalculation after the transition settles.
- **Pattern: useEffect gated on `isInitialized`:** The ResizeObserver effect depends on `isInitialized` state so the observer is only attached after reveal.js is fully initialized. Cleanup disconnects the observer and clears the debounce timer.
- **Pre-existing TS warnings:** `[slug].astro` has nullable element warnings in the inline `<script>` block; they are guarded by an early return and are not regressions.
- **Phase 1 reveal.js quick wins (2025-02-22):** Added `slideNumber: 'c/t'`, `hash: !preview`, and `touch: true` to Reveal config. Dynamically imported Zoom and Search plugins, gated behind `!preview` to keep thumbnails fast. Updated instruction bar in `[slug].astro` with `O` (overview) and `S` (speaker notes) shortcuts using `<kbd>` tags. Pattern: build plugin array incrementally — start with base set, conditionally push extras before passing to Reveal constructor.