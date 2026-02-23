# Routing Rules

## Domain Routing

| Domain / Signal                          | Route To       |
|------------------------------------------|----------------|
| Architecture, tech decisions, code review | Ripley (Lead)  |
| React components, Astro pages, reveal.js, slide-viewer | Dallas (Frontend) |
| CSS, Tailwind, responsive design, UX polish, animations | Lambert (UX/Design) |
| Testing, quality, edge cases, browser compat | Ash (Tester) |
| Logging, decisions, history              | Scribe         |
| Work queue, backlog, keep-alive          | Ralph          |

## Overlap Resolution

- Slide viewer bugs → Dallas (primary), Lambert (if CSS/layout related)
- reveal.js features → Dallas (integration), Ripley (architecture review)
- Responsive/resize issues → Lambert (primary), Dallas (if React state related)
- New components → Dallas (build), Lambert (style), Ash (test)

## Review Gates

- Ripley reviews all architectural changes
- Ash reviews all changes for quality before merge
- Lambert reviews all UX/visual changes
