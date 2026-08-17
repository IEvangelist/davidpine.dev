import siteConfig from '~/site.config'
import { Resvg } from '@resvg/resvg-js'
import type { APIContext, InferGetStaticPropsType } from 'astro'
import satori, { type SatoriOptions } from 'satori'
import { html } from 'satori-html'
import { dateString, getSortedPosts, resolveThemeColorStyles } from '~/utils'
import path from 'path'
import fs from 'fs'
import type { ReactNode } from 'react'

// Load the font file as binary data
const fontPath = path.resolve(
  './node_modules/@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf',
)
const fontData = fs.readFileSync(fontPath) // Reads the file as a Buffer

const avatarPath = path.resolve(siteConfig.socialCardAvatarImage)
let avatarData: Buffer | undefined
let avatarBase64: string | undefined
if (fs.existsSync(avatarPath)) {
  const extension = path.extname(avatarPath).toLowerCase()
  const mimeType =
    extension === '.png'
      ? 'image/png'
      : extension === '.webp'
        ? 'image/webp'
        : extension === '.jpg' || extension === '.jpeg'
          ? 'image/jpeg'
          : undefined
  if (mimeType) {
    avatarData = fs.readFileSync(avatarPath)
    avatarBase64 = `data:${mimeType};base64,${avatarData.toString('base64')}`
  }
}

const defaultTheme =
  siteConfig.themes.default === 'auto'
    ? siteConfig.themes.include[0]
    : siteConfig.themes.default

const themeStyles = await resolveThemeColorStyles(
  [defaultTheme],
  siteConfig.themes.overrides,
)
const bg = themeStyles[defaultTheme]?.background
const fg = themeStyles[defaultTheme]?.foreground
const accent = themeStyles[defaultTheme]?.accent

if (!bg || !fg || !accent) {
  throw new Error(`Theme ${defaultTheme} does not have required colors`)
}

const ogOptions: SatoriOptions = {
  // debug: true,
  fonts: [
    {
      data: fontData,
      name: 'JetBrains Mono',
      style: 'normal',
      weight: 400,
    },
  ],
  height: 630,
  width: 1200,
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character]!,
  )

const markup = (title: string, pubDate: string | undefined, author: string) =>
  html(`<div tw="flex w-full h-full bg-[${bg}] text-[${fg}] p-14">
    <div tw="flex flex-col flex-1 justify-between border-t-2 border-[${accent}] pt-8">
      <div tw="flex items-center justify-between">
      <p tw="text-2xl m-0">${escapeHtml(siteConfig.author)}</p>
      <p tw="text-xl m-0 text-[${accent}]">davidpine.dev</p>
      </div>
      <div tw="flex items-end justify-between">
      <div tw="flex flex-col flex-1 pr-12">
        ${pubDate ? `<p tw="text-2xl mb-6 text-[${accent}]">${escapeHtml(pubDate)}</p>` : ''}
        <h1 tw="text-6xl m-0 leading-tight">${escapeHtml(title)}</h1>
        ${author !== title ? `<p tw="text-2xl mt-8 mb-0">${escapeHtml(author)}</p>` : ''}
      </div>
      ${
        avatarBase64
          ? `<div tw="flex w-64 h-64 rounded-full overflow-hidden border-4 border-[${accent}]">
              <img src="${avatarBase64}" tw="flex w-full h-full" style="object-fit: cover;" />
            </div>`
          : ''
      }
      </div>
    </div>
  </div>`)

type Props = InferGetStaticPropsType<typeof getStaticPaths>

export async function GET(context: APIContext) {
  const { pubDate, title, author } = context.props as Props
  const svg = await satori(markup(title, pubDate, author) as ReactNode, ogOptions)
  const png = new Resvg(svg).render().asPng()
  return new Response(png, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/png',
    },
  })
}

export async function getStaticPaths() {
  const posts = await getSortedPosts()
  return posts
    .map((post) => ({
      params: { slug: post.id },
      props: {
        pubDate: post.data.published ? dateString(post.data.published) : undefined,
        title: post.data.title,
        author: post.data.author || siteConfig.author,
      },
    }))
    .concat([
      {
        params: { slug: '__default' },
        props: { pubDate: undefined, title: siteConfig.title, author: siteConfig.author },
      },
    ])
}
