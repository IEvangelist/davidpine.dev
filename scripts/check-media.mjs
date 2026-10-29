import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { visit } from 'unist-util-visit'

const directory = path.resolve(process.argv[2] ?? 'dist')
const origin = new URL('https://davidpine.dev')
const references = new Map()
let pages = 0

function srcsetUrls(srcset) {
  const urls = []
  while (srcset.length > 0) {
    srcset = srcset.replace(/^[\s,]+/, '')
    const url = srcset.match(/^\S+/)?.[0]
    if (!url) break
    urls.push(url.replace(/,+$/, ''))
    srcset = srcset.slice(url.length)
    if (!url.endsWith(',')) {
      const separator = srcset.indexOf(',')
      srcset = separator === -1 ? '' : srcset.slice(separator + 1)
    }
  }
  return urls
}

async function crawl(currentDirectory) {
  for (const entry of await readdir(currentDirectory, { withFileTypes: true })) {
    const file = path.join(currentDirectory, entry.name)
    if (entry.isDirectory()) {
      await crawl(file)
    } else if (entry.name.endsWith('.html')) {
      pages++
      const page =
        `/${path.relative(directory, file).split(path.sep).join('/')}`.replace(
          /\/index\.html$/,
          '',
        ) || '/'
      const tree = fromHtmlIsomorphic(await readFile(file, 'utf8'))
      visit(tree, 'element', (node) => {
        if (!['img', 'source', 'video', 'audio'].includes(node.tagName)) return
        const { src, poster, srcSet } = node.properties
        const urls = [src, poster]
        if (typeof srcSet === 'string') {
          urls.push(...srcsetUrls(srcSet))
        }
        for (const value of urls) {
          if (typeof value !== 'string' || value.startsWith('data:')) continue
          const url = new URL(value, new URL(page, origin))
          if (url.origin !== origin.origin) continue
          const pathname = decodeURIComponent(url.pathname)
          if (!references.has(pathname)) references.set(pathname, new Set())
          references.get(pathname).add(page)
        }
      })
    }
  }
}

await crawl(directory)
let missing = 0
for (const [pathname, pages] of references) {
  const file = path.resolve(directory, `.${pathname}`)
  if (!file.startsWith(`${directory}${path.sep}`)) {
    throw new Error(`Media path escapes build directory: ${pathname}`)
  }
  try {
    const info = await stat(file)
    if (!info.isFile() || info.size === 0)
      throw new Error(`Empty or non-file media: ${file}`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    missing++
    console.error(`Missing media: ${pathname}\n  ${[...pages].join('\n  ')}`)
  }
}

console.log(
  `Checked ${references.size} local media URLs across ${pages} HTML pages; ${missing} missing.`,
)
if (missing > 0) process.exitCode = 1
