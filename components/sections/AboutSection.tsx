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

function OrbitPrinciple({ index, active, reduced }: { index: number; active: MotionValue<number>; reduced: boolean }) {
  const { title, copy, icon: Icon } = PRINCIPLES[index]
  const offset = useTransform(active, value => index - value)
  const angle = useTransform(offset, value => Math.max(-1.75, Math.min(1.75, value)) * 0.76)
  const x = useTransform(angle, value => `${-21 * (1 - Math.cos(value))}cqw`)
  const y = useTransform(angle, value => `${51 * Math.sin(value)}cqh`)
  const rotate = useTransform(angle, value => 17 * Math.sin(value))
  const scale = useTransform(angle, value => 0.76 + 0.24 * Math.cos(value))
  const opacity = useTransform(offset, value => clamp01(1 - Math.abs(value) / 1.52) ** 1.4)
  const filter = useTransform(offset, value => `blur(${Math.min(Math.abs(value) ** 1.65 * 5, 14)}px)`)
  return (
    <motion.article className="about-principle" style={reduced ? undefined : { x, y, rotate, scale, opacity, filter }}>
      <Icon className="about-principle__icon" size={25} weight="light" aria-hidden="true" />
      <h3>{title}</h3>
      <p>{copy}</p>
    </motion.article>
  )
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const progress = useMotionValue(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const active = useTransform(scrollYProgress, [0, 0.94], [0, PRINCIPLES.length - 1])
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
          // reversible carousel. Returning through the section must not undo
          // text visibility or move the wordmark back towards the center.
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
            <motion.p className="about-principles__intro" style={{ opacity: reduced ? 1 : introOpacity, y: reduced ? 0 : introY }}>It works each record properly:</motion.p>
            <motion.div className="about-principles" style={{ opacity: reduced ? 1 : introOpacity }}>
              {PRINCIPLES.map((item, index) => <OrbitPrinciple key={item.title} index={index} active={active} reduced={reduced} />)}
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
          left: 48%;
          right: var(--pad);
          top: 21%;
          height: 64%;
        }
        :global(.about-principles__intro) { position: relative; z-index: 1; margin: 0 0 0 16%; color: var(--ink-2); font-size: clamp(15px, 1.2vw, 18px); letter-spacing: -.02em; }
        :global(.about-principles) {
          position: absolute;
          inset: 10% 0 0;
          container-type: size;
          mask-image: linear-gradient(transparent, #000 21%, #000 79%, transparent);
        }
        :global(.about-principle) {
          position: absolute;
          top: 50%;
          inset-inline: 16% 0;
          translate: 0 -50%;
          transform-origin: left center;
          color: var(--ink);
        }
        :global(.about-principle__icon) { color: #adb8da; margin-bottom: 12px; }
        :global(.about-principle h3) { margin: 0; font-size: clamp(26px, 3.5vw, 50px); font-weight: 800; letter-spacing: -.055em; line-height: 1.04; }
        :global(.about-principle p) { margin: 12px 0 0; max-width: 34ch; color: var(--ink-2); font-size: clamp(14px, 1.25vw, 17px); line-height: 1.45; }
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
          :global(.about-principle h3) { font-size: clamp(26px, 7vw, 36px); }
          :global(.about-principle__icon) { margin-bottom: 10px; }
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
          .about-description { height: auto; }
          :global(.about-principles__intro) { margin-inline-start: 0; }
          :global(.about-principles) { position: static; container-type: normal; mask-image: none; display: grid; gap: 28px; margin-top: 24px; }
          :global(.about-principle) { position: static; translate: none; }
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
