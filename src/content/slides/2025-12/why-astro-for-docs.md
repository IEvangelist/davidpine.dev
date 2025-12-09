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

<ul>
<li class="fragment"><strong>DocFX</strong> — Microsoft Learn's abandoned promise</li>
<li class="fragment"><strong>Astro + Starlight</strong> — The community's answer</li>
<li class="fragment"><strong>aspire.dev</strong> — Living proof it works</li>
</ul>

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

## Octoverse 2025: Record Growth 📊

<ul>
<li class="fragment"><strong>180M+</strong> developers now on GitHub</li>
<li class="fragment"><strong>36M</strong> new developers joined in one year (+23% YoY)</li>
<li class="fragment"><strong>630M</strong> total repositories</li>
<li class="fragment"><strong>1 developer</strong> joins GitHub every second</li>
</ul>

---

## TypeScript Takes #1 🏆

For the first time ever, TypeScript overtook Python and JavaScript!

<ul>
<li class="fragment"><strong>+1M contributors</strong> in 2025 (+66% YoY)</li>
<li class="fragment"><strong>2.6M+</strong> monthly contributors</li>
<li class="fragment"><strong>78%</strong> growth in new repos</li>
<li class="fragment">AI benefits from <strong>type safety</strong></li>
</ul>

---

## Why TypeScript Won

<ul>
<li class="fragment">Type systems reduce ambiguity and catch LLM errors</li>
<li class="fragment">Frameworks ship TypeScript by default</li>
<li class="fragment"><strong>94%</strong> of LLM-generated errors are type-check failures</li>
<li class="fragment">Low barrier: Vite, ts-node, Bun hide boilerplate</li>
</ul>

---

## Astro's Meteoric Rise 🌟

| Metric | Value |
|--------|-------|
| 📈 Growth | **+78% YoY** |
| 👥 Contributors | **45,600+** |
| 🏗️ Architecture | Islands |
| 📦 Zero JS | By default |

*One of the fastest-growing languages on GitHub!*

---

## Global Developer Growth

<ul>
<li class="fragment"><strong>India</strong> — Added 5.2M devs, now #1 contributor base</li>
<li class="fragment"><strong>Brazil</strong> — 6.89M developers (#4 globally)</li>
<li class="fragment"><strong>Indonesia</strong> — 4.37M developers (up from 0.9M in 2020)</li>
<li class="fragment"><strong>India projected #1</strong> by 2030 with 57.5M developers</li>
</ul>

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

<ul>
<li class="fragment"><strong>Zero JS by default</strong></li>
<li class="fragment">Ship only what you need</li>
<li class="fragment">Content-focused optimization</li>
<li class="fragment">Lighthouse 100s out of the box</li>
</ul>

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

<p class="fragment"><strong>Feature parity achieved.</strong></p>

<p class="fragment"><strong>Plus so much more.</strong></p>

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

<ul>
<li class="fragment">React, Vue, Svelte, Solid components</li>
<li class="fragment">Any CSS framework</li>
<li class="fragment">Custom remark/rehype plugins</li>
<li class="fragment">Your existing design system</li>
</ul>

---

## AI Era: TypeScript + Astro 🤖

<ul>
<li class="fragment"><strong>1.1M+ repos</strong> now use LLM SDKs (+178% YoY)</li>
<li class="fragment"><strong>80%</strong> of new devs use Copilot in week one</li>
<li class="fragment">TypeScript's types help catch AI-generated errors</li>
<li class="fragment">Astro's simplicity = easier AI-assisted development</li>
</ul>

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

<ul>
<li class="fragment"><strong>Webflow</strong> — $150,000 donation</li>
<li class="fragment"><strong>Cloudflare</strong> — $150,000 donation</li>
<li class="fragment"><strong>Netlify</strong> — Official deployment partner</li>
<li class="fragment"><strong>Stainless</strong> — Astro-powered docs platform</li>
</ul>

---

## The Lesson

When the ecosystem you depend on stagnates...

<p class="fragment"><strong>Look to the thriving communities.</strong></p>

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

**@IEvangelist** | **davidpine.dev**

[aspire.dev](https://aspire.dev)
