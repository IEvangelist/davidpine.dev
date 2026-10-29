import siteConfig from '../site.config'
import { speakingJourney, type SpeakingEvent } from './speaking'

const eventsById = new Map(speakingJourney.map((event) => [event.id, event]))

export function getSharedSpeakingEvent(id: string | null) {
  return id === null ? undefined : eventsById.get(id)
}

export function getSpeakingLocationLabel(event: SpeakingEvent) {
  if (event.location) {
    return [event.location.city, event.location.region, event.location.country]
      .filter(Boolean)
      .join(', ')
  }

  return event.format === 'online' ? 'Online' : undefined
}

export function getSpeakingShare(event: SpeakingEvent) {
  const url = new URL('/speaking', siteConfig.site)
  url.searchParams.set('event', event.id)
  const location = getSpeakingLocationLabel(eventsById.get(event.id) ?? event)
  const talkSentence = /[.!?]$/.test(event.talk) ? event.talk : `${event.talk}.`
  const description = `${siteConfig.author} at ${event.event}: ${talkSentence} ${event.displayDate}${location ? ` / ${location}` : ''}.`

  return {
    title: `${event.talk} | ${event.event}`,
    description,
    url: url.href,
    imageUrl: new URL(`/og/speaking/${encodeURIComponent(event.id)}.png`, siteConfig.site)
      .href,
    imageAlt: `${talkSentence} ${event.event}, ${event.displayDate}${location ? `, ${location}` : ''}. ${siteConfig.author}.`,
  }
}
