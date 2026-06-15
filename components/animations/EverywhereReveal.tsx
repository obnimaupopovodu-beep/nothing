'use client'

import { platforms } from '@/components/data/platforms'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const T = {
  HOLD_END:        0.08,
  STRETCH_END:     0.50,
  BLUR_START:      0.20,
  BLUR_PEAK:       0.42,
  TEXT_FADE_END:   0.65,
  BANDS_IN_START:  0.25,
  BODY_IN_START:   0.50,
} as const

const SPEED = 60

function lerp(p: number, a: number, b: number, from: number, to: number) {
  if (p <= a) return from
  if (p >= b) return to
  return from + ((p - a) / (b - a)) * (to - from)
}

function useAdaptive() {
  const [v, setV] = useState({ icon: 32, inner: 16, maxSpacing: '0.55em' })
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth
      if (w < 480)       setV({ icon: 24, inner: 12, maxSpacing: '0.2em' })
      else if (w < 768)  setV({ icon: 28, inner: 14, maxSpacing: '0.35em' })
      else               setV({ icon: 32, inner: 16, maxSpacing: '0.55em' })
    }
    fn()
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return v
}

function IconBadge({ platform, size, inner }: {
  platform: typeof platforms[0]
  size: number
  inner: number
}) {
  return (
    <a
      href={platform.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Listen on ${platform.name}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        background: platform.squareBg,
        border: platform.squareBg === '#000000' ? '1px solid rgba(255,255,255,0.18)' : 'none',
        flexShrink: 0,
        textDecoration: 'none',
        transition: 'transform 180ms cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.13)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
    >
      <PlatformIcon platform={platform} size={inner} color="#ffffff" />
    </a>
  )
}

function Band({ direction, iconSize, iconInner }: {
  direction: 'left' | 'right'
  iconSize: number
  iconInner: number
}) {
  const GAP = 12
  const list = direction === 'left' ? platforms : [...platforms].reverse()
  const doubled = [...list, ...list]

  const trackRef = useRef<HTMLDivElement>(null)
  const [halfW, setHalfW] = useState(0)

  useEffect(() => {
    if (!trackRef.current) return
    const items = Array.from(trackRef.current.children) as HTMLElement[]
    let w = 0
    for (let i = 0; i < list.length; i++) {
      w += (items[i]?.getBoundingClientRect().width ?? iconSize) + GAP
    }
    setHalfW(w)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iconSize])

  const duration = halfW > 0 ? halfW / SPEED : 18
  const animName = direction === 'left' ? 'bandLeft' : 'bandRight'

  const maskImage =
    direction === 'left'
      ? 'linear-gradient(to left,  #050505 0%, transparent 30%)'
      : 'linear-gradient(to right, #050505 0%, transparent 30%)'

  return (
    <div style={{
      width: '50%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      WebkitMaskImage: maskImage,
      maskImage,
    }}>
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: GAP,
          willChange: 'transform',
          animation: halfW > 0 ? `${animName} ${duration}s linear infinite` : 'none',
        }}
      >
        {doubled.map((p, i) => (
          <IconBadge key={i} platform={p} size={iconSize} inner={iconInner} />
        ))}
      </div>
      <style>{`
        @keyframes bandLeft  { from { transform: translateX(0px); }        to { transform: translateX(-${halfW}px); } }
        @keyframes bandRight { from { transform: translateX(-${halfW}px); } to { transform: translateX(0px); } }
        @media (prefers-reduced-motion: reduce) {
          @keyframes bandLeft  { from, to { transform: none; } }
          @keyframes bandRight { from, to { transform: none; } }
        }
      `}</style>
    </div>
  )
}

function DualBands({ active, iconSize, iconInner, bodyOpacity }: {
  active: boolean
  iconSize: number
  iconInner: number
  bodyOpacity: ReturnType<typeof useTransform>
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: active ? 'auto' : 'none',
        zIndex: 2,
        gap: 28,
      }}
    >
      {/* bands row */}
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', height: iconSize + 20 }}>
        {/* centre divider */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 1,
            height: `${iconSize + 20}px`,
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.14) 25%, rgba(255,255,255,0.14) 75%, transparent 100%)',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />
        <Band direction="left"  iconSize={iconSize} iconInner={iconInner} />
        <Band direction="right" iconSize={iconSize} iconInner={iconInner} />
      </div>

      {/* static body copy — never blurs, fades in after bands appear */}
      <motion.p
        style={{
          opacity: bodyOpacity,
          fontSize: 'clamp(0.75rem, 1.2vw, 0.95rem)',
          fontWeight: 300,
          color: 'rgba(255,255,255,0.32)',
          letterSpacing: '0.01em',
          lineHeight: 1.75,
          maxWidth: '44ch',
          margin: 0,
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 4,
        }}
      >
        We distribute to all major platforms simultaneously —{' '}
        <span style={{ color: 'rgba(255,255,255,0.55)' }}>day-and-date worldwide.</span>
      </motion.p>
    </motion.div>
  )
}

export function EverywhereReveal() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { icon, inner, maxSpacing } = useAdaptive()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const maxSpacingNum = parseFloat(maxSpacing)
  const letterSpacingEm = useMotionTemplate`${useTransform(
    scrollYProgress,
    (p) => ((-0.03 + lerp(p, T.HOLD_END, T.STRETCH_END, 0, 1) * (maxSpacingNum + 0.03)).toFixed(4))
  )}em`

  const blurPx = useTransform(scrollYProgress, (p) => {
    if (reducedMotion) return 0
    if (p <= T.BLUR_START)    return 0
    if (p <= T.BLUR_PEAK)     return lerp(p, T.BLUR_START, T.BLUR_PEAK,     0, 14)
    if (p <= T.TEXT_FADE_END) return lerp(p, T.BLUR_PEAK,  T.TEXT_FADE_END, 14, 0)
    return 0
  })
  const textFilter  = useMotionTemplate`blur(${blurPx}px)`
  const textOpacity = useTransform(scrollYProgress,
    (p) => lerp(p, T.BLUR_START, T.TEXT_FADE_END, 1, 0)
  )

  // body copy fades in after bands appear, stays at full opacity
  const bodyOpacity = useTransform(scrollYProgress,
    (p) => lerp(p, T.BODY_IN_START, T.BODY_IN_START + 0.12, 0, 1)
  )

  const [bandsActive, setBandsActive] = useState(false)
  useEffect(() => {
    if (reducedMotion) return
    return scrollYProgress.on('change', (p) => {
      setBandsActive(p >= T.BANDS_IN_START)
    })
  }, [scrollYProgress, reducedMotion])

  return (
    <div ref={containerRef} style={{ height: '230vh', position: 'relative' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
          overflow: 'hidden',
        }}
      >
        {/* blurred / fading title block */}
        <motion.div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(10px, 1.6vw, 22px)',
            textAlign: 'center',
            opacity: textOpacity,
            filter: textFilter,
            userSelect: 'none',
            padding: '0 clamp(16px, 5vw, 48px)',
            pointerEvents: 'none',
          }}
        >
          <span style={{
            fontSize: 'clamp(0.6rem, 0.9vw, 0.75rem)',
            fontWeight: 500,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.30)',
          }}>
            Distribution
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 }}>
            <span style={{
              fontSize: 'clamp(1.4rem, 3.8vw, 3.2rem)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '-0.02em',
            }}>
              Your audience is
            </span>
            <motion.span
              aria-label="everywhere"
              style={{
                fontSize: 'clamp(2rem, 7vw, 6rem)',
                fontWeight: 300,
                letterSpacing: letterSpacingEm,
                color: '#f0f0f0',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              everywhere
            </motion.span>
          </div>
        </motion.div>

        <DualBands
          active={bandsActive}
          iconSize={icon}
          iconInner={inner}
          bodyOpacity={bodyOpacity}
        />
      </div>
    </div>
  )
}
