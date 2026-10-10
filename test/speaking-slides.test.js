import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { registerHooks, stripTypeScriptTypes } from 'node:module'
import { basename, extname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { visit } from 'unist-util-visit'

const root = fileURLToPath(new URL('../', import.meta.url))
const configUrl = new URL('../src/content.config.ts', import.meta.url)
const speakingUrl = new URL('../src/data/speaking.ts', import.meta.url)
const sourceUrls = new Set([configUrl.href, speakingUrl.href])
const astroContentUrl = `data:text/javascript,${encodeURIComponent(`
  export { defineCollection } from '${import.meta.resolve('astro/content/config')}'
  export { z } from '${import.meta.resolve('astro/zod')}'
`)}`

// Resolve Astro's virtual import to its real exports without mocking the schema.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === 'astro:content'
      ? { url: astroContentUrl, shortCircuit: true }
      : nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    return sourceUrls.has(url)
      ? {
          format: 'module',
          source: stripTypeScriptTypes(readFileSync(fileURLToPath(url), 'utf8')),
          shortCircuit: true,
        }
      : nextLoad(url, context)
  },
})

const [{ collections }, { speakingEvents, speakingJourney }] = await Promise.all([
  import(configUrl.href),
  import(speakingUrl.href),
])
hooks.deregister()

const title = 'Inside Aspire: The Architecture Behind the AI Loop'
const deckUrl = 'https://ievangelist.github.io/inside-aspire/'
const eventId = '2026-11-17-wi-net-user-group-2026-aspire-talk-with-david-pine'
const slideRoot = join(root, 'src', 'content', 'slides')
const entries = readdirSync(slideRoot, { recursive: true })
  .filter((file) => ['.md', '.mdx'].includes(extname(file)))
  .map((file) => ({
    id: basename(file, extname(file)),
    data: matter(readFileSync(join(slideRoot, file), 'utf8')).data,
  }))
const metadata = entries.find(({ id }) => id === 'inside-aspire').data
const slidesPage = fromHtmlIsomorphic(
  readFileSync(join(root, 'dist', 'slides', 'index.html'), 'utf8'),
)

function elements(tree, tagName) {
  const matches = []
  visit(tree, 'element', (node) => {
    if (node.tagName === tagName) matches.push(node)
  })
  return matches
}

function text(node) {
  return node.type === 'text' ? node.value : (node.children ?? []).map(text).join('')
}

const cards = elements(slidesPage, 'a').filter((node) =>
  Object.hasOwn(node.properties, 'dataSlideCard'),
)

test('slide schema accepts internal entries and absolute HTTP(S) deck URLs', () => {
  for (const externalUrl of [
    undefined,
    deckUrl,
    'http://example.com/deck/',
    'HTTPS://example.com/deck/',
  ]) {
    const parsed = collections.slides.schema.parse({ ...metadata, externalUrl })
    assert.equal(parsed.externalUrl, externalUrl)
    assert.equal(parsed.theme, 'black')
    assert.equal(parsed.transition, 'slide')
  }
})

test('slide schema rejects relative, malformed, and non-HTTP(S) URLs', () => {
  for (const externalUrl of [
    '',
    '/slides/inside-aspire',
    'not a URL',
    'javascript:alert(1)',
    'data:text/html,<h1>Deck</h1>',
    'ftp://example.com/deck/',
    'file:///deck.html',
  ]) {
    assert.equal(
      collections.slides.schema.safeParse({ ...metadata, externalUrl }).success,
      false,
      externalUrl,
    )
  }
})

test('Inside Aspire metadata uses the approved copy and event date', () => {
  const parsed = collections.slides.schema.parse(metadata)
  assert.equal(parsed.title, title)
  assert.equal(parsed.author, 'David Pine')
  assert.equal(
    parsed.description,
    'Follow a real Aspire PR through AI-assisted documentation, then see C# Markdown parsing, live CLI search, NativeAOT, and the shipped AI skills close the loop.',
  )
  assert.equal(parsed.pubDate.getFullYear(), 2026)
  assert.equal(parsed.pubDate.getMonth(), 10)
  assert.equal(parsed.pubDate.getDate(), 17)
  assert.deepEqual(parsed.tags, [
    'Aspire',
    'AI',
    'Architecture',
    'Documentation',
    'NativeAOT',
  ])
  assert.equal(parsed.externalUrl, deckUrl)
})

test('the Wisconsin event retains its ID, links, status, and keyed location', () => {
  const event = speakingEvents.find(({ id }) => id === eventId)
  assert.deepEqual(event, {
    id: eventId,
    date: '2026-11-17',
    displayDate: 'Nov 17, 2026',
    event: 'WI .NET User Group - 2026',
    eventUrl: 'https://www.meetup.com/Wisconsin-Net-Users-Group/',
    talk: title,
    talkUrl: 'https://www.meetup.com/wisconsin-net-users-group/events/316176923',
    status: 'upcoming',
    format: 'in-person',
    location: {
      city: 'Brookfield',
      region: 'Wisconsin',
      country: 'United States',
      latitude: 43.0606,
      longitude: -88.1065,
    },
  })
  const stop = speakingJourney.find(({ id }) => id === eventId)
  assert.equal(stop.talk, title)
  assert.deepEqual(stop.location, event.location)
})

test('external decks keep listing metadata without generating internal deck pages', () => {
  assert.equal(cards.length, entries.length)
  for (const { id, data } of entries.filter(({ data }) => data.externalUrl)) {
    const card = cards.find(({ properties }) => properties.href === data.externalUrl)
    assert.ok(card, id)
    assert.equal(text(elements(card, 'h2')[0]), data.title)
    assert.deepEqual(JSON.parse(card.properties.dataTags), data.tags)
    assert.equal(existsSync(join(root, 'dist', 'slides', id, 'index.html')), false)
  }
  const card = cards.find(({ properties }) => properties.href === deckUrl)
  assert.ok(text(card).includes(metadata.description))
  assert.ok(text(card).includes('David Pine'))
  assert.ok(text(card).includes('Nov 17, 2026'))
})

test('internal decks retain filename routes, viewer, back link, and print link', () => {
  for (const { id, data } of entries.filter(({ data }) => !data.externalUrl)) {
    const route = `/slides/${id}`
    const card = cards.find(({ properties }) => properties.href === route)
    assert.ok(card, id)
    assert.equal(text(elements(card, 'h2')[0]), data.title)
    const page = fromHtmlIsomorphic(
      readFileSync(join(root, 'dist', 'slides', id, 'index.html'), 'utf8'),
    )
    assert.ok(
      elements(page, 'div').some(({ properties }) => properties.id === 'slide-container'),
    )
    const links = elements(page, 'a').map(({ properties }) => properties.href)
    assert.ok(links.includes('/slides'))
    assert.ok(links.includes(`${route}?print-pdf`))
  }
})

test('topic filters retain every internal and external tag and its count', () => {
  const counts = new Map()
  for (const { data } of entries) {
    for (const tag of data.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  const filters = elements(slidesPage, 'a').filter(({ properties }) =>
    Object.hasOwn(properties, 'dataSlideFilter'),
  )
  assert.equal(filters.length, counts.size + 1)
  for (const [tag, count] of counts) {
    const filter = filters.find(({ properties }) => properties.dataTag === tag)
    assert.ok(filter, tag)
    assert.equal(filter.properties.href, `/slides?tag=${encodeURIComponent(tag)}`)
    assert.equal(text(filter).trim(), `${tag} (${count})`)
  }
})
