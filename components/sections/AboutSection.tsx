'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { VinylRecord, ChartLine, SpeakerHigh, ChatCircle } from '@phosphor-icons/react/dist/ssr'
import { useSmoothScroll } from '@/components/layout/SmoothScroll'

const PRINCIPLES = [
  { title: 'Clean distribution.', copy: 'Every record handled properly, from the first step to release day.', icon: VinylRecord },
  { title: 'Honest reporting.', copy: 'Clear numbers. No inflated promises.', icon: ChartLine },
  { title: 'Promotion with purpose.', copy: 'Promo only when the track can carry it.', icon: SpeakerHigh },
  { title: 'A real conversation.', copy: 'No silence after you send a demo.', icon: ChatCircle },
]

const CONTENT_REVEAL_START = .70
const CONTENT_REVEAL_STAGGER = .035
const CONTENT_REVEAL_DURATION = .16

const FLASH_POINTS = [0.33, 0.38]
const PRESENTATION_DURATION = 2500
const EASE_SHARPNESS = 6
const INVERSION_SPAN = 120 / PRESENTATION_DURATION

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const sharpEaseInOut = (value: number) => {
  const t = clamp01(value)
  // Long, quiet ends with a steep acceleration through the middle.
  const rise = t ** EASE_SHARPNESS
  const fall = (1 - t) ** EASE_SHARPNESS
  return rise / (rise + fall)
}

function PrincipleCard({ index, progress, reduced }: { index: number; progress: MotionValue<number>; reduced: boolean }) {
  const item = PRINCIPLES[index]
  const Icon = item.icon
  const opacity = useTransform(progress, value => sharpEaseInOut((value - CONTENT_REVEAL_START - index * CONTENT_REVEAL_STAGGER) / CONTENT_REVEAL_DURATION))
  const y = useTransform(opacity, value => (1 - value) * 16)
  return <motion.article className="about-principle" style={{ opacity: reduced ? 1 : opacity, y: reduced ? 0 : y }}>
    <Icon className="about-principle__icon" size={30} weight="light" aria-hidden="true" />
    <h3>{item.title}</h3><p>{item.copy}</p>
  </motion.article>
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const progress = useMotionValue(0)
  const railStart = useMotionValue(-140)
  const railTravel = useMotionValue(1000)
  const { scrollYProgress: cardsProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const railY = useTransform([cardsProgress, railStart, railTravel], ([position, start, travel]) => Number(start) - Number(position) * Number(travel))
  const reduced = Boolean(useReducedMotion())
  const scrollController = useSmoothScroll()
  const autoplayConsumed = useRef(false)

  const inversion = useTransform(progress, (value) => Math.max(0, ...FLASH_POINTS.map((point) => {
    const phase = (value - point) / INVERSION_SPAN
    if (phase <= 0 || phase >= 1) return 0
    return sharpEaseInOut(phase < 0.5 ? phase * 2 : (1 - phase) * 2)
  })))
  const backgroundColor = useTransform(inversion, [0, 1], ['#050505', '#fafafa'])
  const textColor = useTransform(inversion, [0, 1], ['#fafafa', '#050505'])

  const shift = useTransform(progress, (value) => sharpEaseInOut((value - 0.1) / 0.58))
  const desktopLeft = useTransform(shift, (value) => `${50 * (1 - value)}%`)
  const desktopX = useTransform(shift, (value) => `${-50 * (1 - value)}%`)
  const mobileY = useTransform(shift, (value) => `${-30 * value}svh`)
  const introOpacity = useTransform(progress, value => sharpEaseInOut((value - CONTENT_REVEAL_START) / CONTENT_REVEAL_DURATION))
  const introY = useTransform(introOpacity, value => (1 - value) * 16)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const measure = () => {
      const cards = rail.querySelectorAll<HTMLElement>('.about-principle')
      const first = cards[0], last = cards[cards.length - 1]
      if (!first || !last) return
      const firstCenter = first.offsetTop + first.offsetHeight / 2
      const lastCenter = last.offsetTop + last.offsetHeight / 2
      railStart.set(-firstCenter)
      railTravel.set(Math.max(0, lastCenter - firstCenter))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(rail)
    rail.querySelectorAll('.about-principle').forEach(card => observer.observe(card))
    measure()
    return () => observer.disconnect()
  }, [railStart, railTravel])

  useEffect(() => {
    if (reduced) return

    let frame = 0
    let active = false
    let startedAt = 0
    let lockedAt = 0
    let releaseScroll: (() => void) | null = null
    let releaseMobileScroll: (() => void) | null = null
    let previousScroll = window.scrollY
    let previousTime = performance.now()

    // Recover a controller left stopped by the previous interrupted presentation.
    scrollController?.current?.start()

    const finish = (showFinalFrame = true) => {
      active = false
      if (showFinalFrame) progress.set(1)
      releaseMobileScroll?.()
      releaseMobileScroll = null
      releaseScroll?.()
      releaseScroll = null
      previousScroll = window.scrollY
    }

    const blockWheel = (event: WheelEvent) => {
      if (active && event.deltaY < 0) {
        finish(false)
        return
      }
      if (active) event.preventDefault()
    }
    const blockTouch = (event: TouchEvent) => {
      if (active) event.preventDefault()
    }
    const blockKeys = (event: KeyboardEvent) => {
      if (!active) return
      if (['Escape', 'ArrowUp', 'PageUp', 'Home'].includes(event.key)) {
        finish(event.key === 'Escape')
        return
      }
      if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) {
        event.preventDefault()
      }
    }
    const handleVisibility = () => {
      if (active && document.hidden) finish()
    }

    const update = (time: number) => {
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const scrollDelta = window.scrollY - previousScroll
      const delta = Math.min(0.05, Math.max(0, (time - previousTime) / 1000))
      previousTime = time
      previousScroll = window.scrollY
      if (!active) {
        // Wait until the intro curtain has gone before playing an About route.
        if (!autoplayConsumed.current && scrollDelta >= 0 && rect.top <= 1 && rect.bottom >= window.innerHeight && !document.querySelector('.intro-root')) {
          const lenis = scrollController?.current
          if (!lenis?.isStopped) {
            autoplayConsumed.current = true
            active = true
            startedAt = time
            lockedAt = window.scrollY
            progress.set(0)
            lenis?.stop()
            releaseScroll = () => lenis?.start()
            if (window.matchMedia('(max-width: 700px)').matches) {
              // Lenis does not own native touch momentum. Pin the page at its
              // current offset so a swipe cannot carry it through the scene.
              const body = document.body
              const { position, top, left, right, width } = body.style
              body.style.position = 'fixed'
              body.style.top = `${-lockedAt}px`
              body.style.left = '0'
              body.style.right = '0'
              body.style.width = '100%'
              releaseMobileScroll = () => {
                Object.assign(body.style, { position, top, left, right, width })
                window.scrollTo({ top: lockedAt, behavior: 'instant' })
              }
            }
          }
        } else {
          // The introduction is a one-time presentation, independent of the
          // reversible card rail. Returning through the section must not undo
          // card visibility or move the wordmark back towards the center.
          if (scrollDelta < 0 && rect.top <= 1) autoplayConsumed.current = true
          const target = autoplayConsumed.current ? 1 : 0
          const current = progress.get()
          const next = current + (target - current) * (1 - Math.exp(-delta * 18))
          progress.set(Math.abs(next - target) < 0.001 ? target : next)
        }
      }

      if (active) {
        // Explicit navigation or dragging the scrollbar releases the presentation.
        // Never pull the page back to an anchor or jump forward on completion.
        if (!releaseMobileScroll && Math.abs(window.scrollY - lockedAt) > 2) {
          finish(false)
          frame = window.requestAnimationFrame(update)
          return
        }
        const next = clamp01((time - startedAt) / PRESENTATION_DURATION)
        progress.set(next)
        if (next === 1) finish()
      }
      frame = window.requestAnimationFrame(update)
    }

    frame = window.requestAnimationFrame(update)
    window.addEventListener('wheel', blockWheel, { passive: false, capture: true })
    window.addEventListener('touchmove', blockTouch, { passive: false, capture: true })
    window.addEventListener('keydown', blockKeys)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('wheel', blockWheel, true)
      window.removeEventListener('touchmove', blockTouch, true)
      window.removeEventListener('keydown', blockKeys)
      document.removeEventListener('visibilitychange', handleVisibility)
      releaseMobileScroll?.()
      releaseScroll?.()
    }
  }, [progress, reduced, scrollController])

  return (
    <section id="about" ref={sectionRef} aria-label="About the label" className="about-section">
      <motion.div
        className="about-scene"
        style={{
          backgroundColor: reduced ? 'var(--bg)' : backgroundColor,
          color: reduced ? 'var(--ink)' : textColor,
        }}
      >
        <div className="about-shell">
          <div className="desktop-title-track">
            <motion.h2
              className="about-title"
              style={{ left: reduced ? '0%' : desktopLeft, x: reduced ? '0%' : desktopX }}
            >
              <span>uwbelieve.</span>
            </motion.h2>
          </div>

          <div className="mobile-title-track">
            <motion.h2 className="about-title" style={{ x: reduced ? '0%' : '-50%', y: reduced ? 0 : mobileY }}>
              <span>uwbelieve.</span>
            </motion.h2>
          </div>

          <div className="about-description">
            <motion.div ref={railRef} className="about-principles" style={{ y: reduced ? 0 : railY }}>
              <motion.p className="about-principles__intro" style={{ opacity: reduced ? 1 : introOpacity, y: reduced ? 0 : introY }}>It works each record properly:</motion.p>
              {PRINCIPLES.map((item, index) => <PrincipleCard key={item.title} index={index} progress={progress} reduced={reduced} />)}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .about-section {
          position: relative;
          height: 340svh;
          scroll-margin-top: 0;
          background: var(--bg);
        }
        :global(.about-scene) {
          position: sticky;
          top: 0;
          height: 100svh;
          overflow: hidden;
          background: var(--bg);
          color: var(--ink);
        }
        .about-shell {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 1400px;
          margin-inline: auto;
          padding-inline: var(--pad);
        }
        .desktop-title-track {
          position: absolute;
          top: 50%;
          left: var(--pad);
          right: var(--pad);
          transform: translateY(-50%);
        }
        :global(.about-title) {
          position: relative;
          width: max-content;
          max-width: 46%;
          margin: 0;
          font-size: clamp(56px, 6vw, 104px);
          font-weight: 900;
          line-height: 0.94;
          letter-spacing: -0.078em;
          color: inherit;
          white-space: nowrap;
        }
        :global(.about-title span) { display: block; }
        .mobile-title-track { display: none; }
        .about-description {
          position: absolute;
          left: 55%;
          right: var(--pad);
          top: 0;
          height: 100%;
          pointer-events: none;
          mask-image: linear-gradient(transparent, #000 17%, #000 83%, transparent);
        }
        :global(.about-principles) { position: absolute; top: 50%; width: 100%; display: grid; gap: clamp(28px, 5vh, 64px); }
        :global(.about-principles__intro) { margin: 0 0 -8px; color: var(--ink-2); font-size: clamp(15px, 1.2vw, 18px); letter-spacing: -.02em; }
        :global(.about-principle) {
          position: relative; padding: clamp(26px, 3vw, 44px); min-height: 260px;
          display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
          border: 1px solid rgba(255,255,255,.14); border-radius: var(--r);
          background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.012));
          color: var(--ink); pointer-events: auto;
        }
        :global(.about-principle__icon) { color: #adb8da; margin-bottom: 30px; }
        :global(.about-principle h3) { margin: 0; font-size: clamp(26px, 2.8vw, 42px); font-weight: 800; letter-spacing: -.045em; line-height: 1.08; }
        :global(.about-principle p) { margin: 20px 0 0; max-width: 34ch; color: var(--ink-2); font-size: clamp(14px, 1.25vw, 17px); line-height: 1.6; }
        @media (max-width: 700px) {
          .desktop-title-track { display: none; }
          .mobile-title-track {
            display: block;
            position: absolute;
            top: 50%;
            left: 50%;
          }
          :global(.about-title) {
            max-width: none;
            font-size: clamp(46px, 12vw, 68px);
          }
          .about-description { left: var(--pad); right: var(--pad); top: 35%; height: 65%; }
          :global(.about-principle) { min-height: 220px; padding: 26px; }
          :global(.about-principle h3) { font-size: clamp(26px, 7vw, 36px); }
          :global(.about-principle__icon) { margin-bottom: 24px; }
          :global(.about-principles__intro) { font-size: 14px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .about-section { height: auto; min-height: 100svh; }
          :global(.about-scene) { position: relative; min-height: 100svh; height: auto; }
          .about-shell {
            min-height: 100svh;
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: center;
            gap: 6%;
            padding-block: 96px;
          }
          .desktop-title-track, .about-description { position: static; transform: none; }
          .about-description { height: auto; mask-image: none; }
          :global(.about-principles) { position: relative; top: auto; }
          :global(.about-principle) { min-height: 0; }
          :global(.about-title) { max-width: none; }
        }
        @media (prefers-reduced-motion: reduce) and (max-width: 700px) {
          .about-shell { grid-template-columns: 1fr; gap: 32px; align-content: center; }
          .mobile-title-track { position: static; }
        }
      `}</style>
    </section>
  )
}
