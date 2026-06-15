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

// ─── scroll timeline ─────────────────────────────────────────────────────────────
//
//  0.00 – 0.08   hold
//  0.08 – 0.50   word letter-spacing stretches wide
//  0.20 – 0.65   word blurs up then fades to 0
//  0.25 – 0.65   BOTH bands fade in simultaneously (during blur phase)
//  0.65 – 1.00   bands at full opacity, word fully gone

const T = {
  HOLD_END:        0.08,
  STRETCH_END:     0.50,
  BLUR_START:      0.20,
  BLUR_PEAK:       0.42,
  TEXT_FADE_END:   0.65,
  BANDS_IN_START:  0.25,  // starts during blur, both bands together
  BANDS_IN_END:    0.62,
} as const

const SPEED = 60 // px / s

// ─── helpers ────────────────────────────────────────────────────────────────────

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

// ─── IconBadge ────────────────────────────────────────────────────────────────

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

// ─── Band ───────────────────────────────────────────────────────────────────────────

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

  // outer edge fades to bg colour, inner (centre) edge stays sharp
  const maskImage =
    direction === 'left'
      ? 'linear-gradient(to left,  #050505 0%, transparent 18%)'
      : 'linear-gradient(to right, #050505 0%, transparent 18%)'

  return (
    <div
      style={{
        width: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        WebkitMaskImage: maskImage,
        maskImage,
      }}
    >
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
        @keyframes bandLeft {
          from { transform: translateX(0px); }
          to   { transform: translateX(-${halfW}px); }
        }
        @keyframes bandRight {
          from { transform: translateX(-${halfW}px); }
          to   { transform: translateX(0px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes bandLeft  { from, to { transform: none; } }
          @keyframes bandRight { from, to { transform: none; } }
        }
      `}</style>
    </div>
  )
}

// ─── DualBands ─────────────────────────────────────────────────────────────────

function DualBands({ active, iconSize, iconInner }: {
  active: boolean
  iconSize: number
  iconInner: number
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
        alignItems: 'center',
        pointerEvents: active ? 'auto' : 'none',
        zIndex: 2,
      }}
    >
      {/* 1px centre divider */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1,
          height: iconSize + 16,
          background: 'rgba(255,255,255,0.08)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />
      {/* both bands rendered together — they appear simultaneously */}
      <Band direction="left"  iconSize={iconSize} iconInner={iconInner} />
      <Band direction="right" iconSize={iconSize} iconInner={iconInner} />
    </motion.div>
  )
}

// ─── EverywhereReveal ───────────────────────────────────────────────────────────

export function EverywhereReveal() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { icon, inner, maxSpacing } = useAdaptive()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // letter-spacing: “-0.03em” at rest → maxSpacing at STRETCH_END
  const letterSpacing = useTransform(scrollYProgress, (p) => {
    const pct = lerp(p, T.HOLD_END, T.STRETCH_END, 0, 1)
    // interpolate from -0.03em to maxSpacing numerically isn’t trivial in CSS,
    // so we scale font via word-spacing trick: use letter-spacing directly as a
    // MotionValue string via useMotionTemplate
    return pct
  })
  // encode as actual em value: -0.03 + pct * (maxSpacingNum + 0.03)
  // We parse maxSpacing to get its number part
  const maxSpacingNum = parseFloat(maxSpacing) // e.g. 0.55
  const letterSpacingEm = useMotionTemplate`${useTransform(
    letterSpacing,
    (pct) => ((-0.03 + pct * (maxSpacingNum + 0.03)).toFixed(4))
  )}em`

  // blur
  const blurPx = useTransform(scrollYProgress, (p) => {
    if (reducedMotion) return 0
    if (p <= T.BLUR_START)   return 0
    if (p <= T.BLUR_PEAK)    return lerp(p, T.BLUR_START, T.BLUR_PEAK,    0,  14)
    if (p <= T.TEXT_FADE_END) return lerp(p, T.BLUR_PEAK, T.TEXT_FADE_END, 14, 0)
    return 0
  })
  const textFilter = useMotionTemplate`blur(${blurPx}px)`

  // opacity
  const textOpacity = useTransform(scrollYProgress, (p) =>
    lerp(p, T.BLUR_START, T.TEXT_FADE_END, 1, 0)
  )

  // bands gate — both bands appear at the same time, triggered by same threshold
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
        aria-label="everywhere — available on all major platforms"
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
        {/* word with stretching letter-spacing */}
        <motion.p
          aria-hidden="true"
          style={{
            fontSize: 'clamp(2rem, 7vw, 6rem)',
            fontWeight: 300,
            letterSpacing: letterSpacingEm,
            color: '#f0f0f0',
            lineHeight: 1,
            margin: 0,
            filter: textFilter,
            opacity: textOpacity,
            userSelect: 'none',
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          everywhere
        </motion.p>

        {/* dual bands — both appear simultaneously during blur */}
        <DualBands active={bandsActive} iconSize={icon} iconInner={inner} />
      </div>
    </div>
  )
}
