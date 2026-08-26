export {}

const tagName = 'spatial-gallery'

class SpatialGalleryElement extends HTMLElement {
  private track?: HTMLElement
  private items: HTMLElement[] = []
  private ticks: HTMLButtonElement[] = []
  private previousButton?: HTMLButtonElement
  private nextButton?: HTMLButtonElement
  private rail?: HTMLElement
  private positionCurrent?: HTMLElement
  private status?: HTMLElement
  private activeIndex = 0
  private animationFrame = 0
  private scrollAnimationFrame = 0
  private pointerStartX = 0
  private pointerStartScrollLeft = 0
  private pointerLastX = 0
  private pointerLastTime = 0
  private pointerVelocity = 0
  private pointerMoved = false
  private resizeObserver?: ResizeObserver
  private reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  private readonly scheduleUpdate = () => {
    if (this.animationFrame) {
      return
    }

    this.animationFrame = window.requestAnimationFrame(() => {
      this.animationFrame = 0
      this.updateTransforms()
    })
  }

  private readonly handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      this.goTo(this.activeIndex - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      this.goTo(this.activeIndex + 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      this.goTo(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      this.goTo(this.items.length - 1)
    }
  }

  private readonly handlePointerDown = (event: PointerEvent) => {
    if (
      !this.track ||
      !event.isPrimary ||
      (event.pointerType === 'mouse' && event.button !== 0) ||
      (event.target instanceof Element &&
        event.target.closest('[data-gallery-inline-player]'))
    ) {
      return
    }

    this.pointerStartX = event.clientX
    this.pointerStartScrollLeft = this.track.scrollLeft
    this.pointerLastX = event.clientX
    this.pointerLastTime = performance.now()
    this.pointerVelocity = 0
    this.pointerMoved = false
    this.stopInlinePlayback()
    this.cancelScrollAnimation()
    this.track.style.scrollSnapType = 'none'
    this.track.setPointerCapture(event.pointerId)
    this.toggleAttribute('data-dragging', true)
  }

  private readonly handlePointerMove = (event: PointerEvent) => {
    if (!this.track?.hasPointerCapture(event.pointerId)) {
      return
    }

    const distance = event.clientX - this.pointerStartX
    this.pointerMoved ||= Math.abs(distance) > 6
    const now = performance.now()
    const elapsed = Math.max(now - this.pointerLastTime, 1)
    const velocity = (this.pointerLastX - event.clientX) / elapsed
    this.pointerVelocity = this.pointerVelocity * 0.65 + velocity * 0.35
    this.pointerLastX = event.clientX
    this.pointerLastTime = now
    this.track.scrollLeft = this.pointerStartScrollLeft - distance

    if (this.pointerMoved && event.cancelable) {
      event.preventDefault()
    }
  }

  private readonly handlePointerUp = (event: PointerEvent) => {
    if (!this.track?.hasPointerCapture(event.pointerId)) {
      return
    }

    this.track.releasePointerCapture(event.pointerId)
    this.toggleAttribute('data-dragging', false)
    const slotWidth = this.items[0]?.offsetWidth ?? 0
    const projectedDistance = Math.min(
      Math.max(this.pointerVelocity * 180, -slotWidth * 0.85),
      slotWidth * 0.85,
    )
    this.goTo(this.findNearestIndex(this.track.scrollLeft + projectedDistance))
  }

  private readonly handlePointerCancel = (event: PointerEvent) => {
    if (!this.track) {
      return
    }

    if (this.track.hasPointerCapture(event.pointerId)) {
      this.track.releasePointerCapture(event.pointerId)
    }
    this.pointerMoved = false
    this.pointerVelocity = 0
    this.toggleAttribute('data-dragging', false)
    this.goTo(this.findNearestIndex())
  }

  private readonly handleClick = (event: MouseEvent) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    if (this.pointerMoved) {
      event.preventDefault()
      event.stopPropagation()
      this.pointerMoved = false
      return
    }

    const tick = target.closest<HTMLButtonElement>('[data-gallery-tick]')
    if (tick) {
      const index = Number(tick.dataset.galleryIndex)
      if (Number.isInteger(index)) {
        this.goTo(index)
      }
      return
    }

    if (target.closest('[data-gallery-previous], [data-gallery-next]')) {
      return
    }

    const item =
      target.closest<HTMLElement>('[data-gallery-item]') ??
      this.findItemAtPoint(event.clientX, event.clientY)
    if (!item) {
      return
    }

    const index = Number(item.dataset.galleryIndex)
    if (index !== this.activeIndex) {
      event.preventDefault()
      this.goTo(index)
      return
    }

    const action = item.querySelector<HTMLElement>('[data-gallery-action]')
    if (action?.dataset.galleryAction === 'activate') {
      event.preventDefault()
      this.playInline(item)
    } else if (
      action instanceof HTMLAnchorElement &&
      !target.closest('[data-gallery-action="link"]')
    ) {
      action.click()
    }
  }

  private readonly handlePrevious = () => this.goTo(this.activeIndex - 1)
  private readonly handleNext = () => this.goTo(this.activeIndex + 1)
  private readonly handleImageError = (event: Event) => {
    if (!(event.target instanceof HTMLImageElement)) {
      return
    }

    const fallback = event.target.dataset.fallbackSrc
    if (!fallback) {
      return
    }

    delete event.target.dataset.fallbackSrc
    event.target.src = fallback
  }

  connectedCallback() {
    if (this.dataset.initialized === 'true') {
      return
    }

    this.track = this.querySelector<HTMLElement>('[data-gallery-track]') ?? undefined
    this.items = Array.from(this.querySelectorAll<HTMLElement>('[data-gallery-item]'))
    this.ticks = Array.from(
      this.querySelectorAll<HTMLButtonElement>('[data-gallery-tick]'),
    )
    this.previousButton =
      this.querySelector<HTMLButtonElement>('[data-gallery-previous]') ?? undefined
    this.nextButton =
      this.querySelector<HTMLButtonElement>('[data-gallery-next]') ?? undefined
    this.rail = this.querySelector<HTMLElement>('.spatial-gallery__rail') ?? undefined
    this.positionCurrent =
      this.querySelector<HTMLElement>('[data-gallery-position-current]') ?? undefined
    this.status = this.querySelector<HTMLElement>('[data-gallery-status]') ?? undefined

    if (!this.track || this.items.length === 0) {
      return
    }

    this.dataset.initialized = 'true'
    this.track.addEventListener('scroll', this.scheduleUpdate, { passive: true })
    this.track.addEventListener('keydown', this.handleKeydown)
    this.track.addEventListener('pointerdown', this.handlePointerDown)
    this.track.addEventListener('pointermove', this.handlePointerMove)
    this.track.addEventListener('pointerup', this.handlePointerUp)
    this.track.addEventListener('pointercancel', this.handlePointerCancel)
    this.addEventListener('click', this.handleClick)
    this.addEventListener('error', this.handleImageError, true)
    this.previousButton?.addEventListener('click', this.handlePrevious)
    this.nextButton?.addEventListener('click', this.handleNext)
    this.reduceMotion.addEventListener('change', this.scheduleUpdate)

    this.resizeObserver = new ResizeObserver(this.scheduleUpdate)
    this.resizeObserver.observe(this.track)
    this.items.forEach((item) => this.resizeObserver?.observe(item))

    window.requestAnimationFrame(() => {
      this.updateTransforms()
      this.setActive(0, true)
    })
  }

  disconnectedCallback() {
    if (!this.track) {
      return
    }

    this.track.removeEventListener('scroll', this.scheduleUpdate)
    this.track.removeEventListener('keydown', this.handleKeydown)
    this.track.removeEventListener('pointerdown', this.handlePointerDown)
    this.track.removeEventListener('pointermove', this.handlePointerMove)
    this.track.removeEventListener('pointerup', this.handlePointerUp)
    this.track.removeEventListener('pointercancel', this.handlePointerCancel)
    this.removeEventListener('click', this.handleClick)
    this.removeEventListener('error', this.handleImageError, true)
    this.previousButton?.removeEventListener('click', this.handlePrevious)
    this.nextButton?.removeEventListener('click', this.handleNext)
    this.reduceMotion.removeEventListener('change', this.scheduleUpdate)
    this.resizeObserver?.disconnect()
    window.cancelAnimationFrame(this.animationFrame)
    this.stopInlinePlayback()
    this.cancelScrollAnimation()
    delete this.dataset.initialized
  }

  private cancelScrollAnimation() {
    window.cancelAnimationFrame(this.scrollAnimationFrame)
    this.scrollAnimationFrame = 0
    this.track?.style.removeProperty('scroll-snap-type')
  }

  private playInline(item: HTMLElement) {
    const youtubeId = item.dataset.mediaYoutubeId
    if (!youtubeId) {
      const sourceUrl = item.dataset.mediaUrl
      if (sourceUrl) {
        window.open(sourceUrl, '_blank', 'noopener,noreferrer')
      }
      return
    }

    const card = item.querySelector<HTMLElement>('.spatial-gallery__card')
    if (!card || item.hasAttribute('data-playing')) {
      return
    }

    this.stopInlinePlayback()

    const iframe = document.createElement('iframe')
    iframe.className = 'spatial-gallery__inline-player'
    iframe.dataset.galleryInlinePlayer = ''
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&controls=1&playsinline=1&rel=0`
    iframe.title = `${item.dataset.mediaTitle ?? 'Selected video'} video player`
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture'
    iframe.allowFullscreen = true
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'

    item.toggleAttribute('data-playing', true)
    item
      .querySelector<HTMLElement>('[data-gallery-action]')
      ?.setAttribute('tabindex', '-1')
    card.append(iframe)
  }

  private stopInlinePlayback() {
    const playingItem = this.querySelector<HTMLElement>(
      '[data-gallery-item][data-playing]',
    )
    if (!playingItem) {
      return
    }

    playingItem.querySelector('[data-gallery-inline-player]')?.remove()
    playingItem.removeAttribute('data-playing')

    if (playingItem === this.items[this.activeIndex]) {
      playingItem
        .querySelector<HTMLElement>('[data-gallery-action]')
        ?.setAttribute('tabindex', '0')
    }
  }

  private findNearestIndex(scrollLeft = this.track?.scrollLeft ?? 0) {
    if (!this.track) {
      return 0
    }

    const viewportCenter = scrollLeft + this.track.clientWidth / 2
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    this.items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2
      const distance = Math.abs(itemCenter - viewportCenter)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    return nearestIndex
  }

  private findItemAtPoint(x: number, y: number) {
    return [...this.items]
      .sort(
        (left, right) =>
          Math.abs(Number(left.dataset.galleryIndex) - this.activeIndex) -
          Math.abs(Number(right.dataset.galleryIndex) - this.activeIndex),
      )
      .find((item) => {
        const cover = item.querySelector<HTMLElement>('[data-gallery-cover]')
        if (!cover) {
          return false
        }

        const bounds = cover.getBoundingClientRect()
        return (
          x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom
        )
      })
  }

  private goTo(index: number, smooth = true) {
    if (!this.track || this.items.length === 0) {
      return
    }

    const nextIndex = Math.min(Math.max(index, 0), this.items.length - 1)
    const item = this.items[nextIndex]
    const left = item.offsetLeft - (this.track.clientWidth - item.offsetWidth) / 2

    if (nextIndex !== this.activeIndex) {
      this.stopInlinePlayback()
    }
    this.cancelScrollAnimation()

    if (!smooth || this.reduceMotion.matches) {
      this.track.scrollLeft = left
      this.updateTransforms()
      this.setActive(nextIndex)
      return
    }

    const startLeft = this.track.scrollLeft
    const distance = left - startLeft
    const duration = Math.min(900, 480 + Math.abs(nextIndex - this.activeIndex) * 28)
    const startTime = performance.now()

    this.track.style.scrollSnapType = 'none'

    const animate = (time: number) => {
      if (!this.track) {
        return
      }

      const progress = Math.min((time - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      this.track.scrollLeft = startLeft + distance * eased
      this.updateTransforms()

      if (progress < 1) {
        this.scrollAnimationFrame = window.requestAnimationFrame(animate)
      } else {
        this.scrollAnimationFrame = 0
        this.track.scrollLeft = left
        this.track.style.removeProperty('scroll-snap-type')
        this.updateTransforms()
        this.setActive(nextIndex)
      }
    }

    this.scrollAnimationFrame = window.requestAnimationFrame(animate)
  }

  private updateTransforms() {
    if (!this.track || this.items.length === 0) {
      return
    }

    const flat =
      this.reduceMotion.matches || !CSS.supports('transform-style', 'preserve-3d')
    const viewportCenter = this.track.scrollLeft + this.track.clientWidth / 2
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    this.items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2
      const slotWidth = Math.max(item.offsetWidth, 1)
      const position = (itemCenter - viewportCenter) / slotWidth
      const distance = Math.abs(position)
      const cover = item.querySelector<HTMLElement>('[data-gallery-cover]')
      const mediaVariant = this.classList.contains('spatial-gallery--media')

      if (!cover) {
        return
      }

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }

      if (flat) {
        cover.style.transform = 'translate3d(-50%, 0, 0)'
        cover.style.opacity = distance > 1.2 ? '0.65' : '1'
        item.style.setProperty('--gallery-parallax', '0%')
      } else {
        const clamped = Math.min(Math.max(position, -4.5), 4.5)
        const depth = Math.min(distance, 4.5)
        const translate = clamped * (mediaVariant ? 18 : 24)
        const translateZ = mediaVariant ? 220 - depth * 330 : 260 - depth * 260
        const rotateY = mediaVariant ? clamped * -40 : 0
        const scale = mediaVariant
          ? Math.max(0.74, 1 - depth * 0.13)
          : Math.max(0.64, 1.02 - depth * 0.18)
        cover.style.transform = `translate3d(calc(-50% + ${translate}%), 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`
        cover.style.opacity =
          depth > 4.1 ? '0' : String(mediaVariant ? 1 : Math.max(0.28, 1 - depth * 0.28))
        item.style.setProperty(
          '--gallery-parallax',
          `${clamped * (mediaVariant ? -1.5 : -2.4)}%`,
        )
      }

      item.style.zIndex = String(100 - Math.round(distance * 12))
      item.dataset.depth = String(Math.min(Math.round(distance), 5))
    })

    this.setActive(nearestIndex)
  }

  private setActive(index: number, force = false) {
    if (!force && index === this.activeIndex) {
      return
    }

    this.stopInlinePlayback()
    const previousIndex = this.activeIndex
    this.activeIndex = index
    this.dataset.direction =
      index === previousIndex ? 'none' : index > previousIndex ? 'next' : 'previous'
    this.items.forEach((item, itemIndex) => {
      const active = itemIndex === index
      const action = item.querySelector<HTMLElement>('[data-gallery-action]')
      item.toggleAttribute('data-active', active)
      if (active) {
        item.setAttribute('aria-current', 'true')
        action?.setAttribute('tabindex', '0')
      } else {
        item.removeAttribute('aria-current')
        action?.setAttribute('tabindex', '-1')
      }
    })
    this.ticks.forEach((tick, tickIndex) => {
      if (tickIndex === index) {
        tick.setAttribute('aria-current', 'true')
      } else {
        tick.removeAttribute('aria-current')
      }
    })

    if (this.positionCurrent) {
      this.positionCurrent.textContent = String(index + 1).padStart(2, '0')
    }

    const activeTick = this.ticks[index]
    if (this.rail && activeTick) {
      const left =
        activeTick.offsetLeft - (this.rail.clientWidth - activeTick.offsetWidth) / 2
      this.rail.scrollTo({
        left,
        behavior: 'auto',
      })
    }

    if (this.previousButton) {
      this.previousButton.disabled = index === 0
    }
    if (this.nextButton) {
      this.nextButton.disabled = index === this.items.length - 1
    }

    const activeItem = this.items[index]
    if (this.status && activeItem) {
      this.status.textContent = `${index + 1} of ${this.items.length}. ${activeItem.dataset.galleryAnnouncement ?? ''}`
    }

    if (activeItem) {
      this.dispatchEvent(
        new CustomEvent('spatial-gallery:change', {
          bubbles: true,
          detail: {
            id: activeItem.dataset.galleryItemId,
            index,
            item: activeItem,
          },
        }),
      )
    }
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, SpatialGalleryElement)
}
