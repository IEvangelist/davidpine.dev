# Plan: Migrate Hugo Blog to Astro

Migrate content, assets, and configuration from your Hugo site at `E:\GitHub\davidpine.net\` to the Astro site at `E:\GitHub\davidpine.dev\`. The Astro site is already configured with content collections, tags, series, RSS, search, and rich markdown features.

## Steps

1. **Analyze Hugo site structure** — Read `config.toml` or `hugo.toml`, inventory `content/` directory, document frontmatter patterns, and catalog all Hugo shortcodes in use.

2. **Create automated conversion script** — Build Node.js script to convert frontmatter (`date` → `published`, merge `categories` into `tags`, `featured_image` → `coverImage`), transform Hugo shortcodes to Astro directives/markdown, and restructure files from Hugo's format to Astro's `src/content/posts/[slug]/index.md` structure.

3. **Migrate content and assets** — Run conversion script on all posts, copy images from Hugo's `static/` to post directories with relative paths, transfer `static/` assets to Astro's `public/`, and update `site.config.ts` with author/social links from Hugo config.

4. **Validate and test migration** — Build site (`npm run build`), verify all posts render correctly, test tag/series pages, validate RSS feed, run `postbuild` for search indexing, and manually review key posts for formatting issues.

## Further Considerations

1. **URL structure differences?** — If Hugo uses different permalinks (e.g., `/posts/` vs `/blog/`), should we maintain the same URLs in Astro or set up redirects at hosting level?

2. **Hugo shortcodes strategy?** — Which approach: create custom remark plugins for common shortcodes, convert to MDX with Astro components, or manual markdown conversion for each instance?

3. **Series/taxonomy handling?** — Does Hugo use custom taxonomies beyond tags/categories? Should we map Hugo's series system to Astro's `series` frontmatter field, and how are series posts ordered?

## Astro Site Configuration

### Content Collections

**Posts Collection** (`src/content/posts/`)
- Schema: `title` (required), `published` (date, required), `draft` (boolean), `description`, `author`, `series`, `tags` (array), `coverImage` (object with src/alt), `toc` (boolean, default true)
- Auto-computed: `readingTime`, auto-generated `description` from first paragraph if missing

**Home Collection** (`src/content/home/`)
- Schema: `avatarImage` (optional, src/alt), `githubCalendar` (GitHub username)

**Addendum Collection** (`src/content/addendum/`)
- Schema: `avatarImage` (optional, src/alt)

### Markdown Features & Plugins

**Remark Plugins:**
- remarkDescription — Auto-generates description from first 200 chars
- remarkReadingTime — Calculates reading time
- remarkDirective — Handles `:::` directive syntax
- remarkGithubCard — GitHub repo/user cards (`:github{repo="owner/repo"}`)
- remarkAdmonitions — `:::note`, `:::tip`, `:::important`, `:::warning`, `:::caution`
- remarkCharacterDialogue — Character chat (e.g., `:::duck`, `:::owl`, `:::unicorn`)
- remarkUnknownDirectives — Handles unknown directives
- remarkMath — LaTeX math support
- remarkGemoji — GitHub emoji shortcodes (`:star_struck:`, `:coffee:`)

**Rehype Plugins:**
- rehypeHeadingIds — Adds IDs to headings
- rehypeAutolinkHeadings — Wraps headings in links
- rehypeTitleFigure — Wraps titled images in `<figure>` with `<figcaption>`
- rehypeExternalLinks — Adds `target="_blank"` and `rel="noopener noreferrer"`
- rehypeUnwrapImages — Unwraps images from paragraph tags
- rehypePixelated — CSS for pixel art (alt text ends with `#pixelated`)
- rehypeKatex — Renders LaTeX math equations

**Expressive Code Features:**
- Syntax highlighting with 59 theme options
- Line numbers (optional via `showLineNumbers` prop)
- Code wrapping (optional via `wrap` prop)
- Code block titles (`title="filename.js"`)
- Line highlighting support

### URL Structure & Routing

- Homepage: `/`
- About: `/about`
- Posts Archive: `/posts` and `/posts/[page]`
- Individual Post: `/posts/[slug]`
- Series Archive: `/series/[slug]`
- Tag Archive: `/tags/[tag]` and `/tags/[tag]/[page]`
- RSS Feed: `/rss.xml`
- Robots.txt: `/robots.txt`
- Sitemap: Generated automatically
- Social Cards: `/social-cards/[slug].png` (auto-generated)
- Giscus Themes: `/giscus/[theme].css`

### Taxonomy Systems

**Tags:**
- Stored as array in frontmatter: `tags: ['javascript', 'typescript']`
- Tag pages are paginated
- Case-sensitive
- Each tag gets its own archive page

**Series:**
- Stored as string: `series: 'My Series Name'`
- Posts ordered by publication date
- Series pages show all posts in sequence
- Navigation between series posts (prev/next)

### Special Features

1. **GitHub Activity Calendar** — Shows contribution activity on homepage, username in `home.md` frontmatter, themed to match color scheme
2. **Search (Pagefind)** — Built during `postbuild` step, integrates with routing
3. **Table of Contents** — Auto-generated, sticky sidebar, can disable via `toc: false`
4. **Image Handling** — Astro's Image component, cover images, avatars, pixel art handling, figure/figcaption
5. **Character Dialogues** — Custom admonition-like feature, images in `public/`, supports left/right alignment

## Frontmatter Conversion Mapping

| Hugo Field | Astro Field | Notes |
|------------|-------------|-------|
| `date` | `published` | Convert to YYYY-MM-DD format |
| `lastmod` | `updated` | Optional in Astro |
| `title` | `title` | Same |
| `draft` | `draft` | Same |
| `tags` | `tags` | Same |
| `description` | `description` | Same |
| `categories` | `tags` (merge) | Astro uses tags only |
| `series` | `series` | Same |
| `author` | `author` | Same |
| `slug` | (filename) | Astro uses filename as slug |
| `aliases` | (redirect setup) | Need separate handling |
| `images[0]` or `featured_image` | `coverImage` | Structure changes to object |
| `summary` | `description` | Can merge |
| `weight` | (publish date) | Use for ordering |

## Hugo Shortcode Conversions

| Hugo Shortcode | Astro Equivalent | Notes |
|----------------|------------------|-------|
| `{{< youtube ID >}}` | `:youtube{id="ID"}` or custom component | Create directive plugin |
| `{{< gist user id >}}` | `:github{gist="user/id"}` | Create directive plugin |
| `{{< tweet ID >}}` | `:twitter{id="ID"}` | Create directive plugin |
| `{{< figure >}}` | Standard markdown with title | Already supported |
| `{{< ref "post.md" >}}` | `/posts/post-slug` | Manual conversion |
| `{{< relref "post.md" >}}` | `/posts/post-slug` | Manual conversion |
| `{{< highlight lang >}}` | Standard code fence | Use ` ```lang ` |

For additional shortcodes that are custom to davidpine.net, see the `E:\GitHub\davidpine.net\layouts\shortcodes\` directory and plan conversions accordingly. The same is true for any custom taxonomies or unique Hugo features in use within the `E:\GitHub\davidpine.net\layouts\`.

## Example Conversion Script Structure

```javascript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { glob } from 'glob'

// Paths
const HUGO_CONTENT = 'E:/GitHub/davidpine.net/content'
const ASTRO_CONTENT = 'E:/GitHub/davidpine.dev/src/content/posts'

// Convert frontmatter
function convertFrontmatter(hugoFrontmatter) {
  return {
    title: hugoFrontmatter.title,
    published: new Date(hugoFrontmatter.date).toISOString().split('T')[0],
    draft: hugoFrontmatter.draft || false,
    description: hugoFrontmatter.description || hugoFrontmatter.summary,
    author: hugoFrontmatter.author,
    tags: [...(hugoFrontmatter.tags || []), ...(hugoFrontmatter.categories || [])],
    series: hugoFrontmatter.series,
    coverImage: hugoFrontmatter.featured_image ? {
      src: `./${path.basename(hugoFrontmatter.featured_image)}`,
      alt: hugoFrontmatter.title
    } : undefined,
  }
}

// Convert shortcodes
function convertShortcodes(content) {
  // Replace Hugo shortcodes with Astro equivalents
  content = content.replace(/{{< youtube (\S+) >}}/g, '::youtube{id="$1"}')
  content = content.replace(/{{< gist (\S+) (\S+) >}}/g, '::gist{user="$1" id="$2"}')
  // ... more conversions
  return content
}

// Main migration function
async function migrate() {
  const files = await glob(`${HUGO_CONTENT}/**/*.md`)
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const { data, content: body } = matter(content)
    
    const astroFrontmatter = convertFrontmatter(data)
    const astroContent = convertShortcodes(body)
    
    // Create new file structure
    const slug = path.basename(file, '.md')
    const newDir = path.join(ASTRO_CONTENT, slug)
    fs.mkdirSync(newDir, { recursive: true })
    
    // Write converted file
    const newContent = matter.stringify(astroContent, astroFrontmatter)
    fs.writeFileSync(path.join(newDir, 'index.md'), newContent)
    
    // Copy images (if any)
    // ... image copying logic
  }
}

migrate()
```

## Hugo Site Files to Analyze

1. **Configuration**: `hugo.toml`, `hugo.yaml`, `config.toml`, or `config/_default/`
2. **Content**: `content/posts/` or `content/blog/` directory
3. **Static Assets**: `static/` and `assets/` directories
4. **Shortcodes**: `layouts/shortcodes/` directory
5. **Templates**: `layouts/_default/`, `layouts/posts/`, `layouts/partials/`
6. **Data Files**: `data/` directory
7. **Archetypes**: `archetypes/` (shows expected frontmatter)

## Migration Checklist

### Discovery Phase
- [ ] Locate and read Hugo config file
- [ ] Inventory all content files
- [ ] Document all shortcodes in use
- [ ] List all static assets
- [ ] Map frontmatter patterns
- [ ] Identify custom taxonomies
- [ ] Document URL structure
- [ ] List all Hugo theme features in use

### Preparation Phase
- [ ] Create backup of Hugo site
- [ ] Set up conversion script
- [ ] Test conversion on sample post
- [ ] Plan image migration strategy
- [ ] Map URLs for redirects
- [ ] Update `site.config.ts` with Hugo settings

### Migration Phase
- [ ] Run conversion script
- [ ] Copy static assets
- [ ] Migrate images
- [ ] Convert frontmatter
- [ ] Convert shortcodes
- [ ] Update internal links
- [ ] Merge taxonomies

### Validation Phase
- [ ] Build Astro site successfully (`npm run build`)
- [ ] Verify all posts render
- [ ] Check all images load
- [ ] Test tag pages
- [ ] Test series pages
- [ ] Validate RSS feed
- [ ] Test search functionality (`npm run postbuild`)
- [ ] Review sample posts manually
- [ ] Check code blocks
- [ ] Test external links

### Deployment Phase
- [ ] Set up hosting
- [ ] Configure domain (davidpine.dev)
- [ ] Set up redirects (if needed)
- [ ] Deploy site
- [ ] Verify production build
- [ ] Test live site
- [ ] Update social links
- [ ] Submit sitemap to search engines

## Potential Issues & Solutions

**Issue 1: Hugo Shortcodes**
- Problem: Hugo shortcodes won't work in Astro
- Solution: Create custom remark plugins, use Astro components in MDX, or manual conversion

**Issue 2: Image Paths**
- Problem: Hugo uses different image path structure
- Solution: Use co-located images (same directory as post), update references to relative paths (`./image.jpg`)

**Issue 3: Taxonomy Mismatch**
- Problem: Hugo has categories, Astro site only uses tags
- Solution: Merge categories into tags during migration

**Issue 4: Date Formats**
- Problem: Hugo uses RFC3339 (`2023-01-01T12:00:00Z`), Astro uses ISO date
- Solution: Parse Hugo dates and convert to `YYYY-MM-DD` format

**Issue 5: URL Structure**
- Problem: URLs may differ between Hugo and Astro
- Solution: Configure redirects at hosting level or adjust Astro routing to match Hugo

**Issue 6: Custom Hugo Features**
- Problem: Hugo theme may have unique features
- Solution: Identify must-have features, recreate as Astro components, or find alternatives
