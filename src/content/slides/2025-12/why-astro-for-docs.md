---
title: Why Astro for Documentation Sites
author: David Pine
description: A deep dive into why Astro and Starlight are the future of documentation, featuring real GitHub stats and the story of aspire.dev.
pubDate: 2025-12-09
tags:
  - Astro
  - Starlight
  - Documentation
  - .NET
  - aspire.dev
theme: black
transition: slide
controls: true
progress: true
---

## Why Astro for Documentation Sites

*David Pine* — @IEvangelist

December 2025

---

## The Documentation Landscape

The JS ecosystem thrived while .NET docs tooling stagnated.

- **DocFX**: Microsoft Learn's abandoned promise <!-- .element: class="fragment" -->
- **Astro + Starlight**: The community's answer <!-- .element: class="fragment" -->
- **aspire.dev**: Living proof it works <!-- .element: class="fragment" -->

---

## The DocFX Story 📉

> "Microsoft Learn no longer uses docfx and do not intend to support the project since Nov 2022."
> — Official DocFX README

---

## DocFX: By The Numbers

| Metric | Value |
|--------|-------|
| ⭐ Stars | 4.4k |
| 🐛 Open Issues | **409** |
| 👥 Contributors | 258 |
| 📦 Used by | Limited |

*The internal tooling that built Learn was never shared.*

---

## Meanwhile, in the JS Ecosystem...

The web moved forward. **Fast.**

---

## Astro: GitHub Stats 🚀

| Metric | Value |
|--------|-------|
| ⭐ Stars | **54.8k** |
| 🍴 Forks | 3k |
| 👥 Contributors | **999** |
| 📦 Used by | **253k+ projects** |
| 📋 Open Issues | 216 |
| 🏷️ Releases | **2,594** |

---

## Starlight: Purpose-Built for Docs

| Metric | Value |
|--------|-------|
| ⭐ Stars | **7.5k** |
| 🍴 Forks | 862 |
| 👥 Contributors | 299 |
| 📦 Used by | **10k+ projects** |
| 🏷️ Releases | 187 |

---

## Octoverse 2024 Highlights 📊

- **Python** overtook JavaScript as #1 language <!-- .element: class="fragment" -->
- **1 billion** contributions to open source <!-- .element: class="fragment" -->
- **TypeScript** is #3, cutting into JS share <!-- .element: class="fragment" -->
- JS ecosystem: **15% spike** in npm consumption <!-- .element: class="fragment" -->

---

## Global Developer Growth

- **India**: On track for #1 by 2028 <!-- .element: class="fragment" -->
- **Brazil**: 27% YoY growth <!-- .element: class="fragment" -->
- **Nigeria**: 28% YoY growth <!-- .element: class="fragment" -->
- **1.4M** new first-time open source contributors <!-- .element: class="fragment" -->

---

## Why Astro Won

### Islands Architecture 🏝️

```astro
<!-- Only hydrate what needs interactivity -->
<StaticHeader />
<InteractiveSearch client:load />
<StaticContent />
<InteractiveComments client:visible />
```

---

## Performance First

- **Zero JS by default** <!-- .element: class="fragment" -->
- Ship only what you need <!-- .element: class="fragment" -->
- Content-focused optimization <!-- .element: class="fragment" -->
- Lighthouse 100s out of the box <!-- .element: class="fragment" -->

---

## Content Collections

```typescript
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
  }),
})
```

Type-safe content. Built-in validation.

---

## The aspire.dev Story

I migrated .NET Aspire docs from Learn to Astro + Starlight.

**Feature parity achieved.** <!-- .element: class="fragment" -->

**Plus so much more.** <!-- .element: class="fragment" -->

---

## What We Gained

- 🔍 **Better search** with Pagefind
- 🎨 **Full theming control**
- ⚡ **Faster builds** and deploys
- 🧩 **MDX support** for interactive docs
- 🌍 **i18n** built-in
- 📱 **Mobile-first** responsive design

---

## The Flexibility Factor

Bring your own:
- React, Vue, Svelte, Solid components <!-- .element: class="fragment" -->
- Any CSS framework <!-- .element: class="fragment" -->
- Custom remark/rehype plugins <!-- .element: class="fragment" -->
- Your existing design system <!-- .element: class="fragment" -->

---

## Environmental Impact 🌱

Less JavaScript = Less compute = Lower carbon

- Smaller bundle sizes <!-- .element: class="fragment" -->
- Faster page loads <!-- .element: class="fragment" -->
- Reduced server processing <!-- .element: class="fragment" -->
- Better for users on slow connections <!-- .element: class="fragment" -->

---

## Starlight Features

- ✅ Site navigation
- ✅ Built-in search
- ✅ Internationalization (i18n)
- ✅ SEO optimized
- ✅ Dark mode
- ✅ Code highlighting
- ✅ Accessible by default

---

## Community Love 💜

> "Starlight is our go-to example of a great DX: the speed, convenience, and attention to details is inspiring."
> — StackBlitz Team

---

## Sponsorship & Investment

Recent Astro partnerships:

- **Webflow**: $150,000 donation <!-- .element: class="fragment" -->
- **Cloudflare**: $150,000 donation <!-- .element: class="fragment" -->
- **Netlify**: Official deployment partner <!-- .element: class="fragment" -->
- **Stainless**: Astro-powered docs platform <!-- .element: class="fragment" -->

---

## The Lesson

When the ecosystem you depend on stagnates...

**Look to the thriving communities.** <!-- .element: class="fragment" -->

---

## The Future is Open

- Astro: MIT Licensed
- Starlight: MIT Licensed
- Community-driven development
- Regular releases (2,594 and counting!)

---

## Get Started

```bash
# Create a new Starlight project
npm create astro@latest -- --template starlight
```

[docs.astro.build](https://docs.astro.build) | [starlight.astro.build](https://starlight.astro.build)

---

## Thank You!

Questions?

**@davidpine7** | **davidpine.dev**

[aspire.dev Docs](https://aspire.dev) <!-- .element: style="text-align: left; display: block;" -->
