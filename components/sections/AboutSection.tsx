'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { useSmoothScroll } from '@/components/layout/SmoothScroll'

const DESCRIPTION = 'It works each record properly: clean distribution, honest reporting, and promo only when the track can carry it. No inflated promises, no silence after you send a demo.'

const PHRASES = [
  'It works each record properly:',
  'clean distribution, honest reporting,',
  'and promo only when the track can carry it.',
  'No inflated promises, no silence after you send a demo.',
]

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

function RevealPhrase({
  text,
  index,
  progress,
  reduced,
}: {
  text: string
  index: number
  progress: MotionValue<number>
  reduced: boolean
}) {
  const opacity = useTransform(progress, (value) => sharpEaseInOut((value - 0.36 - index * 0.1) / 0.16))
  const y = useTransform(opacity, (value) => (1 - value) * 16)

  return (
    <motion.span
      className="about-phrase"
      style={{ opacity: reduced ? 1 : opacity, y: reduced ? 0 : y }}
    >
      {text}
    </motion.span>
  )
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const progress = useMotionValue(0)
  const reduced = Boolean(useReducedMotion())
  const scrollController = useSmoothScroll()
  const autoplayConsumed = useRef(false)
  const holdFinalFrame = useRef(false)

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
      holdFinalFrame.current = showFinalFrame
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
          // Returning from below always uses scroll control, even on the first visit.
          if (scrollDelta < 0 && rect.top <= 1) autoplayConsumed.current = true
          const travel = Math.max(1, rect.height - window.innerHeight)
          if (scrollDelta < -0.5 || rect.bottom <= window.innerHeight) holdFinalFrame.current = false
          const target = holdFinalFrame.current ? 1 : clamp01(-rect.top / travel)
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
              <span>U Wont</span>
              <span>Believe.</span>
            </motion.h2>
          </div>

          <div className="mobile-title-track">
            <motion.h2 className="about-title" style={{ x: reduced ? '0%' : '-50%', y: reduced ? 0 : mobileY }}>
              <span>U Wont</span>
              <span>Believe.</span>
            </motion.h2>
          </div>

          <div className="about-description">
            <p className="sr-only">{DESCRIPTION}</p>
            <p className="about-copy" aria-hidden="true">
              {PHRASES.map((phrase, index) => (
                <RevealPhrase
                  key={phrase}
                  text={phrase}
                  index={index}
                  progress={progress}
                  reduced={reduced}
                />
              ))}
            </p>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .about-section {
          position: relative;
          height: 125svh;
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
          top: 50%;
          transform: translateY(-50%);
        }
        .about-copy {
          margin: 0;
          font-size: clamp(18px, 1.65vw, 25px);
          font-weight: 500;
          line-height: 1.48;
          letter-spacing: -0.025em;
          color: inherit;
        }
        :global(.about-phrase) {
          display: block;
          margin-bottom: 0.35em;
          color: inherit;
        }
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
          .about-description {
            left: var(--pad);
            right: var(--pad);
            top: 52%;
            transform: none;
          }
          .about-copy {
            font-size: clamp(16px, 4.3vw, 19px);
            line-height: 1.46;
          }
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
