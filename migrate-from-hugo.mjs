#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import toml from 'toml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const HUGO_CONTENT = 'E:/GitHub/davidpine.net/content/blog';
const HUGO_STATIC = 'E:/GitHub/davidpine.net/static';
const ASTRO_CONTENT = path.join(__dirname, 'src/content/posts');
const ASTRO_PUBLIC = path.join(__dirname, 'public');

// Statistics
const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  warnings: []
};

/**
 * Convert Hugo frontmatter to Astro format
 */
function convertFrontmatter(hugoData, filename) {
  const astroData = {};

  // Required: title
  if (hugoData.title) {
    astroData.title = hugoData.title;
  } else {
    stats.warnings.push(`Missing title in ${filename}`);
    astroData.title = filename.replace(/\.md$/, '');
  }

  // Required: published date
  if (hugoData.date) {
    const date = new Date(hugoData.date);
    astroData.published = date.toISOString().split('T')[0];
  } else {
    stats.warnings.push(`Missing date in ${filename}, using current date`);
    astroData.published = new Date().toISOString().split('T')[0];
  }

  // Optional: draft status
  if (hugoData.draft !== undefined) {
    astroData.draft = hugoData.draft;
  }

  // Optional: description
  if (hugoData.description) {
    astroData.description = hugoData.description;
  }

  // Optional: author
  if (hugoData.author) {
    astroData.author = hugoData.author;
  }

  // Optional: tags (merge categories into tags)
  const tags = [];
  if (Array.isArray(hugoData.tags)) {
    tags.push(...hugoData.tags);
  }
  if (Array.isArray(hugoData.categories)) {
    tags.push(...hugoData.categories);
  }
  if (tags.length > 0) {
    // Remove duplicates, replace CSharp with C#, and sort
    astroData.tags = [...new Set(tags)].map(tag => tag === 'CSharp' ? 'C#' : tag).sort();
  }

  // Optional: series
  if (hugoData.series) {
    astroData.series = hugoData.series;
  }

  // Optional: cover image
  if (hugoData.featured || hugoData.images?.[0]) {
    const imageName = hugoData.featured || path.basename(hugoData.images[0]);
    astroData.coverImage = {
      src: `./${imageName}`,
      alt: hugoData.featuredalt || hugoData.title
    };
  }

  return astroData;
}

/**
 * Convert Hugo shortcodes to Astro directives or markdown
 */
function convertShortcodes(content, filename) {
  let converted = content;

  // {{< youtube ID >}} -> Embed link or note
  converted = converted.replace(/\{\{<\s*youtube\s+([^\s>]+)\s*>\}\}/g, (match, id) => {
    return `\n\n[Watch on YouTube](https://www.youtube.com/watch?v=${id})\n\n`;
  });

  // {{< gist user id >}} -> GitHub Gist link
  converted = converted.replace(/\{\{<\s*gist\s+([^\s]+)\s+([^\s>]+)\s*>\}\}/g, (match, user, id) => {
    return `\n\n[View Gist](https://gist.github.com/${user}/${id})\n\n`;
  });

  // {{< x id="..." user="..." >}} or {{< x user="..." id="..." >}} -> X/Twitter link
  converted = converted.replace(/\{\{<\s*x\s+(?:user="([^"]+)"\s+)?(?:id="([^"]+)"\s*)?(?:user="([^"]+)")?\s*>\}\}/g, (match, user1, id, user2) => {
    const user = user1 || user2;
    if (id && user) {
      return `[View post by @${user}](https://x.com/${user}/status/${id})`;
    } else if (id) {
      return `[View post](https://x.com/i/status/${id})`;
    }
    return '';
  });

  // {{< twitter ID >}} -> X/Twitter link (old format)
  converted = converted.replace(/\{\{<\s*twitter\s+([^\s>]+)\s*>\}\}/g, (match, id) => {
    return `[View post](https://twitter.com/i/web/status/${id})`;
  });

  // {{< tip title="..." >}} ... {{< /tip >}}
  converted = converted.replace(/\{\{<\s*tip\s+title="([^"]+)"\s*>\}\}([\s\S]*?)\{\{<\s*\/tip\s*>\}\}/g, ':::tip{title="$1"}\n$2\n:::');

  // {{< note title="..." >}} ... {{< /note >}} (with or without title)
  converted = converted.replace(/\{\{<\s*note(?:\s+title="([^"]+)")?\s*>\}\}([\s\S]*?)\{\{<\s*\/note\s*>\}\}/g, (match, title, content) => {
    if (title) {
      return `:::note{title="${title}"}\n${content}\n:::`;
    }
    return `:::note\n${content}\n:::`;
  });

  // {{< quote >}} ... {{< /quote >}} (with optional attributes)
  converted = converted.replace(/\{\{<\s*quote(?:\s+[^>]*)?\s*>\}\}([\s\S]*?)\{\{<\s*\/quote\s*>\}\}/g, '> $1');

  // {{< i "fa-icon" >}} or {{< i fa-icon >}} -> Remove Font Awesome icons completely
  converted = converted.replace(/\{\{<\s*i\s+(?:")?fa-[^\s">]+(?:")?\s*>\}\}/g, '');

  // {{< line-break >}} -> blank line
  converted = converted.replace(/\{\{<\s*line-break\s*>\}\}/g, '\n\n');

  // {{< blazor-repl id="..." >}} -> Note about REPL
  converted = converted.replace(/\{\{<\s*blazor-repl\s+id="([^"]+)"\s*>\}\}/g, (match, id) => {
    return `\n\n**Interactive Demo**: [View on Blazor REPL](https://blazorrepl.telerik.com/repl/${id})\n\n`;
  });

  // {{< codepen id="..." height="..." >}} -> CodePen embed link
  converted = converted.replace(/\{\{<\s*codepen\s+id="([^"]+)"(?:\s+height="[^"]+")?\s*>\}\}/g, (match, id) => {
    return `\n\n[View on CodePen](https://codepen.io/pen/${id})\n\n`;
  });

  // {{< codepen >}} (no args) -> Note
  converted = converted.replace(/\{\{<\s*codepen\s*>\}\}/g, '');

  // {{< yt-comment href="..." name="..." >}} ... {{</ yt-comment >}}
  converted = converted.replace(/\{\{<\s*yt-comment\s+href="([^"]+)"\s+name="([^"]+)"\s*>\}\}([\s\S]*?)\{\{<\s*\/\s*yt-comment\s*>\}\}/g, (match, href, name, content) => {
    return `\n\n**${name}** [commented](${href}):\n> ${content.trim()}\n\n`;
  });

  // {{< img-post >}} and {{< clickable-image >}} -> Standard markdown image
  converted = converted.replace(/\{\{<\s*(?:img-post|clickable-image)\s+path="([^"]+)"\s+file="([^"]+)"\s+alt="([^"]+)"[^>]*>\}\}/g, '![$3]($1/$2)');

  // {{< url-link "text" "url" >}} -> Standard markdown link (text comes first in Hugo)
  converted = converted.replace(/\{\{<\s*url-link\s+"([^"]+)"\s+"([^"]+)"\s*>\}\}/g, '[$1]($2)');

  // {{< url-link text "{{< relref "file.md" >}} -> Just use text (can't resolve relref easily)
  converted = converted.replace(/\{\{<\s*url-link\s+"([^"]+)"\s+"[^"]*relref[^"]*"\s*>\}\}/g, '$1');

  // {{< relref "..." >}} -> Remove (internal Hugo references)
  converted = converted.replace(/\{\{<\s*(?:rel)?ref\s+"[^"]+"\s*>\}\}/g, '');

  // {{< video src="..." >}} -> HTML5 video
  converted = converted.replace(/\{\{<\s*video\s+src="([^"]+)"[^>]*>\}\}/g, '<video controls src="$1"></video>');

  // Remove custom shortcodes that don't have content equivalents
  const removeShortcodes = [
    'example-loading-page',
    'mirror-example-output',
    'magic-mirror-gallery',
    'photo-booth-gallery',
    'gifts-from-organizers',
    'four-images',
    'gallery',
    'git-graph',
    'credly-badges',
    'holopin',
    'lb-amazon-preview',
    'github-sponsor'
  ];
  
  for (const shortcode of removeShortcodes) {
    converted = converted.replace(new RegExp(`\\{\\{<\\s*${shortcode}(?:\\s+[^>]*)?\\s*>\\}\\}`, 'g'), '');
  }

  // Final cleanup: warn about any remaining shortcodes
  const remainingShortcodes = converted.match(/\{\{<[^>]+>\}\}/g);
  if (remainingShortcodes) {
    const uniqueShortcodes = [...new Set(remainingShortcodes)];
    if (uniqueShortcodes.length > 0) {
      console.log(`  ⚠ Unconverted shortcodes in ${filename}: ${uniqueShortcodes.slice(0, 3).join(', ')}${uniqueShortcodes.length > 3 ? ` and ${uniqueShortcodes.length - 3} more` : ''}`);
    }
  }

  return converted;
}

/**
 * Copy image file to post directory
 */
function copyImageToPost(hugoImagePath, postDir) {
  if (!hugoImagePath) return null;

  // Handle paths like "/img/2025/10/aspire-dev.png"
  const imagePath = path.join(HUGO_STATIC, hugoImagePath);
  
  if (!fs.existsSync(imagePath)) {
    stats.warnings.push(`Image not found: ${imagePath}`);
    return null;
  }

  const imageName = path.basename(imagePath);
  const destPath = path.join(postDir, imageName);

  try {
    fs.copyFileSync(imagePath, destPath);
    console.log(`  ✓ Copied image: ${imageName}`);
    return imageName;
  } catch (error) {
    stats.warnings.push(`Failed to copy image ${imagePath}: ${error.message}`);
    return null;
  }
}

/**
 * Find all inline images in content and copy them to post directory
 * Also update image paths to be relative
 */
function processInlineImages(content, postDir, filename) {
  let updatedContent = content;
  
  // Find all markdown image references: ![alt](/img/path/to/image.ext)
  const imageRegex = /!\[([^\]]*)\]\((\/img\/[^)]+)\)/g;
  const matches = [...content.matchAll(imageRegex)];
  
  for (const match of matches) {
    const [fullMatch, alt, imagePath] = match;
    const imageName = path.basename(imagePath);
    
    // Copy the image to post directory
    copyImageToPost(imagePath, postDir);
    
    // Replace absolute path with relative path
    const relativeImageRef = `![${alt}](./${imageName})`;
    updatedContent = updatedContent.replace(fullMatch, relativeImageRef);
  }
  
  return updatedContent;
}

/**
 * Process a single Hugo post
 */
function processPost(hugoFilePath) {
  const filename = path.basename(hugoFilePath);
  console.log(`\nProcessing: ${filename}`);

  try {
    // Read Hugo post
    const hugoContent = fs.readFileSync(hugoFilePath, 'utf-8');
    
    // Parse TOML frontmatter manually (Hugo uses +++ delimiters)
    let hugoData = {};
    let hugoBody = hugoContent;
    
    const tomlMatch = hugoContent.match(/^\+\+\+([\s\S]*?)\+\+\+([\s\S]*)$/);
    if (tomlMatch) {
      try {
        hugoData = toml.parse(tomlMatch[1]);
        hugoBody = tomlMatch[2].trim();
      } catch (tomlError) {
        console.log(`  ⚠ TOML parsing failed, trying gray-matter: ${tomlError.message}`);
        const parsed = matter(hugoContent, { delimiters: ['+++', '+++'] });
        hugoData = parsed.data;
        hugoBody = parsed.content;
      }
    } else {
      // Fallback to gray-matter for YAML
      const parsed = matter(hugoContent);
      hugoData = parsed.data;
      hugoBody = parsed.content;
    }

    // Skip draft posts
    if (hugoData.draft === true) {
      console.log(`  ⊘ Skipping draft post`);
      stats.skipped++;
      return;
    }

    // Create slug from filename
    const slug = filename.replace(/\.md$/, '');
    const postDir = path.join(ASTRO_CONTENT, slug);

    // Create post directory
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    // Convert frontmatter
    const astroData = convertFrontmatter(hugoData, filename);

    // Copy cover image if exists
    if (hugoData.featured && hugoData.featuredpath) {
      const hugoImagePath = `/${hugoData.featuredpath}/${hugoData.featured}`;
      copyImageToPost(hugoImagePath, postDir);
    } else if (hugoData.images?.[0]) {
      copyImageToPost(hugoData.images[0], postDir);
    }

    // Convert shortcodes in content
    let astroBody = convertShortcodes(hugoBody, filename);
    
    // Process inline images - copy them and update paths
    astroBody = processInlineImages(astroBody, postDir, filename);

    // Write Astro post
    const astroContent = matter.stringify(astroBody, astroData);
    const astroFilePath = path.join(postDir, 'index.md');
    fs.writeFileSync(astroFilePath, astroContent);

    console.log(`  ✓ Created: ${slug}/index.md`);
    stats.processed++;
  } catch (error) {
    console.error(`  ✗ Error processing ${filename}: ${error.message}`);
    stats.errors++;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting Hugo to Astro migration...\n');
  console.log(`Source: ${HUGO_CONTENT}`);
  console.log(`Destination: ${ASTRO_CONTENT}\n`);

  // Ensure destination directory exists
  if (!fs.existsSync(ASTRO_CONTENT)) {
    fs.mkdirSync(ASTRO_CONTENT, { recursive: true });
  }

  // Get all Hugo posts
  const hugoFiles = fs.readdirSync(HUGO_CONTENT)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(HUGO_CONTENT, file));

  console.log(`Found ${hugoFiles.length} posts to migrate\n`);
  console.log('─'.repeat(60));

  // Process each post
  for (const hugoFile of hugoFiles) {
    processPost(hugoFile);
  }

  // Print summary
  console.log('\n' + '─'.repeat(60));
  console.log('\n📊 Migration Summary:');
  console.log(`  ✓ Successfully processed: ${stats.processed}`);
  console.log(`  ⊘ Skipped: ${stats.skipped}`);
  console.log(`  ✗ Errors: ${stats.errors}`);

  if (stats.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${stats.warnings.length}):`);
    stats.warnings.slice(0, 20).forEach(warning => {
      console.log(`  • ${warning}`);
    });
    if (stats.warnings.length > 20) {
      console.log(`  ... and ${stats.warnings.length - 20} more warnings`);
    }
  }

  console.log('\n✅ Migration complete!\n');
  console.log('Next steps:');
  console.log('  1. Review migrated posts in src/content/posts/');
  console.log('  2. Update site.config.ts with your information');
  console.log('  3. Run: npm run build');
  console.log('  4. Run: npm run postbuild (for search indexing)');
  console.log('  5. Manually review posts with warnings\n');
}

// Run migration
migrate().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
