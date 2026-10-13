import { speakingEvents } from '../../src/data/speaking.ts'

const eventIds = new Set(speakingEvents.map(({ id }) => id))

export default function speakingShare(request: Request) {
  // Netlify's manifest does not accept HEAD in an explicit method filter.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return
  }

  const url = new URL(request.url)
  const selectedIds = url.searchParams.getAll('event')
  if (selectedIds.length === 0) {
    return
  }

  if (selectedIds.length !== 1 || !eventIds.has(selectedIds[0])) {
    return Response.redirect(new URL(url.pathname.replace(/\/$/, ''), url.origin), 302)
  }

  return new URL(
    `/speaking-share/${encodeURIComponent(selectedIds[0])}/index.html`,
    url.origin,
  )
}

export const config = {
  path: ['/speaking', '/speaking/'],
  onError: 'bypass',
}
