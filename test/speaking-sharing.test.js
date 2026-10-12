import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { registerHooks, stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'

const sourceRoot = new URL('../src/', import.meta.url).href

// Load the actual data helpers with Node 22, without an Astro server or dependencies.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.startsWith(sourceRoot) && specifier.startsWith('.')) {
      return nextResolve(new URL(`${specifier}.ts`, context.parentURL).href, context)
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.startsWith(sourceRoot) && url.endsWith('.ts')) {
      return {
        format: 'module',
        source: stripTypeScriptTypes(readFileSync(new URL(url), 'utf8')),
        shortCircuit: true,
      }
    }
    return nextLoad(url, context)
  },
})

const { speakingEvents, speakingJourney } = await import('../src/data/speaking.ts')
const { getSharedSpeakingEvent, getSpeakingLocationLabel, getSpeakingShare } =
  await import('../src/data/speaking-sharing.ts')

test('every event has a unique, stable query link and its own PNG', () => {
  const urls = new Set()
  const images = new Set()
  for (const event of speakingJourney) {
    const share = getSpeakingShare(event)
    const url = new URL(share.url)
    assert.equal(url.origin, 'https://davidpine.dev')
    assert.equal(url.pathname, '/speaking')
    assert.equal(url.searchParams.get('event'), event.id)
    assert.deepEqual([...url.searchParams.keys()], ['event'])
    assert.equal(new URL(share.imageUrl).pathname, `/og/speaking/${event.id}.png`)
    assert.ok(share.title.includes(event.talk))
    assert.ok(share.description.includes(event.event))
    assert.ok(share.description.includes(event.displayDate))
    assert.equal(getSharedSpeakingEvent(event.id), event)
    urls.add(share.url)
    images.add(share.imageUrl)
  }
  assert.equal(urls.size, speakingJourney.length)
  assert.equal(images.size, speakingJourney.length)
})

test('unknown and malformed IDs do not resolve to a successful event', () => {
  for (const id of [null, '', 'unknown', '../speaking', '<script>', '__proto__']) {
    assert.equal(getSharedSpeakingEvent(id), undefined)
  }
})

test('archive records and gallery stops share the same enriched event context', () => {
  for (const event of speakingEvents) {
    assert.deepEqual(
      getSpeakingShare(event),
      getSpeakingShare(getSharedSpeakingEvent(event.id)),
    )
  }
})

test('metadata preserves title punctuation without adding a second full stop', () => {
  const event = speakingJourney[0]
  for (const talk of ['A talk.', 'A talk!', 'A talk?', 'A talk']) {
    const share = getSpeakingShare({ ...event, talk })
    assert.doesNotMatch(share.description, /[.!?]\. /)
    assert.doesNotMatch(share.imageAlt, /[.!?]\. /)
    assert.ok(share.title.includes(talk))
  }
})

test('location metadata uses known facts and does not invent a venue', () => {
  const event = speakingJourney[0]
  assert.equal(
    getSpeakingLocationLabel({ ...event, location: undefined, format: undefined }),
    undefined,
  )
  assert.equal(
    getSpeakingLocationLabel({ ...event, location: undefined, format: 'online' }),
    'Online',
  )
  const located = speakingJourney.find((entry) => entry.location)
  assert.ok(getSpeakingShare(located).imageAlt.includes(located.location.city))
  assert.ok(getSpeakingLocationLabel(located).includes(located.location.country))
})

const origin = process.env.SPEAKING_TEST_URL

function meta(html, key) {
  const tag = html.match(
    new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`, 'g'),
  )
  assert.equal(tag?.length, 1, `exactly one ${key}`)
  return tag[0]
    .match(/content="([^"]*)"/)[1]
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#039;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

test(
  'request-time HTML isolates selected events and preselects their cards',
  { skip: !origin },
  async () => {
    const events = [
      speakingJourney[0],
      speakingJourney[Math.floor(speakingJourney.length / 2)],
    ]
    await Promise.all(
      [...events, ...events].map(async (event) => {
        const share = getSpeakingShare(event)
        const response = await fetch(new URL(`/speaking?event=${event.id}`, origin))
        assert.equal(response.status, 200)
        assert.match(response.headers.get('cache-control'), /no-store/)
        assert.equal(response.headers.get('set-cookie'), null)
        const html = await response.text()
        assert.equal(meta(html, 'og:url'), share.url)
        assert.equal(meta(html, 'og:description'), share.description)
        assert.ok(meta(html, 'og:title').includes(event.talk))
        assert.equal(
          new URL(meta(html, 'og:image')).pathname,
          new URL(share.imageUrl).pathname,
        )
        assert.equal(meta(html, 'og:image:width'), '1200')
        assert.equal(meta(html, 'og:image:height'), '630')
        assert.equal(meta(html, 'twitter:card'), 'summary_large_image')
        assert.equal(meta(html, 'twitter:image'), meta(html, 'og:image'))
        assert.match(html, /rel="canonical" href="https:\/\/davidpine.dev\/speaking"/)
        const activeItems = [
          ...html.matchAll(
            /<li\b[^>]*data-gallery-item-id="([^"]*)"[^>]*data-active(?:[=\s>])/g,
          ),
        ]
        assert.deepEqual(
          activeItems.map((match) => match[1]),
          [event.id],
        )
        const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1])
        assert.equal(new Set(ids).size, ids.length, 'unique menu and heading IDs')
      }),
    )
  },
)

test(
  'trailing-slash speaking URLs retain the overview and selected-event metadata',
  { skip: !origin },
  async () => {
    const event = speakingJourney[0]
    const share = getSpeakingShare(event)
    for (const path of ['/speaking/', `/speaking/?event=${event.id}`]) {
      const response = await fetch(new URL(path, origin), { redirect: 'manual' })
      assert.equal(response.status, 200, `${path} remains available`)
      const html = await response.text()
      assert.match(html, /rel="canonical" href="https:\/\/davidpine.dev\/speaking"/)
      if (path.includes('?')) {
        assert.equal(meta(html, 'og:url'), share.url)
        assert.equal(meta(html, 'og:description'), share.description)
        assert.match(
          html,
          new RegExp(`data-gallery-item-id="${event.id}"[^>]*data-active`),
        )
      } else {
        assert.match(meta(html, 'og:image'), /\/social-cards\/__default\.png$/)
      }
    }
  },
)

test(
  'overview stays generic; bad event links redirect and unknown images return 404',
  { skip: !origin },
  async () => {
    const overview = await fetch(new URL('/speaking', origin))
    assert.equal(overview.status, 200)
    assert.match(
      meta(await overview.text(), 'og:image'),
      /\/social-cards\/__default\.png$/,
    )
    for (const query of ['event=unknown', 'event=', 'event=unknown&event=duplicate']) {
      const response = await fetch(new URL(`/speaking?${query}`, origin), {
        redirect: 'manual',
      })
      assert.equal(response.status, 302)
      assert.equal(
        new URL(response.headers.get('location'), origin).pathname,
        '/speaking',
      )
    }
    const missing = await fetch(new URL('/og/speaking/unknown.png', origin))
    assert.equal(missing.status, 404)
  },
)

test(
  'event image responses contain real 1200 x 630 PNGs',
  { skip: !origin },
  async () => {
    for (const event of [speakingJourney[0], speakingJourney.at(-1)]) {
      const response = await fetch(
        new URL(new URL(getSpeakingShare(event).imageUrl).pathname, origin),
      )

      assert.equal(response.status, 200)
      assert.match(response.headers.get('content-type'), /^image\/png/)
      const png = Buffer.from(await response.arrayBuffer())
      assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
      assert.equal(png.readUInt32BE(16), 1200)
      assert.equal(png.readUInt32BE(20), 630)
    }
  },
)

test(
  'the speaking page retains its working header image under SSR',
  { skip: !origin },
  async () => {
    const response = await fetch(
      new URL(`/speaking?event=${speakingJourney[0].id}`, origin),
    )
    const html = await response.text()
    const source = html.match(/<img\b[^>]*\bsrc="([^"]+)"/)?.[1]
    assert.ok(source, 'header avatar is present')
    const image = await fetch(new URL(source.replace(/&amp;/g, '&'), origin))
    assert.equal(image.status, 200)
    assert.match(image.headers.get('content-type'), /^image\//)
  },
)

test(
  'archive sharing preserves the original event order and every event control',
  { skip: !origin },
  async () => {
    const response = await fetch(new URL('/speaking', origin))
    const html = await response.text()
    const archive = html.slice(html.indexOf('<speaking-archive'))
    const sharedIds = [
      ...archive.matchAll(
        /data-share-url="https:\/\/davidpine.dev\/speaking\?event=([^"]+)"/g,
      ),
    ].map((match) => decodeURIComponent(match[1]))
    const expected = [
      ...speakingEvents
        .filter((event) => event.status === 'upcoming')
        .sort((a, b) => a.date.localeCompare(b.date)),
      ...speakingEvents
        .filter((event) => event.status === 'past')
        .sort((a, b) => b.date.localeCompare(a.date)),
    ]
    assert.deepEqual(
      sharedIds,
      expected.map((event) => event.id),
    )
    assert.equal([...html.matchAll(/<post-share\b/g)].length, speakingEvents.length * 2)
  },
)
