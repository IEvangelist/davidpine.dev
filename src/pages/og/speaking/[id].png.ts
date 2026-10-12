import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import type { APIRoute, GetStaticPaths } from 'astro'
import { createElement as h } from 'react'
import satori from 'satori'
import sharp from 'sharp'
import { speakingJourney, type SpeakingEvent } from '~/data/speaking'
import { getSpeakingLocationLabel } from '~/data/speaking-sharing'
import siteConfig from '~/site.config'
import { resolveThemeColorStyles } from '~/utils'

export const prerender = true

const fonts = [
  {
    name: 'JetBrains Mono',
    data: readFileSync(
      resolve(
        'node_modules',
        '@expo-google-fonts',
        'jetbrains-mono',
        '400Regular',
        'JetBrainsMono_400Regular.ttf',
      ),
    ),
    weight: 400 as const,
  },
  {
    name: 'JetBrains Mono',
    data: readFileSync(
      resolve(
        'node_modules',
        '@expo-google-fonts',
        'jetbrains-mono',
        '700Bold',
        'JetBrainsMono_700Bold.ttf',
      ),
    ),
    weight: 700 as const,
  },
]
const avatar = await sharp(resolve(siteConfig.socialCardAvatarImage))
  .resize(320, 320, { fit: 'cover' })
  .png()
  .toBuffer()
const avatarUrl = `data:image/png;base64,${avatar.toString('base64')}`
const theme =
  siteConfig.themes.default === 'auto'
    ? siteConfig.themes.include[0]
    : siteConfig.themes.default
const styles = (await resolveThemeColorStyles([theme], siteConfig.themes.overrides))[
  theme
]
if (!styles) {
  throw new Error(`Speaking card theme not found: ${theme}`)
}
const { background, foreground, accent, heading2 } = styles
if (!background || !foreground || !accent || !heading2) {
  throw new Error(`Theme ${theme} does not have the required speaking card colors`)
}
const globeUrl = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="440" viewBox="0 0 440 440">
    <g fill="none" stroke="${accent}" stroke-width="1.5">
      <circle cx="220" cy="220" r="206"/>
      <ellipse cx="220" cy="220" rx="144" ry="206"/>
      <ellipse cx="220" cy="220" rx="66" ry="206"/>
      <ellipse cx="220" cy="220" rx="206" ry="144"/>
      <ellipse cx="220" cy="220" rx="206" ry="66"/>
      <path d="M14 220h412M220 14v412"/>
    </g>
  </svg>`,
).toString('base64')}`

function poster(event: SpeakingEvent) {
  const location = getSpeakingLocationLabel(event)
  const titleSize = Math.min(
    64,
    Math.floor(Math.sqrt((700 * 300) / (event.talk.length * 0.72))),
  )

  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: '44px 48px',
        backgroundColor: background,
        color: foreground,
        fontFamily: 'JetBrains Mono',
      },
    },
    h('img', {
      src: globeUrl,
      width: 440,
      height: 440,
      style: { position: 'absolute', top: 88, right: -14, opacity: 0.22 },
    }),
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 28,
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            width: 760,
            fontSize: 24,
            fontWeight: 700,
            color: heading2,
            lineHeight: 1.3,
          },
        },
        event.event,
      ),
      h(
        'div',
        { style: { display: 'flex', fontSize: 20, color: accent } },
        new URL(siteConfig.site).hostname,
      ),
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          gap: 40,
          padding: '26px 0',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            width: 736,
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
          },
        },
        event.talk,
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 272,
            gap: 22,
          },
        },
        h('img', {
          src: avatarUrl,
          width: 248,
          height: 248,
          style: { borderRadius: '50%', border: `4px solid ${accent}` },
        }),
        h(
          'div',
          { style: { display: 'flex', fontSize: 25, fontWeight: 700 } },
          siteConfig.author,
        ),
      ),
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          borderTop: `2px solid ${accent}`,
          paddingTop: 22,
          fontSize: 20,
        },
      },
      h(
        'div',
        { style: { display: 'flex', flexShrink: 0, color: heading2, fontWeight: 700 } },
        `${event.displayDate}${event.status === 'upcoming' ? ' / Upcoming' : ''}`,
      ),
      location &&
        h(
          'div',
          { style: { display: 'flex', textAlign: 'right', lineHeight: 1.3 } },
          location,
        ),
    ),
  )
}

export const getStaticPaths = (() =>
  speakingJourney.map((event) => ({
    params: { id: event.id },
    props: { event },
  }))) satisfies GetStaticPaths

export const GET: APIRoute<{ event: SpeakingEvent }> = async ({ props }) => {
  const svg = await satori(poster(props.event), { width: 1200, height: 630, fonts })
  const png = new Resvg(svg).render().asPng()
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
