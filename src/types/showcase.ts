import type { ImageMetadata } from 'astro'

export type SpatialGalleryAction = 'activate' | 'link'

export interface SpatialGalleryItem {
  id: string
  title: string
  meta: string
  label: string
  tickLabel?: string
  image?: ImageMetadata | string
  imageAlt?: string
  href?: string
  action?: SpatialGalleryAction
  actionLabel?: string
  data?: Record<string, boolean | number | string>
}
