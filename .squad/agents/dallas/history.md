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
- **Phase 2 Math/KaTeX plugin (2025-02-22):** Added `math` and `slideNumber` boolean fields to slides schema in `content.config.ts`. In `slide-viewer.tsx`, added `math` and `slideNumber` props. Math plugin (`reveal.js/plugin/math/math.esm.js`) is dynamically imported only when `math === true` — NOT preview-gated since math should render in thumbnails too. KaTeX CSS loaded from CDN on demand with dedup check via `data-katex-css` attribute. `slideNumber` prop controls whether slide numbers appear (defaults to `true`, renders as `'c/t'`). Props threaded through `[slug].astro` and `SlideCard.astro`. Pattern: opt-in schema fields with sensible defaults let existing content work unchanged.
- **Phase 3 Auto-Animate + Auto-Slide (2026-02-22):** Auto-animate is a core reveal.js feature (no plugin). Added `autoAnimateEasing: 'ease'`, `autoAnimateDuration: 1.0`, and `autoAnimateUnmatched: true` as global defaults in the Reveal config. Authors opt-in per slide via `<!-- .slide: data-auto-animate -->` in markdown — no schema field needed. Auto-slide adds `autoSlide: z.number().default(0)` to the slides schema (milliseconds, 0 = disabled). In `slide-viewer.tsx`, `autoSlide` prop is passed to Reveal config, gated behind `!preview` so thumbnails don't auto-advance. A `reveal-autoslide-toggle` custom event listener lets the Astro page toggle auto-slide on/off via `revealRef.current.configure()`. In `[slug].astro`, a play/pause button (▶/⏸ SVG icons) appears in the slide header only when `autoSlide > 0`, with `A` key shortcut. Instruction bar conditionally shows the `A` key hint. Pattern: custom window events cleanly bridge Astro script blocks and React component state without prop drilling.