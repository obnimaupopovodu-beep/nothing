'use client'

import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal, flushSync } from 'react-dom'
import gsap from 'gsap'
import { motion, useReducedMotion } from 'framer-motion'
import { GlassCube } from '@/components/3d/GlassCube'
import { heroCubePose } from '@/components/3d/heroCubeDrift'
import {
  CATALOG_MOTION, faceForRelease, initialCubeArtwork,
  landingPause, prepareHiddenIncomingFace, revealDuration,
  settleDuration, type CubeArtwork,
} from '@/components/3d/catalogMotion'
import { catalogReleases } from '@/components/data/catalog'
import { useMagneticButton } from '@/hooks/useMagneticButton'
import { useSmoothScroll } from '@/components/layout/SmoothScroll'
import { catalogReturnRequested, consumeCatalogReturn, rememberCatalogReturn } from '@/lib/catalogReturn'
import './HeroSection.css'

type Phase = 'idle' | 'exit' | 'pitch' | 'reveal' | 'catalog' | 'return'
type StampedCard = { index: number; left: number; top: number; size: number; panAtStamp: number }
type MarqueeLayout = { left: number; top: number; size: number; gap: number; batchWidth: number; copies: number; anchor: number }
const waitFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
const pause = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))
const tween = (target: gsap.TweenTarget, vars: gsap.TweenVars) => new Promise<void>((resolve) => {
  gsap.to(target, { ...vars, onComplete: resolve, onInterrupt: resolve })
})
// A bounded version of the user's log(-x) curve: slow contraction, then a
// rapid final collapse without an infinite slope at zero.
const logCollapse = (progress: number) => 1 - Math.log2(1 + 63 * (1 - Math.max(0, Math.min(1, progress)))) / 6
const logExpand = (progress: number) => 1 - logCollapse(1 - progress)
const ReturnBead3D = lazy(() => import('@/components/3d/ReturnBead3D').then((module) => ({ default: module.ReturnBead3D })))
const fraction = (value: number) => value - Math.floor(value)
const sceneStars = Array.from({ length: 130 }, (_, index) => ({
  x: fraction(Math.sin((index + 1) * 127.1) * 43758.5453) * 100,
  y: fraction(Math.sin((index + 1) * 78.233) * 19341.274) * 100,
  z: (fraction(Math.sin((index + 1) * 39.425) * 8267.331) - 0.5) * 780,
  opacity: 0.13 + fraction(index * 0.618034) * 0.42,
  size: index % 13 === 0 ? 2 : 1,
}))

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  const magneticSubmit = useMagneticButton()
  const lenis = useSmoothScroll()
  const [phase, setPhase] = useState<Phase>('idle')
  const phaseRef = useRef<Phase>('idle')
  const [faces, setFaces] = useState<CubeArtwork>(initialCubeArtwork)
  const facesRef = useRef<CubeArtwork>(initialCubeArtwork())
  const [stamped, setStamped] = useState<StampedCard[]>([])
  const stampedRef = useRef<StampedCard[]>([])
  const [progress, setProgress] = useState(0)
  const [worldOffset, setWorldOffset] = useState(0)
  const [marquee, setMarquee] = useState<MarqueeLayout | null>(null)
  const [marqueeMoving, setMarqueeMoving] = useState(false)
  const [returnBeadReady, setReturnBeadReady] = useState(false)
  const panRef = useRef(0)
  const projectionScaleRef = useRef(1)
  const gapRef = useRef({ value: 0 })
  const sequence = useRef(0)
  const angles = useRef({ x: -7, y: 14, z: 0 })
  const hearButtonRef = useRef<HTMLButtonElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const kickerRef = useRef<HTMLDivElement>(null)
  const ledeRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const heroCubeHolderRef = useRef<HTMLDivElement>(null)
  const heroMeshRef = useRef<HTMLDivElement>(null)
  const catalogHoverRef = useRef(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const sceneStarsRef = useRef<HTMLDivElement>(null)
  const carrierRef = useRef<HTMLDivElement>(null)
  const cubeRef = useRef<HTMLDivElement>(null)
  const orbRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase !== 'catalog' || !marquee || !marqueeMoving) return
    const viewport = marqueeRef.current
    const track = viewport?.querySelector<HTMLElement>('.catalog-marquee__inner')
    if (!viewport || !track) return
    let touchX = 0
    let touchY = 0
    const move = (distance: number) => {
      const animation = track.getAnimations()[0]
      if (!animation || typeof animation.currentTime !== 'number') return
      const duration = CATALOG_MOTION.marqueeSecondsPerBatch * 1000
      animation.currentTime = ((animation.currentTime + distance / marquee.batchWidth * duration) % duration + duration) % duration
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      move(Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY)
    }
    const onTouchStart = (event: TouchEvent) => {
      touchX = event.touches[0].clientX
      touchY = event.touches[0].clientY
    }
    const onTouchMove = (event: TouchEvent) => {
      const x = event.touches[0].clientX
      const y = event.touches[0].clientY
      event.preventDefault()
      move(Math.abs(x - touchX) > Math.abs(y - touchY) ? touchX - x : touchY - y)
      touchX = x
      touchY = y
    }
    viewport.addEventListener('wheel', onWheel, { passive: false })
    viewport.addEventListener('touchstart', onTouchStart, { passive: true })
    viewport.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      viewport.removeEventListener('wheel', onWheel)
      viewport.removeEventListener('touchstart', onTouchStart)
      viewport.removeEventListener('touchmove', onTouchMove)
    }
  }, [phase, marquee, marqueeMoving])

  const updatePhase = (next: Phase) => { phaseRef.current = next; setPhase(next) }
  const active = (run: number) => sequence.current === run
  const scrollTo = (selector: string) => document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const isOpen = phase !== 'idle'

  useEffect(() => {
    if (!catalogReturnRequested()) return
    openCatalog(true)
    requestAnimationFrame(() => consumeCatalogReturn())
    // Returning from a release is a one-time mount action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function pitchScene(target: number, duration: number) {
    const scene = sceneRef.current
    const overlay = overlayRef.current
    const stars = sceneStarsRef.current?.querySelectorAll('.catalog-scene-star')
    if (!scene || !overlay) return
    const motion = { progress: 0 }
    const trackMotion = tween(motion, {
      progress: 1,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        const strength = Math.sin(Math.PI * motion.progress) ** 1.5
        overlay.style.setProperty('--streak-strength', strength.toFixed(3))
        overlay.style.setProperty('--star-brightness', (1 + 1.45 * strength).toFixed(3))
      },
    })
    await Promise.all([
      tween(scene, { rotationX: target, duration, ease: 'power3.inOut' }),
      stars ? tween(stars, { rotationX: -target, duration, ease: 'power3.inOut' }) : Promise.resolve(),
      trackMotion,
    ])
    overlay.style.setProperty('--streak-strength', '0')
    overlay.style.setProperty('--star-brightness', '1')
  }

  function positionStampedCards() {
    const track = trackRef.current
    if (!track) return
    for (const card of stampedRef.current) {
      const element = track.querySelector<HTMLElement>(`[data-release-index="${card.index}"]`)
      if (!element) continue
      const cameraShift = (panRef.current - card.panAtStamp) * projectionScaleRef.current
      const spread = (catalogReleases.length - 1 - card.index) * gapRef.current.value
      gsap.set(element, { x: cameraShift + spread })
    }
  }

  useEffect(() => {
    if (reduceMotion) return
    let elapsed = 0
    let speed = 1
    const tick = () => {
      if (phaseRef.current !== 'idle' || !heroMeshRef.current) return
      const dt = Math.min(gsap.ticker.deltaRatio() / 60, 0.05)
      const targetSpeed = catalogHoverRef.current && window.matchMedia('(min-width: 1024px) and (hover: hover)').matches ? 2.5 : 1
      speed += (targetSpeed - speed) * (1 - Math.exp(-dt * 2.8))
      elapsed += dt * speed
      const { x, y, z } = heroCubePose(elapsed)
      // Keep the catalog handoff on the nearest equivalent turn.
      angles.current = { x, y: ((y + 180) % 360 + 360) % 360 - 180, z }
      gsap.set(heroMeshRef.current, { rotationX: x, rotationY: y, rotationZ: z })
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [reduceMotion])

  const setCatalogHover = (hovered: boolean) => {
    catalogHoverRef.current = hovered
    if (heroCubeHolderRef.current) heroCubeHolderRef.current.dataset.highlighted = hovered ? 'true' : 'false'
  }

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    const page = document.querySelector('main')
    const wasInert = page?.inert ?? false
    document.body.style.overflow = 'hidden'
    if (page) page.inert = true
    lenis?.current?.stop()
    overlayRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && phaseRef.current === 'catalog') document.getElementById('catalog-restore')?.click()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      if (page) page.inert = wasInert
      lenis?.current?.start()
      window.removeEventListener('keydown', onKeyDown)
      requestAnimationFrame(() => hearButtonRef.current?.focus())
    }
  }, [isOpen, lenis])

  async function stampArtwork(index: number, run: number, duration: number, side: number) {
    const cube = cubeRef.current
    if (!cube || !active(run)) return
    const face = cube.querySelector<HTMLElement>(`.glass-cube__face--${faceForRelease(index)}`)
    const sourceImage = face?.querySelector('img')
    if (!face || !sourceImage) return
    const rect = face.getBoundingClientRect()
    if (index === 0) projectionScaleRef.current = rect.width / side
    // Each cover lands under the cube. The camera starts following the next
    // rolls, carrying the stamped covers right without a separate flight.
    const stampedCard = { index, left: rect.left, top: rect.top, size: rect.width, panAtStamp: panRef.current }
    stampedRef.current = [...stampedRef.current, stampedCard]
    flushSync(() => {
      setStamped(stampedRef.current)
      setProgress(index + 1)
    })
    const card = trackRef.current?.querySelector<HTMLElement>(`[data-release-index="${index}"]`)
    if (!card) return
    const detachDuration = Math.max(0.055, duration)
    await Promise.all([
      tween(sourceImage, { opacity: 0, duration: detachDuration, ease: 'sine.inOut' }),
      tween(card, { opacity: 1, duration: detachDuration, ease: 'sine.inOut' }),
    ])
    if (!active(run)) return
    const incoming = index + 2
    if (incoming < catalogReleases.length) {
      const prepared = prepareHiddenIncomingFace(facesRef.current, incoming)
      if (prepared !== facesRef.current) {
        facesRef.current = prepared
        flushSync(() => setFaces(prepared))
        const incomingImage = cube.querySelector(`.glass-cube__face--${faceForRelease(incoming)} img`)
        if (incomingImage) gsap.set(incomingImage, { clearProps: 'opacity' })
      }
    }
  }

  async function rollOne(index: number, side: number, startX: number, startY: number, duration: number, panStep: number) {
    const carrier = carrierRef.current
    const cube = cubeRef.current
    if (!carrier || !cube) return
    const progress = { turn: 0 }
    const basePan = panRef.current
    const pivotX = startX - (index - 1) * side
    const pivotY = startY + side
    await new Promise<void>((resolve) => {
      gsap.to(progress, {
        turn: 1,
        duration,
        ease: 'sine.inOut',
        onUpdate: () => {
          const theta = -Math.PI * progress.turn / 2
          const half = side / 2
          panRef.current = basePan + progress.turn * panStep
          // Center follows a circular arc around the leading lower edge.
          // At 90° it settles exactly one cube width to the left.
          gsap.set(carrier, {
            x: pivotX + half * (Math.cos(theta) + Math.sin(theta)) - half + panRef.current,
            y: pivotY + half * (Math.sin(theta) - Math.cos(theta)) - half,
          })
          gsap.set(cube, { rotationZ: -90 * (index - 1 + progress.turn) })
          positionStampedCards()
        },
        onComplete: resolve,
        onInterrupt: resolve,
      })
    })
  }

  async function play(run: number) {
    await waitFrame()
    const holder = heroCubeHolderRef.current
    const overlay = overlayRef.current
    const scene = sceneRef.current
    const carrier = carrierRef.current
    const cube = cubeRef.current
    if (!holder || !overlay || !scene || !carrier || !cube) return
    const heroRect = holder.getBoundingClientRect()
    const cardSize = carrier.getBoundingClientRect().width
    const centerX = (window.innerWidth - cardSize) / 2
    const panStep = Math.max(0, cardSize - (centerX - 24) / Math.max(1, catalogReleases.length - 1))
    // Reserve only enough offscreen space for cards stamped to the left.
    const offset = Math.max(0, Math.ceil((catalogReleases.length - 1) * cardSize - centerX + 24))
    flushSync(() => setWorldOffset(offset))
    if (trackRef.current) trackRef.current.scrollLeft = offset
    gsap.set(overlay, { opacity: 1, backgroundColor: 'rgba(5,5,5,0)' })
    gsap.set(scene, { rotationX: 0 })
    gsap.set(sceneStarsRef.current, { opacity: 0 })
    gsap.set(headingRef.current, { opacity: 0, y: 26 })
    gsap.set(trackRef.current, { opacity: 0 })
    gsap.set(carrier, { x: heroRect.left, y: heroRect.top, scale: heroRect.width / cardSize, opacity: 0 })
    gsap.set(cube, { rotationX: angles.current.x, rotationY: angles.current.y, rotationZ: angles.current.z })

    if (reduceMotion) {
      gsap.set([titleRef.current, kickerRef.current, ledeRef.current, actionsRef.current, heroCubeHolderRef.current], { opacity: 0 })
      gsap.set(overlay, { backgroundColor: '#050505' })
      gsap.set(sceneStarsRef.current, { opacity: 1 })
      gsap.set([headingRef.current, trackRef.current], { opacity: 1, y: 0 })
      gsap.set(carrier, { opacity: 0 })
      setStamped(catalogReleases.map((_, index) => ({ index, left: centerX - index * cardSize, top: (window.innerHeight - cardSize) / 2, size: cardSize, panAtStamp: 0 })))
      setProgress(catalogReleases.length)
      updatePhase('catalog')
      return
    }

    const centerY = (window.innerHeight - cardSize) / 2
    await Promise.all([
      tween(titleRef.current, { x: -window.innerWidth, opacity: 0, duration: CATALOG_MOTION.heroExit, ease: 'power3.inOut' }),
      tween(kickerRef.current, { x: -110, opacity: 0, duration: 0.55, ease: 'power2.inOut' }),
      tween(ledeRef.current, { x: -130, opacity: 0, duration: 0.65, ease: 'power2.inOut' }),
      tween(actionsRef.current, { y: 36, opacity: 0, duration: 0.55, ease: 'power2.inOut' }),
      tween(heroCubeHolderRef.current, { opacity: 0, duration: 0.45, ease: 'power2.out' }),
      tween(carrier, { x: centerX, y: centerY, scale: 1, opacity: 1, duration: CATALOG_MOTION.center, ease: 'power3.inOut' }),
      tween(cube, { rotationX: 0, rotationY: 0, rotationZ: 0, duration: CATALOG_MOTION.center, ease: 'power3.inOut' }),
      tween(overlay, { backgroundColor: '#050505', duration: 0.95, ease: 'power2.inOut' }),
      tween(sceneStarsRef.current, { opacity: 1, duration: 0.9, ease: 'power2.inOut' }),
    ])
    if (!active(run)) return
    updatePhase('pitch')
    await pitchScene(CATALOG_MOTION.pitchDegrees, CATALOG_MOTION.pitch)
    if (!active(run)) return
    await Promise.all([
      tween(headingRef.current, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }),
      tween(trackRef.current, { opacity: 1, duration: 0.55, ease: 'power2.out' }),
    ])
    if (!active(run)) return
    updatePhase('reveal')
    await stampArtwork(0, run, settleDuration(0), cardSize)
    await pause(landingPause(0) * 1000)

    for (let index = 1; index < catalogReleases.length; index++) {
      if (!active(run)) return
      const speedIndex = index - 1
      const cycle = revealDuration(speedIndex)
      const settle = settleDuration(speedIndex)
      const landing = landingPause(index)
      await rollOne(index, cardSize, centerX, centerY, cycle - settle - landing, panStep)
      if (!active(run)) return
      await stampArtwork(index, run, settle, cardSize)
      await pause(landing * 1000)
    }
    if (!active(run)) return
    const gap = window.innerWidth < 640 ? CATALOG_MOTION.marqueeGapMobile : CATALOG_MOTION.marqueeGapDesktop
    // The final second opens the card spacing while the empty cube exits.
    await Promise.all([
      tween(gapRef.current, { value: gap, duration: CATALOG_MOTION.finalSpread, ease: 'sine.inOut', onUpdate: positionStampedCards }),
      (async () => {
        await rollOne(catalogReleases.length, cardSize, centerX, centerY, CATALOG_MOTION.finalRoll, 0)
        await tween(carrier, { x: centerX - (catalogReleases.length + 1) * cardSize + panRef.current, opacity: 0, duration: CATALOG_MOTION.finalSpread - CATALOG_MOTION.finalRoll, ease: 'power2.inOut' })
      })(),
    ])
    if (!active(run)) return
    const lastCard = trackRef.current?.querySelector<HTMLElement>(`[data-release-index="${catalogReleases.length - 1}"]`)
    if (lastCard) {
      const rect = lastCard.getBoundingClientRect()
      const batchWidth = catalogReleases.length * (rect.width + gap)
      const copies = Math.max(7, 2 * Math.ceil(window.innerWidth / batchWidth) + 5)
      flushSync(() => setMarquee({ left: rect.left, top: rect.top, size: rect.width, gap, batchWidth, copies, anchor: Math.floor(copies / 2) }))
      await Promise.all([
        tween(trackRef.current, { opacity: 0, duration: 0.36, ease: 'sine.inOut' }),
        tween(marqueeRef.current, { opacity: 1, duration: 0.36, ease: 'sine.inOut' }),
      ])
    }
    if (!active(run)) return
    setMarqueeMoving(true)
    updatePhase('catalog')
  }

  async function showCatalogInstant(run: number) {
    await waitFrame()
    if (!active(run)) return
    const overlay = overlayRef.current
    const carrier = carrierRef.current
    const scene = sceneRef.current
    if (!overlay || !carrier || !scene) return
    const cardSize = carrier.getBoundingClientRect().width
    const gap = window.innerWidth < 640 ? CATALOG_MOTION.marqueeGapMobile : CATALOG_MOTION.marqueeGapDesktop
    const centerY = (window.innerHeight - cardSize) / 2
    gsap.set(overlay, { opacity: 1, backgroundColor: '#050505' })
    gsap.set(scene, { rotationX: CATALOG_MOTION.pitchDegrees })
    gsap.set(sceneStarsRef.current, { opacity: 1 })
    if (sceneStarsRef.current) gsap.set(sceneStarsRef.current.querySelectorAll('.catalog-scene-star'), { rotationX: -CATALOG_MOTION.pitchDegrees })
    gsap.set(carrier, { opacity: 0 })
    gsap.set([titleRef.current, kickerRef.current, ledeRef.current, actionsRef.current, heroCubeHolderRef.current], { opacity: 0 })
    gsap.set(headingRef.current, { opacity: 1, y: 0 })
    setProgress(catalogReleases.length)
    if (reduceMotion) {
      const width = catalogReleases.length * (cardSize + gap)
      setWorldOffset(width)
      setStamped(catalogReleases.map((_, index) => ({ index, left: 24 + index * (cardSize + gap) - width, top: centerY, size: cardSize, panAtStamp: 0 })))
      gsap.set(trackRef.current, { opacity: 1 })
    } else {
      const batchWidth = catalogReleases.length * (cardSize + gap)
      const copies = Math.max(7, 2 * Math.ceil(window.innerWidth / batchWidth) + 5)
      setMarquee({ left: (window.innerWidth - cardSize) / 2, top: centerY, size: cardSize, gap, batchWidth, copies, anchor: Math.floor(copies / 2) })
      gsap.set(trackRef.current, { opacity: 0 })
    }
    updatePhase('catalog')
    await waitFrame()
    if (!active(run)) return
    if (marqueeRef.current) gsap.set(marqueeRef.current, { opacity: 1 })
    setMarqueeMoving(!reduceMotion)
  }

  function openCatalog(instant = false) {
    if (phaseRef.current !== 'idle') return
    void import('@/components/3d/ReturnBead3D')
    setCatalogHover(false)
    const run = ++sequence.current
    facesRef.current = initialCubeArtwork()
    stampedRef.current = []
    panRef.current = 0
    projectionScaleRef.current = 1
    gapRef.current.value = 0
    setFaces(facesRef.current)
    setStamped([])
    setProgress(0)
    setMarquee(null)
    setMarqueeMoving(false)
    setReturnBeadReady(false)
    updatePhase('exit')
    requestAnimationFrame(() => { void (instant ? showCatalogInstant(run) : play(run)) })
  }

  async function restoreHero() {
    if (phaseRef.current !== 'catalog') return
    updatePhase('return')
    sequence.current++
    if (reduceMotion) {
      gsap.set([titleRef.current, kickerRef.current, ledeRef.current, actionsRef.current, heroCubeHolderRef.current], { x: 0, y: 0, opacity: 1 })
      updatePhase('idle')
      setStamped([])
      setProgress(0)
      setMarquee(null)
      return
    }
    const carrier = carrierRef.current
    const cube = cubeRef.current
    const scene = sceneRef.current
    const holder = heroCubeHolderRef.current
    const overlay = overlayRef.current
    const orb = orbRef.current
    if (carrier && cube && scene && holder && overlay && orb) {
      const target = holder.getBoundingClientRect()
      const cardSize = carrier.getBoundingClientRect().width
      const initial = initialCubeArtwork()
      facesRef.current = initial
      flushSync(() => setFaces(initial))
      gsap.killTweensOf([carrier, cube, scene, orb])
      gsap.set(cube.querySelectorAll('.glass-cube__face img'), { clearProps: 'opacity' })
      const targetScale = target.width / cardSize
      gsap.set(carrier, { x: (window.innerWidth - cardSize) / 2, y: (window.innerHeight - cardSize) / 2, z: 0, opacity: 0, scale: 1 })
      gsap.set(cube, { rotationX: 0, rotationY: 0, rotationZ: 0, z: 0, opacity: 1, scale: 1 })
      gsap.set(orb, { opacity: 0, scale: 1, z: 0, rotationX: 0, rotationY: 0 })
      gsap.set(holder, { opacity: 0, scale: 0.025, filter: 'none' })
      await Promise.all([
        tween(trackRef.current, { opacity: 0, duration: 0.38, ease: 'power2.inOut' }),
        marqueeRef.current ? tween(marqueeRef.current, { opacity: 0, duration: 0.38, ease: 'power2.inOut' }) : Promise.resolve(),
        tween(headingRef.current, { opacity: 0, y: -24, duration: 0.38, ease: 'power2.inOut' }),
        tween(carrier, { opacity: 1, duration: 0.38, ease: 'power2.out' }),
        pitchScene(0, 0.9),
      ])
      flushSync(() => setReturnBeadReady(true))
      await waitFrame()
      await tween(cube, { opacity: 0, scale: 0.025, z: -cardSize * 0.35, rotationX: -28, rotationY: 42, duration: 0.72, ease: logCollapse })
      gsap.set(orb, { scale: 0.025 })
      await tween(orb, { opacity: 1, scale: 1.13, z: 70, duration: 0.34, ease: logExpand })
      await tween(orb, { scale: 1, z: 48, duration: 0.2, ease: 'power2.out' })
      await Promise.all([
        tween(carrier, { x: target.left + target.width / 2 - cardSize / 2, y: target.top + target.height / 2 - cardSize / 2, scale: targetScale, duration: 1.02, ease: 'back.out(1.35)' }),
        tween(carrier, { z: 105, duration: 0.51, repeat: 1, yoyo: true, ease: 'sine.inOut' }),
        tween(orb, { scale: 1 / targetScale, z: 26, duration: 1.02, ease: 'back.out(1.35)' }),
        tween(overlay, { backgroundColor: 'rgba(5,5,5,0)', duration: 1.02, ease: 'power2.inOut' }),
        tween(sceneStarsRef.current, { opacity: 0, duration: 0.82, ease: 'power2.inOut' }),
        tween(titleRef.current, { x: 0, opacity: 1, duration: 0.93, ease: 'power3.out' }),
        tween(kickerRef.current, { x: 0, opacity: 1, duration: 0.72, ease: 'power3.out' }),
        tween(ledeRef.current, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }),
        tween(actionsRef.current, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }),
      ])
      await tween(orb, { opacity: 0, scale: 0.025 / targetScale, z: -cardSize * 0.25, duration: 0.52, ease: logCollapse })
      gsap.set(heroMeshRef.current, { rotationX: angles.current.x, rotationY: angles.current.y, rotationZ: angles.current.z })
      await tween(holder, { opacity: 1, scale: 1.1, duration: 0.43, ease: logExpand })
      await tween(holder, { scale: 1, duration: 0.22, ease: 'power2.out' })
    }
    gsap.set(heroCubeHolderRef.current, { opacity: 1 })
    updatePhase('idle')
    setStamped([])
    setProgress(0)
    setMarquee(null)
    setMarqueeMoving(false)
  }

  return <>
    <section id="top" aria-label="uwbelieve" className="band catalog-hero">
      <div className="shell"><div className="hero-grid">
        <div className="hero-copy">
          <div ref={kickerRef}><motion.p className="kicker" initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}><i aria-hidden="true" />Independent electronic label</motion.p></div>
          <div ref={titleRef}><motion.h1 className="h1" style={{ marginTop: 24 }} initial={reduceMotion ? false : { opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.08 }}>u wont<br /><span className="h1-outline">believe</span></motion.h1></div>
          <div ref={ledeRef}><motion.p className="lede" style={{ marginTop: 26, maxWidth: '30ch' }} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.22 }}>Distribution, promo and straight answers for electronic artists.</motion.p></div>
          <div ref={actionsRef}><motion.div className="hero-actions" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.32 }}>
            <motion.button type="button" className="btn btn-primary magnetic-btn" onClick={() => scrollTo('#demo')} {...magneticSubmit}>Submit a track</motion.button>
            <button ref={hearButtonRef} type="button" className="btn btn-ghost" onClick={() => openCatalog()} onPointerEnter={() => setCatalogHover(true)} onPointerLeave={() => setCatalogHover(false)} onFocus={() => setCatalogHover(true)} onBlur={() => setCatalogHover(false)}>Hear the catalog</button>
          </motion.div></div>
        </div>
        <motion.div className="crystal-wrap" initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.3, delay: 0.1 }}>
          <div ref={heroCubeHolderRef} className="hero-cube-holder"><GlassCube ref={heroMeshRef} faces={initialCubeArtwork()} /></div>
        </motion.div>
      </div></div>
    </section>
    {isOpen && createPortal(<div ref={overlayRef} className="catalog-overlay" data-phase={phase} data-marquee={Boolean(marquee)} role="dialog" aria-modal="true" aria-label="Release catalog" tabIndex={-1} style={{ '--art-opacity': CATALOG_MOTION.artworkOpacity } as CSSProperties}>
      <div className="catalog-scene-stage" aria-hidden="true"><div ref={sceneRef} className="catalog-scene">
        <div ref={sceneStarsRef} className="catalog-scene-stars">{sceneStars.map((star, index) => <span key={index} className="catalog-scene-star" style={{ left: `${star.x}%`, top: `${star.y}%`, transform: `translateZ(${star.z}px)`, opacity: star.opacity, width: star.size, height: star.size, '--trail-angle': star.z >= 0 ? '90deg' : '-90deg', '--trail-length': `${12 + Math.round(Math.abs(star.z) * 0.035)}px` } as CSSProperties} />)}</div>
        <div ref={carrierRef} className="catalog-carrier"><GlassCube ref={cubeRef} faces={faces} /><div ref={orbRef} className="catalog-return-orb">{returnBeadReady ? <Suspense fallback={<span className="catalog-return-orb__fallback" />}><ReturnBead3D /></Suspense> : <span className="catalog-return-orb__fallback" />}</div></div>
      </div></div>
      <div ref={headingRef} className="catalog-overlay__head"><p>uwbelieve / releases</p><h2>The catalog.</h2><span>One record at a time. A world of sound.</span></div>
      <div ref={trackRef} className="catalog-track" aria-hidden={Boolean(marquee)}><div className="catalog-track__inner" style={{ width: `calc(100vw + ${worldOffset}px)` }}>
        {stamped.map(({ index, left, top, size }) => { const release = catalogReleases[index]; return <a key={release.slug} data-release-index={index} href={release.href} onClick={rememberCatalogReturn} className="catalog-slot catalog-slot--visible" style={{ left: worldOffset + left, top, width: size, opacity: reduceMotion ? 1 : undefined }} tabIndex={phase === 'catalog' && !marquee ? 0 : -1}>
          <div className="catalog-slot__art" style={{ width: size, height: size }}><img src={release.artwork} alt={`${release.title} cover`} draggable={false} /></div>
          <span className="catalog-slot__index">{String(index + 1).padStart(2, '0')}</span><strong>{release.title}</strong><span className="catalog-slot__artist">{release.artist} · {release.year}</span>
        </a> })}
      </div></div>
      {marquee && <div ref={marqueeRef} className="catalog-marquee" data-moving={marqueeMoving} style={{ '--marquee-travel': `-${marquee.batchWidth}px`, '--marquee-duration': `${CATALOG_MOTION.marqueeSecondsPerBatch}s` } as CSSProperties}>
        <div className="catalog-marquee__inner" style={{ left: marquee.left - marquee.anchor * marquee.batchWidth, top: marquee.top }}>
          {Array.from({ length: marquee.copies }, (_, batch) => <div className="catalog-marquee__batch" key={batch} aria-hidden={batch !== marquee.anchor}>
            {[...catalogReleases].reverse().map((release, reverseIndex) => { const index = catalogReleases.length - 1 - reverseIndex; return <a key={`${batch}-${release.slug}`} href={release.href} onClick={rememberCatalogReturn} className="catalog-marquee__item" style={{ width: marquee.size, marginRight: marquee.gap }} tabIndex={phase === 'catalog' && batch === marquee.anchor ? 0 : -1}>
              <div className="catalog-slot__art" style={{ width: marquee.size, height: marquee.size }}><img src={release.artwork} alt={batch === marquee.anchor ? `${release.title} cover` : ''} draggable={false} /></div>
              <span className="catalog-slot__index">{String(index + 1).padStart(2, '0')}</span><strong>{release.title}</strong><span className="catalog-slot__artist">{release.artist} · {release.year}</span>
            </a> })}
          </div>)}
        </div>
      </div>}
      <div className="catalog-overlay__foot"><span className="catalog-progress">{String(progress).padStart(2, '0')} / {String(catalogReleases.length).padStart(2, '0')} releases</span><button id="catalog-restore" type="button" className={`catalog-restore ${phase === 'catalog' ? 'catalog-restore--ready' : ''}`} onClick={restoreHero}><span aria-hidden="true">↶</span> Back to beginning</button></div>
    </div>, document.body)}
  </>
}
