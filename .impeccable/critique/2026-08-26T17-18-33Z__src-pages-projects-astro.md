---
target: src/pages/projects.astro
total_score: 24.5
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 0
timestamp: 2026-08-26T17-18-33Z
slug: src-pages-projects-astro
---
Method: dual-agent (A: projects-design-review · B: projects-detector-review)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3/4 | Active navigation, focus, hover, and pressed states are clear; lazy image loading and image failure have no visible state. |
| 2 | Match System / Real World | 3.5/4 | Project names, repository paths, and plain action labels fit a developer portfolio; some specialist names need their description to explain the outcome. |
| 3 | User Control and Freedom | 3.5/4 | Links preserve the catalog in a new tab and the page never traps the visitor; there is no way to jump within or narrow the long catalog. |
| 4 | Consistency and Standards | 4/4 | Every card uses the same visual, content, and action grammar, with standard link semantics and theme-safe tokens. |
| 5 | Error Prevention | 3/4 | There are no destructive actions, but failed screenshots and stale external destinations degrade without a useful local fallback. |
| 6 | Recognition Rather Than Recall | 2.5/4 | Eleven ungrouped projects and unexplained card sizes make visitors infer both category and importance. |
| 7 | Flexibility and Efficiency | n/a | This is an Experience surface with no repeated task workflow. |
| 8 | Aesthetic and Minimalist Design | 2.5/4 | The page is clean and distinctive, but the repeated card anatomy flattens the middle and the ending lacks a deliberate close. |
| 9 | Error Recovery | 2.5/4 | Browser navigation recovers from external exploration, but external-link and image failures have no in-page recovery path. |
| 10 | Help and Documentation | n/a | The portfolio is self-explanatory and has no complex operation requiring documentation. |
| **Total** |  | **24.5/32** | **Good (76.6%)** |

## Design Specificity Verdict

**Specific in content and visual voice; partially interchangeable in editorial logic.** The real project imagery, repository paths, asymmetric composition, theme-aware screenshots, and retro site typography make this recognizably David's portfolio. It does not read like a stock SaaS card wall.

The weak point is the catalog logic. The 7/5, 5/7, 8/4, 6/6, 4/8 span rhythm looks authored, but it does not communicate why one project deserves more space than another. Without a stated hierarchy or grouping principle, the same composition could be applied to almost any developer portfolio.

**Deterministic scan:** the source detector returned zero findings for `src/pages/projects.astro`.

**Browser detector:** the runtime overlay reported seven rule families. Its only plausibly page-specific warning was the combination of a thin card border with a wide shadow; this is a P3 visual-polish signal, not a usability defect. The repeated palette warning collapses many uses of one semantic theme token into separate findings even though the Projects palette passes across the configured themes. Tight footer leading and tracking belong to `src/components/Footer.astro`; the repeating gradient belongs to the global `.section-rule` utility in `src/styles/global.css`; the hidden “Pictures” collision is a closed-navigation false positive; and no Projects source rule could be matched to the reported width/height transition. Those global or unlocalized warnings are not Projects blockers.

The detector overlay successfully rendered in the isolated assessment browser. That audit tab was closed after evidence capture, so the shared browser canvas is a clean Projects preview rather than a persistent overlay.

## Overall Impression

This is a strong, shippable redesign with a clear visual point of view. The biggest remaining opportunity is not more decoration; it is editorial direction. A visitor should understand why the first project is large, how the work is related, and what impression the final card is meant to leave.

## Cognitive Load and Emotional Journey

**Cognitive load: moderate, with 3 of 8 checklist failures.** Single focus, one-action-at-a-time behavior, working-memory demand, and per-card choice count are good. Chunking, grouping, and semantic visual hierarchy fail: the visitor must choose among 11 projects without chapters, and card size implies importance without explaining it. No individual card presents more than two visible actions.

**Emotional journey:** the hero and first oversized project create a confident peak. The middle becomes a steady sequence of identical image-copy-action cards, so novelty declines. The final centered card is tidy but does not produce a memorable close before the global footer.

## What's Working

1. **The work leads.** Large, real screenshots establish credibility before explanatory copy, which is right for an Experience surface.
2. **The interaction grammar is disciplined.** “View project” and “Source” are explicit, external-link affordances are recognizable, keyboard focus is visible, and there are no mystery icon-only controls.
3. **The system holds together across contexts.** Semantic overlay tokens preserve contrast, paired imagery respects light and dark presentation, the grid becomes one column on mobile, and reduced-motion behavior is present.

## Priority Issues

### [P2] Card size implies a ranking the content never explains

**Why it matters:** Visitors naturally read larger cards as more current, successful, or important. The index-driven span sequence creates that signal, but the copy provides no rationale, so hierarchy becomes decorative rather than informative.

**Fix:** Define a real editorial rule. Feature three projects because they are current, flagship, or most representative, state that through section placement or concise headings, and give the remaining work a calmer regular grid. If every project is equally important, use one consistent span.

**Evidence:** [Desktop project-grid overview](artifacts/projects-grid-overview.png)

**Suggested command:** `/impeccable layout`

### [P2] The catalog has a strong opening but a flat middle and soft ending

**Why it matters:** Eleven cards repeat the same image-copy-two-action anatomy. Scanning remains easy, but the page does not build an argument about the body of work, and the final centered card feels like the list simply ran out.

**Fix:** Create three compact editorial chapters grounded in the actual work, such as developer tooling, .NET libraries, and experiments. Vary density between featured and supporting projects, then close with one factual route to the broader GitHub body of work rather than another full card.

**Evidence:** [Full grid rhythm](artifacts/projects-grid-overview.png) and [current final card](artifacts/projects-ending.png)

**Suggested command:** `/impeccable layout`

### [P2] Paired theme screenshots double the image workload

**Why it matters:** The 22 PNGs total 6.71 MB. The first two cards eagerly request both theme variants, about 1.32 MB before the visitor interacts, and scrolling eventually loads both hidden and visible variants. This is the clearest risk for a mobile visitor on a slow connection.

**Fix:** Convert the screenshots to AVIF or WebP, load only the active theme variant initially, and defer the alternate variant until idle time or an actual theme change. Keep explicit intrinsic dimensions so the visual layout remains stable.

**Evidence:** [A card with paired theme artwork](artifacts/projects-card-detail.png)

**Suggested command:** `/impeccable optimize`

### [P3] Taglines and descriptions sometimes repeat the same idea

**Why it matters:** Repetition adds reading length without adding evidence. “Write GitHub Actions in C# with a familiar toolkit” is immediately followed by another sentence explaining that it is a .NET toolkit for authoring GitHub Actions; Blazorators repeats “source generators” in both lines.

**Fix:** Keep one outcome-led sentence per project. Preserve a second line only when it adds proof, scope, or a distinct technical detail.

**Evidence:** [Representative card copy](artifacts/projects-card-detail.png)

**Suggested command:** `/impeccable distill`

### [P3] Project actions miss the 44 px touch-target floor

**Why it matters:** `.project-link` uses `min-height: 2.65rem`, which resolves to about 42.4 px at the default root size. The difference is small, but these are the primary mobile actions and should meet the floor without depending on padding or font metrics.

**Fix:** Raise the minimum height to `2.75rem` and preserve the existing gap and focus treatment.

**Evidence:** [Primary and secondary card actions](artifacts/projects-card-detail.png)

**Suggested command:** `/impeccable adapt`

## Persona Red Flags

**Jordan, first-time visitor:** The first action is clear and every icon has text, but the varying card sizes suggest a priority Jordan cannot decode. Specialist project names such as Blazorators and Pwned Client depend heavily on the description; grouping by outcome would make the page easier to understand in five seconds.

**Sam, keyboard and low-vision visitor:** Semantic anchors, useful alt text, visible focus, and tested contrast are strong. The main residual issue is the slightly undersized action height; there is no keyboard trap or color-only meaning in the Projects surface.

**Casey, distracted mobile visitor:** The single-column layout is readable, but the long 11-card sequence has no jump points, the controls are just below the 44 px touch floor, and paired theme images impose unnecessary bandwidth on a slow connection.

## Minor Observations

- `projectSpans` is index-coupled, so reordering or adding a project silently changes the visual hierarchy.
- The detector's border-plus-wide-shadow warning is worth a final visual check: reserve the strongest shadow for hover instead of giving every resting card equal atmospheric depth.
- The global footer typography and global repeating rule were detected, but they are outside this page's source and should not block shipping Projects.
- The hidden “Pictures” occlusion and width/height-transition warnings could not be reproduced in visible Projects UI and should be treated as detector false positives unless a broader shell audit finds a source.

## Questions to Consider

- What factual rule should determine which projects receive the largest cards?
- Should the catalog optimize for a .NET peer scanning repositories, or for a broader visitor evaluating the impact of the work?
- What should the final impression be: breadth on GitHub, current flagship work, or an invitation to collaborate?
