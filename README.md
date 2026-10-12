# `davidpine.dev`

[![Netlify Status](https://api.netlify.com/api/v1/badges/6e4016f5-6982-4d1a-b7e2-617f81f2a1df/deploy-status)](https://app.netlify.com/projects/davidpinedev/deploys)

My personal website and blog built with Astro and the MultiTerm theme. I write about .NET, C#, web development, and open source software.

Visit the live site at [davidpine.dev](https://davidpine.dev)

## 🧑‍💻 About Me

Senior Software Engineer at Microsoft working on [Aspire](https://aspire.dev). Former Google Developer Expert in web technologies. International speaker, bestselling author of [Learning Blazor](https://www.amazon.com/Learning-Blazor-Building-Applications-WebAssembly/dp/1098113241), and open source enthusiast.

## ✨ Site Features

- Built with [Astro](https://astro.build/) and [MultiTerm theme](https://github.com/stelcodes/multiterm-astro)
- Multiple color scheme support with Shiki themes
- GitHub comment integration via Giscus
- RSS feed and sitemap
- Responsive design
- Auto-generated social cards

## 🚀 Development

**Install Dependencies**:

```bash
npm install
```

**Start the Development Server**:

```bash
npm run dev
```

**Build the Site**:

```bash
npm run build
```

## 📝 Content

Blog posts are located in `src/content/posts/`. Each post is a markdown or MDX file with frontmatter for metadata.

Site configuration is in `src/site.config.ts`.

### Speaking event sharing

Speaking events live in `src/data/speaking.ts`. Keep an event's `id` unchanged when
editing it: shared links use `/speaking?event={id}` to reopen the same speaking page
with that card selected. Selecting another card updates the URL without reloading.
Every timeline card and archive entry includes the event's share menu.

Only `/speaking` is rendered on request by the Astro Netlify adapter. This lets
social crawlers read the selected event's title, description, and artwork directly
from the HTML, without JavaScript. Other pages remain static. Invalid event IDs
redirect to `/speaking`, and the canonical URL remains the speaking overview.

The Astro endpoint `src/pages/og/speaking/[id].png.ts` generates a 1200 x 630 PNG for
each event during `npm run build`, using local fonts, the configured portrait, and
the site's colors. No runtime image service is needed. Event-data changes take
effect on the next deployment; social platforms may require a preview re-scrape
to refresh their own caches.

Use `npm run dev` for local interaction and OG-preview checks. Verify built
request-time routing with Netlify's local runtime or a deploy preview, not a
static-only file server. Run `node --test test/speaking-sharing.test.js` for the
share-data checks (Node 22.15+); set `SPEAKING_TEST_URL` to a running local/preview origin to
also check crawler HTML, redirects, and PNG responses.

Exercise Share with normal animation as well as reduced motion: mouse clicks,
touch, and keyboard activation must open the menu without moving the timeline
or following the card's external link.

## 📄 License

This project is licensed under the [MIT License](LICENSE.txt).

## 🙏 Credits

Built with the [MultiTerm Astro theme](https://github.com/stelcodes/multiterm-astro) by [Stel Abrego](https://github.com/stelcodes).
