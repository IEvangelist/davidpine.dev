import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const postsCollection = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      published: z.coerce.date(),
      // updated: z.coerce.date().optional(),
      draft: z.boolean().optional().default(false),
      description: z.string().optional(),
      author: z.string().optional(),
      series: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
      coverImage: z
        .strictObject({
          src: image(),
          alt: z.string(),
        })
        .optional(),
      toc: z.boolean().optional().default(true),
    }),
})

const homeCollection = defineCollection({
  loader: glob({ pattern: ['home.md', 'home.mdx'], base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default('My avatar'),
        })
        .optional(),
      githubCalendar: z.string().optional(), // GitHub username for calendar
    }),
})

const addendumCollection = defineCollection({
  loader: glob({ pattern: ['addendum.md', 'addendum.mdx'], base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default('My avatar'),
        })
        .optional(),
    }),
})

const slidesCollection = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: './src/content/slides' }),
  schema: z.object({
    title: z.string(),
    author: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()).optional().default([]),
    pubDate: z.coerce.date(),
    theme: z
      .enum([
        'black',
        'white',
        'league',
        'beige',
        'dracula',
        'sky',
        'night',
        'serif',
        'simple',
        'solarized',
        'blood',
        'moon',
      ])
      .default('black'),
    transition: z.string().default('slide'),
    controls: z.boolean().default(true),
    progress: z.boolean().default(true),
  }),
})

export const collections = {
  posts: postsCollection,
  home: homeCollection,
  addendum: addendumCollection,
  slides: slidesCollection,
}
