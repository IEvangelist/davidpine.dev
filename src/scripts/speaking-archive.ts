export {}

const tagName = 'speaking-archive'

class SpeakingArchiveElement extends HTMLElement {
  private buttons: HTMLButtonElement[] = []
  private groups: HTMLElement[] = []
  private count?: HTMLElement

  private readonly handleClick = (event: MouseEvent) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const button = target.closest<HTMLButtonElement>('[data-archive-filter]')
    if (!button || button.disabled) {
      return
    }

    const filter = button.dataset.archiveFilter
    if (filter === 'all' || filter === 'past' || filter === 'upcoming') {
      this.filter(filter)
    }
  }

  connectedCallback() {
    if (this.dataset.initialized === 'true') {
      return
    }

    this.buttons = Array.from(
      this.querySelectorAll<HTMLButtonElement>('[data-archive-filter]'),
    )
    this.groups = Array.from(this.querySelectorAll<HTMLElement>('[data-archive-group]'))
    this.count = this.querySelector<HTMLElement>('[data-archive-count]') ?? undefined

    if (this.buttons.length === 0 || this.groups.length === 0) {
      return
    }

    this.dataset.initialized = 'true'
    this.addEventListener('click', this.handleClick)
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick)
    delete this.dataset.initialized
  }

  private filter(filter: 'all' | 'past' | 'upcoming') {
    this.buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.archiveFilter === filter))
    })

    let visibleCount = 0
    this.groups.forEach((group) => {
      const visible = filter === 'all' || group.dataset.archiveGroup === filter
      group.toggleAttribute('hidden', !visible)
      if (visible) {
        visibleCount += group.querySelectorAll('li').length
      }
    })

    if (this.count) {
      this.count.textContent = `${visibleCount} ${visibleCount === 1 ? 'engagement' : 'engagements'}`
    }
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, SpeakingArchiveElement)
}
