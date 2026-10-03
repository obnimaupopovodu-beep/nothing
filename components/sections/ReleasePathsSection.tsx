'use client'

import { motion, useScroll, useTransform, useReducedMotion, useMotionValueEvent, type MotionValue } from 'framer-motion'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useSmoothScroll } from '@/components/layout/SmoothScroll'
import { RELEASE_PATH_EVENT, type ReleasePath } from '@/lib/releasePathSelection'
import { VinylRecord, Sparkle, WaveSine } from '@phosphor-icons/react/dist/ssr'
import './ReleasePathsSection.css'

const MODES = [
  {
    tag: 'Release',
    display: '',
    title: 'Direct release management.',
    body: 'We distribute your track for 10% of royalties, keep the workflow simple, and show every number in one place.',
    Icon: VinylRecord,
    wide: true,
  },
  {
    tag: 'Promotion',
    display: '',
    title: 'Release support with momentum.',
    body: 'We pair the release with social campaigns and playlist outreach when your track needs extra reach.',
    Icon: Sparkle,
    wide: false,
  },
  {
    tag: 'Re-release',
    display: '',
    title: 'A second life for the right record.',
    body: 'If a track is already out but still has room to grow, we reframe it as a stronger release and push it again.',
    Icon: WaveSine,
    wide: false,
  },
] as const

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const linear = (value: number, start: number, end: number) => clamp((value - start) / (end - start))
const smooth = (value: number, start: number, end: number) => {
  const t = linear(value, start, end)
  return t * t * (3 - 2 * t)
}
const easeInOut = (value: number, start: number, end: number) => {
  const t = linear(value, start, end)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function moveCardLight(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const bounds = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`)
  event.currentTarget.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`)
}

// Shared spring keeps spatial transforms and focus changes synchronized.
const CAROUSEL_SPRING = { type: 'spring' as const, stiffness: 260, damping: 26, mass: 0.8 }

function PathsCarousel({ progress, animated, onSelect }: { progress: MotionValue<number>; animated: boolean; onSelect: (path: ReleasePath) => void }) {
  const [activeIndex, setActiveIndex] = useState(1)
  const [spread, setSpread] = useState(340)
  const [entered, setEntered] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const gesture = useRef({ x: 0, y: 0, swiped: false })
  const reducedMotion = useReducedMotion()
  const entranceX = useTransform(progress, value => `${110 * (1 - easeInOut(value, 0.41, 0.62))}vw`)
  const entranceOpacity = useTransform(progress, value => smooth(value, 0.43, 0.58))
  const ready = !animated || entered
  useMotionValueEvent(progress, 'change', value => setEntered(value >= 0.62))
  useEffect(() => setEntered(progress.get() >= 0.62), [animated, progress])

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setSpread(Math.min(340, entry.contentRect.width * 0.62))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const element = viewportRef.current
    if (!element || !ready) return
    const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let accumulated = 0
    let lastEventAt = 0
    let lastStepAt = -Infinity

    function handleWheel(event: WheelEvent) {
      if (!desktopPointer.matches || event.ctrlKey || event.metaKey) return
      // Prefer the horizontal intent even when a diagonal trackpad gesture
      // also has a larger vertical component.
      const horizontal = Math.abs(event.deltaX) > 1 && Math.abs(event.deltaX) >= Math.abs(event.deltaY) * 0.35
      const delta = horizontal ? event.deltaX : event.deltaY
      if (!delta) return
      event.preventDefault()
      // Keep Lenis from scrolling the page during a carousel gesture.
      event.stopPropagation()
      const now = performance.now()
      if (now - lastEventAt > 180) {
        accumulated = 0
      }
      lastEventAt = now
      // A finite cooldown allows repeated swipes even when trackpad momentum
      // keeps the event stream alive between gestures.
      if (now - lastStepAt < 220) {
        accumulated = 0
        return
      }
      const pixels = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element!.clientWidth : 1)
      if (Math.sign(pixels) !== Math.sign(accumulated)) accumulated = 0
      accumulated += pixels
      if (Math.abs(accumulated) < 45) return
      const stepDirection = accumulated > 0 ? 1 : -1
      setActiveIndex(index => (index + stepDirection + MODES.length) % MODES.length)
      lastStepAt = now
      accumulated = 0
    }

    element.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    return () => element.removeEventListener('wheel', handleWheel, true)
  }, [ready])

  const step = (direction: number) => setActiveIndex(index => (index + direction + MODES.length) % MODES.length)

  return <motion.div
    className="paths-carousel"
    style={animated ? { x: entranceX, opacity: entranceOpacity } : { x: 0, opacity: 1 }}
    inert={!ready}
    role="region"
    aria-roledescription="carousel"
    aria-label="Release paths"
    onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        step(event.key === 'ArrowRight' ? 1 : -1)
      }
    }}
  >
    <div className="paths-carousel__viewport" ref={viewportRef}
      onPointerDown={event => { gesture.current = { x: event.clientX, y: event.clientY, swiped: false } }}
      onPointerUp={event => {
        const dx = event.clientX - gesture.current.x
        const dy = event.clientY - gesture.current.y
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
          gesture.current.swiped = true
          step(dx < 0 ? 1 : -1)
        }
      }}
      onPointerCancel={() => { gesture.current.swiped = true }}
    >
      <div className="paths-carousel__track">
        {MODES.map((mode, index) => {
          // Wrap to -1 / 0 / 1, including when either end card is selected.
          const offset = (index - activeIndex + MODES.length + 1) % MODES.length - 1
          const active = offset === 0
          return <motion.article key={mode.tag}
            className={`path-option${mode.wide ? ' path-option--wide' : ''}`}
            initial={false}
            animate={{ x: offset * spread, z: active ? 0 : -200, rotateY: offset * -12,
              scale: active ? 1.05 : 0.85, opacity: active ? 1 : 0.45,
              filter: active ? 'blur(0px) grayscale(0%)' : 'blur(6px) grayscale(100%)' }}
            transition={reducedMotion ? { duration: 0 } : CAROUSEL_SPRING}
            style={{ zIndex: active ? 30 : 10 }}
            onPointerMove={moveCardLight}
          >
            <div className="path-option__frame" aria-hidden="true" />
            <div className="path-option__texture" aria-hidden="true" />
            {mode.display && <span className="path-option__display" aria-hidden="true">{mode.display}</span>}
            <div className="path-option__icon" aria-hidden="true"><mode.Icon size={72} weight="thin" /></div>
            <div className="path-option__copy">
              <span className="path-option__tag">{mode.tag}</span>
              <h3 className="path-option__title">{mode.title}</h3>
              <p className="path-option__body">{mode.body}</p>
            </div>
            <button type="button" className="path-option__select" aria-label={`Submit with ${mode.tag}`} aria-haspopup="dialog"
              onClick={event => {
                if (event.detail === 0 || !gesture.current.swiped) {
                  setActiveIndex(index)
                  onSelect(mode.tag)
                }
                gesture.current.swiped = false
              }} />
          </motion.article>
        })}
      </div>
    </div>
    <div className="paths-carousel__controls">
      <button type="button" aria-label="Previous path" onClick={() => step(-1)}>←</button>
      <div className="paths-carousel__tabs">
        {MODES.map((mode, index) => <button type="button" key={mode.tag} aria-label={`Show ${mode.tag}`}
          aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)}>{String(index + 1).padStart(2, '0')}</button>)}
      </div>
      <button type="button" aria-label="Next path" onClick={() => step(1)}>→</button>
    </div>
    <p className="paths-visually-hidden" aria-live="polite">{MODES[activeIndex].tag}, {activeIndex + 1} of {MODES.length}</p>
  </motion.div>
}

function PathSubmissionDialog({ path, onClose }: { path: ReleasePath; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const mode = MODES.find(item => item.tag === path)!
  const Icon = mode.Icon
  const lenis = useSmoothScroll()
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    const controller = lenis?.current
    const wasStopped = controller?.isStopped
    document.body.style.overflow = 'hidden'
    controller?.stop()
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (!wasStopped) controller?.start()
    }
  }, [lenis])

  const confirm = () => {
    onClose()
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent(RELEASE_PATH_EVENT, { detail: path }))
      document.querySelector('#demo')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    })
  }

  return createPortal(<dialog ref={dialogRef} className="path-submission-dialog" data-path={path} aria-labelledby="path-submission-title"
    onCancel={onClose}
    onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
    }}>
    <div className="path-submission-dialog__header">
      <span className="path-submission-dialog__label">{path}</span>
      <span className="path-submission-dialog__brand">uwbelieve</span>
    </div>
    <div className="path-submission-dialog__art" aria-hidden="true"><Icon weight="thin" /></div>
    <div className="path-submission-dialog__content">
      <h2 id="path-submission-title"><span>Wanna send</span><span>a submission?</span></h2>
      <p>{mode.title}</p>
    </div>
    <button type="button" className="path-submission-dialog__confirm" onClick={confirm} autoFocus><span>with that option</span><span className="path-submission-dialog__arrow" aria-hidden="true">↗</span></button>
  </dialog>, document.body)
}

function SceneHeading({ black = false, x }: { black?: boolean; x?: MotionValue<string> }) {
  return <div className="paths-script">
    <motion.div className="paths-script__body" style={x ? { x } : undefined}>
      <p className="paths-script__kicker"><i aria-hidden="true" />Three ways in</p>
      <div className="paths-script__title">
        <span>Pick the path</span>
        <span className={black ? '' : 'paths-script__silent'}>Your record needs.</span>
      </div>
    </motion.div>
  </div>
}

export function ReleasePathsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [selectedPath, setSelectedPath] = useState<ReleasePath | null>(null)
  const [animated, setAnimated] = useState(false)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const whiteMask = useTransform(scrollYProgress, (value) => `inset(${100 * (1 - smooth(value, 0.035, 0.2))}% 0 0 0)`)
  const blackMask = useTransform(scrollYProgress, (value) => `inset(0 0 ${100 * (1 - smooth(value, 0.225, 0.39))}% 0)`)
  const titleX = useTransform(scrollYProgress, (value) => `${-110 * easeInOut(value, 0.41, 0.57)}vw`)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)')
    const update = () => setAnimated(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return <section
    id="releases"
    ref={sectionRef}
    aria-label="Ways to release with us"
    className={`paths-section${animated ? ' paths-section--animated' : ''}`}
  >
    <div className="paths-stage">
      {animated ? <>
        <h2 className="paths-visually-hidden">Pick the path your record needs.</h2>
        <motion.div className="paths-wipe paths-wipe--white" style={{ clipPath: whiteMask }} aria-hidden="true">
          <SceneHeading />
        </motion.div>
        <motion.div className="paths-wipe paths-wipe--black" style={{ clipPath: blackMask }} aria-hidden="true">
          <SceneHeading black x={titleX} />
        </motion.div>
      </> : <div className="paths-static-head">
        <p className="paths-script__kicker"><i aria-hidden="true" />Three ways in</p>
        <h2>Pick the path<br />your record needs.</h2>
      </div>}
      <div className="paths-options-region">
        <PathsCarousel progress={scrollYProgress} animated={animated} onSelect={setSelectedPath} />
      </div>
    </div>
    {selectedPath && <PathSubmissionDialog path={selectedPath} onClose={() => setSelectedPath(null)} />}
  </section>
}
