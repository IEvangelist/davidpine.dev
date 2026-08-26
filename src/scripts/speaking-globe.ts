import type {
  Group,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  PointsMaterial,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { MultiLineString } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'

interface GlobeLocation {
  city: string
  latitude: number
  longitude: number
}

interface GlobeStop extends GlobeLocation {
  id: string
  location: string
}

type ThreeModule = typeof import('three')

const tagName = 'speaking-globe'
const globeRadius = 1.25

class SpeakingGlobeElement extends HTMLElement {
  private stops: GlobeStop[] = []
  private remoteOrigin?: GlobeLocation
  private remoteStopIds = new Set<string>()
  private galleryId = ''
  private canvas?: HTMLCanvasElement
  private beacon?: HTMLElement
  private originMarker?: HTMLElement
  private destinationMarker?: HTMLElement
  private three?: ThreeModule
  private renderer?: WebGLRenderer
  private scene?: Scene
  private camera?: PerspectiveCamera
  private stage?: Group
  private world?: Group
  private surfaceMaterial?: MeshPhongMaterial
  private atmosphereMaterial?: MeshBasicMaterial
  private gridMaterial?: LineBasicMaterial
  private mapMaterial?: LineBasicMaterial
  private coastMaterial?: LineBasicMaterial
  private pointMaterial?: PointsMaterial
  private originPoint?: Vector3
  private destinationPoint?: Vector3
  private rotationFrom?: Quaternion
  private rotationTo?: Quaternion
  private activeIndex = 0
  private activeStopId?: string
  private rotationStartedAt = 0
  private remoteActive = false
  private animationFrame = 0
  private inView = false
  private initialized = false
  private initializing = false
  private visible = !document.hidden
  private resizeObserver?: ResizeObserver
  private intersectionObserver?: IntersectionObserver
  private themeObserver?: MutationObserver
  private reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  private readonly handleGalleryChange = (event: Event) => {
    if (!(event instanceof CustomEvent) || !(event.target instanceof HTMLElement)) {
      return
    }

    if (event.target.id !== this.galleryId) {
      return
    }

    const id = String(event.detail?.id ?? '')
    if (!id) {
      return
    }

    this.activeStopId = id
    if (this.initialized) {
      const index = this.stops.findIndex((stop) => stop.id === id)
      if (index >= 0) {
        this.selectStop(index)
      } else if (this.remoteStopIds.has(id)) {
        this.showRemoteStop()
      } else {
        this.showUnmappedStop()
      }
    }
  }

  private readonly handleVisibilityChange = () => {
    this.visible = !document.hidden
    if (this.visible) {
      this.startRendering()
    } else {
      this.stopRendering()
    }
  }

  private readonly handleMotionChange = () => {
    if (!this.initialized) {
      return
    }

    const index = this.activeStopId
      ? this.stops.findIndex((stop) => stop.id === this.activeStopId)
      : this.activeIndex
    if (index >= 0) {
      this.selectStop(index, true)
    } else if (this.activeStopId && this.remoteStopIds.has(this.activeStopId)) {
      this.showRemoteStop()
    } else {
      this.showUnmappedStop()
    }
  }

  connectedCallback() {
    if (this.dataset.initialized === 'true') {
      return
    }

    this.canvas =
      this.querySelector<HTMLCanvasElement>('[data-globe-canvas]') ?? undefined
    this.beacon = this.querySelector<HTMLElement>('[data-globe-beacon]') ?? undefined
    this.originMarker =
      this.querySelector<HTMLElement>('[data-globe-origin]') ?? undefined
    this.destinationMarker =
      this.querySelector<HTMLElement>('[data-globe-destination]') ?? undefined
    this.galleryId = this.dataset.galleryId ?? ''

    try {
      this.stops = JSON.parse(this.dataset.stops ?? '[]') as GlobeStop[]
      this.remoteOrigin = JSON.parse(this.dataset.remoteOrigin ?? 'null') as GlobeLocation
      this.remoteStopIds = new Set(
        JSON.parse(this.dataset.remoteStopIds ?? '[]') as string[],
      )
    } catch {
      this.markUnavailable()
      return
    }

    if (!this.canvas || !this.galleryId || this.stops.length === 0) {
      this.markUnavailable()
      return
    }

    this.dataset.initialized = 'true'
    document.addEventListener('spatial-gallery:change', this.handleGalleryChange)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    this.reduceMotion.addEventListener('change', this.handleMotionChange)

    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.inView = entry?.isIntersecting ?? false
        if (this.inView) {
          void this.initialize()
          this.startRendering()
        } else {
          this.stopRendering()
        }
      },
      { rootMargin: '320px 0px' },
    )
    this.intersectionObserver.observe(this)
  }

  disconnectedCallback() {
    document.removeEventListener('spatial-gallery:change', this.handleGalleryChange)
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.reduceMotion.removeEventListener('change', this.handleMotionChange)
    this.intersectionObserver?.disconnect()
    this.resizeObserver?.disconnect()
    this.themeObserver?.disconnect()
    this.stopRendering()
    this.disposeScene()
    delete this.dataset.initialized
  }

  private async initialize() {
    if (this.initialized || this.initializing || !this.canvas) {
      return
    }

    this.initializing = true

    try {
      const [THREE, { mesh }, atlasModule] = await Promise.all([
        import('three'),
        import('topojson-client'),
        import('world-atlas/countries-110m.json'),
      ])
      const topology = atlasModule.default as unknown as Topology<{
        countries: GeometryCollection
        land: GeometryCollection
      }>
      const countryBorders = mesh(topology, topology.objects.countries)
      const coastlines = mesh(topology, topology.objects.land)
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: this.canvas,
        powerPreference: 'low-power',
      })

      this.three = THREE
      this.renderer = renderer
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
      this.camera.position.set(0, 0, 4.65)

      this.stage = new THREE.Group()
      this.world = new THREE.Group()
      this.stage.add(this.world)
      this.scene.add(this.stage)

      const colors = this.readThemeColors()
      this.surfaceMaterial = new THREE.MeshPhongMaterial({
        color: colors.accent,
        depthWrite: true,
        opacity: 0.24,
        shininess: 64,
        side: THREE.FrontSide,
        transparent: true,
      })
      this.atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: colors.accent,
        depthWrite: false,
        opacity: 0.11,
        side: THREE.BackSide,
        transparent: true,
      })
      this.gridMaterial = new THREE.LineBasicMaterial({
        color: colors.foreground,
        opacity: 0.13,
        transparent: true,
      })
      this.mapMaterial = new THREE.LineBasicMaterial({
        color: colors.foreground,
        opacity: 0.42,
        transparent: true,
      })
      this.coastMaterial = new THREE.LineBasicMaterial({
        color: colors.foreground,
        opacity: 0.88,
        transparent: true,
      })
      this.pointMaterial = new THREE.PointsMaterial({
        color: colors.accent,
        opacity: 0.92,
        size: 0.035,
        sizeAttenuation: true,
        transparent: true,
      })
      const sphereGeometry = new THREE.SphereGeometry(globeRadius, 64, 40)
      const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.055, 48, 32)
      this.world.add(new THREE.Mesh(sphereGeometry, this.surfaceMaterial))
      this.world.add(new THREE.Mesh(atmosphereGeometry, this.atmosphereMaterial))
      this.world.add(this.createGraticule())
      this.world.add(this.createGeography(countryBorders, this.mapMaterial))
      this.world.add(this.createGeography(coastlines, this.coastMaterial))
      this.world.add(this.createStops())

      this.scene.add(new THREE.AmbientLight(colors.foreground, 1.1))
      const keyLight = new THREE.DirectionalLight(colors.accent, 2.4)
      keyLight.position.set(-2.5, 3, 4)
      this.scene.add(keyLight)

      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace

      this.resizeObserver = new ResizeObserver(() => {
        this.resize()
        this.startRendering()
      })
      this.resizeObserver.observe(this)

      this.themeObserver = new MutationObserver(() => {
        this.updateThemeColors()
        this.startRendering()
      })
      this.themeObserver.observe(document.documentElement, {
        attributeFilter: ['data-theme'],
        attributes: true,
      })

      this.initialized = true
      this.dataset.ready = 'true'
      this.resize()
      const activeIndex = this.activeStopId
        ? this.stops.findIndex((stop) => stop.id === this.activeStopId)
        : 0
      if (activeIndex >= 0) {
        this.selectStop(activeIndex, true)
      } else if (this.activeStopId && this.remoteStopIds.has(this.activeStopId)) {
        this.showRemoteStop()
      } else {
        this.showUnmappedStop()
      }
    } catch {
      this.markUnavailable()
      this.disposeScene()
    } finally {
      this.initializing = false
    }
  }

  private createGraticule() {
    const THREE = this.three!
    const group = new THREE.Group()
    const radius = globeRadius * 1.003

    for (let latitude = -60; latitude <= 60; latitude += 30) {
      const points: Vector3[] = []
      const latitudeRadians = THREE.MathUtils.degToRad(latitude)
      for (let longitude = 0; longitude <= 360; longitude += 4) {
        const longitudeRadians = THREE.MathUtils.degToRad(longitude)
        points.push(
          new THREE.Vector3(
            radius * Math.cos(latitudeRadians) * Math.sin(longitudeRadians),
            radius * Math.sin(latitudeRadians),
            radius * Math.cos(latitudeRadians) * Math.cos(longitudeRadians),
          ),
        )
      }
      group.add(
        new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(points),
          this.gridMaterial,
        ),
      )
    }

    for (let longitude = 0; longitude < 180; longitude += 30) {
      const points: Vector3[] = []
      const longitudeRadians = THREE.MathUtils.degToRad(longitude)
      for (let latitude = -90; latitude <= 90; latitude += 3) {
        const latitudeRadians = THREE.MathUtils.degToRad(latitude)
        points.push(
          new THREE.Vector3(
            radius * Math.cos(latitudeRadians) * Math.sin(longitudeRadians),
            radius * Math.sin(latitudeRadians),
            radius * Math.cos(latitudeRadians) * Math.cos(longitudeRadians),
          ),
        )
      }
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          this.gridMaterial,
        ),
      )
    }

    return group
  }

  private createGeography(geography: MultiLineString, material: LineBasicMaterial) {
    const THREE = this.three!
    const positions: number[] = []
    const radius = globeRadius * 1.008

    geography.coordinates.forEach((line) => {
      for (let index = 1; index < line.length; index++) {
        const previous = line[index - 1]
        const current = line[index]
        if (!previous || !current) {
          continue
        }

        const start = this.toGlobeCoordinates(previous[1] ?? 0, previous[0] ?? 0, radius)
        const end = this.toGlobeCoordinates(current[1] ?? 0, current[0] ?? 0, radius)
        positions.push(start.x, start.y, start.z, end.x, end.y, end.z)
      }
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return new THREE.LineSegments(geometry, material)
  }

  private createStops() {
    const THREE = this.three!
    const positions = new Float32Array(this.stops.length * 3)
    this.stops.forEach((stop, index) => {
      const point = this.toGlobePoint(stop, globeRadius * 1.018)
      positions[index * 3] = point.x
      positions[index * 3 + 1] = point.y
      positions[index * 3 + 2] = point.z
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return new THREE.Points(geometry, this.pointMaterial)
  }

  private selectStop(index: number, immediate = false) {
    if (!this.three || !this.world || !this.rotationFrom || !this.rotationTo) {
      if (this.three && this.world) {
        this.rotationFrom = new this.three.Quaternion()
        this.rotationTo = new this.three.Quaternion()
      } else {
        return
      }
    }

    const THREE = this.three
    const stop = this.stops[index]
    if (!stop) {
      return
    }

    this.activeIndex = index
    this.toggleAttribute('data-remote', false)
    this.rotationFrom.copy(this.world.quaternion)
    const compact = this.clientWidth < 640
    const focusDirection = new THREE.Vector3(
      compact ? 0.12 : 0.18,
      compact ? 0.46 : 0.38,
      compact ? 0.88 : 0.9,
    ).normalize()
    this.rotationTo.copy(
      this.createFocusRotation(stop.latitude, stop.longitude, focusDirection),
    )

    const reduced = this.reduceMotion.matches || immediate
    this.rotationStartedAt = reduced ? 0 : performance.now()
    if (reduced) {
      this.world.quaternion.copy(this.rotationTo)
    }

    this.showLocation(stop)
    this.startRendering()
  }

  private showUnmappedStop() {
    this.toggleAttribute('data-remote', false)
    this.clearIndicators()
    this.startRendering()
  }

  private showRemoteStop() {
    const continuingRemote = this.remoteActive
    this.toggleAttribute('data-remote', true)
    this.clearIndicators()

    if (!this.three || !this.world || !this.remoteOrigin) {
      this.startRendering()
      return
    }

    const THREE = this.three
    const reduced = this.reduceMotion.matches
    if (!continuingRemote) {
      this.rotationFrom ??= new THREE.Quaternion()
      this.rotationTo ??= new THREE.Quaternion()
      this.rotationFrom.copy(this.world.quaternion)

      const compact = this.clientWidth < 640
      const focusDirection = new THREE.Vector3(
        compact ? 0.08 : 0.14,
        compact ? 0.44 : 0.34,
        compact ? 0.9 : 0.93,
      ).normalize()
      this.rotationTo.copy(
        this.createFocusRotation(
          this.remoteOrigin.latitude,
          this.remoteOrigin.longitude,
          focusDirection,
        ),
      )
      this.rotationStartedAt = reduced ? 0 : performance.now()
      if (reduced) {
        this.world.quaternion.copy(this.rotationTo)
      }
    }

    this.originPoint = this.toGlobeCoordinates(
      this.remoteOrigin.latitude,
      this.remoteOrigin.longitude,
      globeRadius * 1.035,
    )
    this.setPlaceLabel(this.originMarker, `Live from ${this.remoteOrigin.city}`)
    this.originMarker?.toggleAttribute('data-broadcast', true)
    this.originMarker?.toggleAttribute('hidden', false)
    this.beacon?.toggleAttribute('hidden', false)
    this.remoteActive = true
    this.startRendering()
  }

  private clearIndicators() {
    this.originPoint = undefined
    this.destinationPoint = undefined
    this.remoteActive = false
    this.beacon?.toggleAttribute('hidden', true)
    this.originMarker?.removeAttribute('data-broadcast')
    this.originMarker?.toggleAttribute('hidden', true)
    this.destinationMarker?.toggleAttribute('hidden', true)
  }

  private showLocation(stop: GlobeStop) {
    this.clearIndicators()
    this.destinationPoint = this.toGlobePoint(stop, globeRadius * 1.035)
    this.setPlaceLabel(this.destinationMarker, stop.city)
    this.destinationMarker?.toggleAttribute('hidden', false)
  }

  private setPlaceLabel(marker: HTMLElement | undefined, label: string) {
    const labelElement = marker?.querySelector<HTMLElement>(
      '[data-globe-origin-label], [data-globe-destination-label]',
    )
    if (labelElement) {
      labelElement.textContent = label
    }
  }

  private readonly render = (time: number) => {
    this.animationFrame = 0
    if (
      !this.inView ||
      !this.visible ||
      !this.initialized ||
      !this.renderer ||
      !this.scene ||
      !this.camera ||
      !this.world ||
      !this.stage
    ) {
      return
    }

    const THREE = this.three!
    const reduceMotion = this.reduceMotion.matches
    const rotationProgress =
      reduceMotion || this.rotationStartedAt === 0
        ? 1
        : THREE.MathUtils.clamp((time - this.rotationStartedAt) / 850, 0, 1)
    const easedRotation =
      rotationProgress < 0.5
        ? 4 * Math.pow(rotationProgress, 3)
        : 1 - Math.pow(-2 * rotationProgress + 2, 3) / 2

    if (this.rotationFrom && this.rotationTo && rotationProgress < 1) {
      this.world.quaternion.slerpQuaternions(
        this.rotationFrom,
        this.rotationTo,
        easedRotation,
      )
    } else if (this.rotationTo) {
      this.world.quaternion.copy(this.rotationTo)
    }

    this.stage.rotation.y = reduceMotion
      ? 0
      : Math.sin(time * 0.00016) * 0.045
    this.stage.rotation.x = reduceMotion
      ? 0
      : Math.cos(time * 0.00013) * 0.012

    if (this.originPoint) {
      this.positionOverlay(this.originMarker, this.originPoint)
      this.positionBeacon(this.originPoint)
    }
    if (this.destinationPoint) {
      this.positionOverlay(this.destinationMarker, this.destinationPoint)
    }

    this.renderer.render(this.scene, this.camera)

    if (!reduceMotion || rotationProgress < 1) {
      this.animationFrame = window.requestAnimationFrame(this.render)
    }
  }

  private positionBeacon(point: Vector3) {
    if (!this.beacon) {
      return
    }

    const projected = this.projectPoint(point)
    if (!projected) {
      return
    }

    this.beacon.style.left = `${projected.x}px`
    this.beacon.style.top = `${projected.y}px`
    this.beacon.style.opacity = projected.visible ? '1' : '0'
  }

  private positionOverlay(marker: HTMLElement | undefined, point: Vector3) {
    if (!marker || !this.canvas || !this.three) {
      return
    }

    const projected = this.projectPoint(point)
    if (!projected) {
      return
    }

    const width = marker.offsetWidth
    const height = marker.offsetHeight
    const isOrigin = marker === this.originMarker
    const compact = this.canvas.clientWidth < 640
    const x = isOrigin
      ? this.three.MathUtils.clamp(projected.x, width + 20, this.canvas.clientWidth - 8)
      : this.three.MathUtils.clamp(projected.x, 8, this.canvas.clientWidth - width - 20)
    const y = isOrigin
      ? this.three.MathUtils.clamp(
          projected.y,
          8,
          compact
            ? this.canvas.clientHeight * 0.22
            : this.canvas.clientHeight - height * 1.2 - 8,
        )
      : this.three.MathUtils.clamp(
          projected.y,
          height * 1.2 + 8,
          this.canvas.clientHeight - 8,
        )

    marker.style.left = `${x}px`
    marker.style.top = `${y}px`
    marker.style.opacity = projected.visible ? '1' : '0'
  }

  private projectPoint(point: Vector3) {
    if (!this.world || !this.camera || !this.canvas) {
      return undefined
    }

    this.world.updateWorldMatrix(true, false)
    const worldPoint = point.clone().applyMatrix4(this.world.matrixWorld)
    const projected = worldPoint.clone().project(this.camera)
    return {
      x: (projected.x * 0.5 + 0.5) * this.canvas.clientWidth,
      y: (-projected.y * 0.5 + 0.5) * this.canvas.clientHeight,
      visible: worldPoint.z > -0.08 && projected.z <= 1,
    }
  }

  private startRendering() {
    if (!this.initialized || !this.inView || !this.visible || this.animationFrame !== 0) {
      return
    }

    this.animationFrame = window.requestAnimationFrame(this.render)
  }

  private stopRendering() {
    window.cancelAnimationFrame(this.animationFrame)
    this.animationFrame = 0
  }

  private resize() {
    if (!this.renderer || !this.camera || !this.canvas) {
      return
    }

    const width = Math.max(this.clientWidth, 1)
    const height = Math.max(this.clientHeight, 1)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  private toGlobePoint(stop: GlobeStop, radius: number) {
    return this.toGlobeCoordinates(stop.latitude, stop.longitude, radius)
  }

  private createFocusRotation(
    latitudeValue: number,
    longitudeValue: number,
    focusDirection: Vector3,
  ) {
    const THREE = this.three!
    const yaw = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      -THREE.MathUtils.degToRad(longitudeValue),
    )
    const pitch = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      THREE.MathUtils.degToRad(latitudeValue),
    )
    const centerStop = pitch.multiply(yaw)
    const moveToFocus = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      focusDirection,
    )
    return moveToFocus.multiply(centerStop)
  }

  private toGlobeCoordinates(
    latitudeValue: number,
    longitudeValue: number,
    radius: number,
  ) {
    const THREE = this.three!
    const latitude = THREE.MathUtils.degToRad(latitudeValue)
    const longitude = THREE.MathUtils.degToRad(longitudeValue)
    return new THREE.Vector3(
      radius * Math.cos(latitude) * Math.sin(longitude),
      radius * Math.sin(latitude),
      radius * Math.cos(latitude) * Math.cos(longitude),
    )
  }

  private readThemeColors() {
    const THREE = this.three!
    return {
      accent: new THREE.Color(this.resolveCssColor('--theme-accent', '#37a7a9')),
      foreground: new THREE.Color(this.resolveCssColor('--theme-foreground', '#e8e6df')),
    }
  }

  private resolveCssColor(property: string, fallback: string) {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim()
    if (!value) {
      return fallback
    }

    const probe = document.createElement('span')
    probe.style.color = value
    probe.style.position = 'fixed'
    probe.style.visibility = 'hidden'
    document.body.append(probe)
    const resolved = getComputedStyle(probe).color
    probe.remove()
    return resolved || fallback
  }

  private updateThemeColors() {
    if (!this.three) {
      return
    }

    const colors = this.readThemeColors()
    this.surfaceMaterial?.color.copy(colors.accent)
    this.atmosphereMaterial?.color.copy(colors.accent)
    this.gridMaterial?.color.copy(colors.foreground)
    this.mapMaterial?.color.copy(colors.foreground)
    this.coastMaterial?.color.copy(colors.foreground)
    this.pointMaterial?.color.copy(colors.accent)
  }

  private markUnavailable() {
    this.dataset.unavailable = 'true'
    this.beacon?.toggleAttribute('hidden', true)
    this.originMarker?.toggleAttribute('hidden', true)
    this.destinationMarker?.toggleAttribute('hidden', true)
  }

  private disposeScene() {
    this.scene?.traverse((object) => {
      const disposable = object as unknown as {
        geometry?: { dispose: () => void }
        material?: { dispose: () => void } | { dispose: () => void }[]
      }
      disposable.geometry?.dispose()
      if (Array.isArray(disposable.material)) {
        disposable.material.forEach((material) => material.dispose())
      } else {
        disposable.material?.dispose()
      }
    })
    this.renderer?.dispose()
    this.initialized = false
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, SpeakingGlobeElement)
}
