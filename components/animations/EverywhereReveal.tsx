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
//  0.00 – 0.10   hold
//  0.10 – 0.55   letters blur up + fade to 0
//  0.50 – 0.72   dual carousels fade-in (overlap with tail of text fade)
//  0.72 – 1.00   carousels run at full opacity

const T = {
  HOLD_END:       0.10,
  BLUR_PEAK:      0.38,
  TEXT_FADE_END:  0.55,
  BANDS_IN_START: 0.48,
  BANDS_IN_END:   0.70,
} as const

const SPEED = 60 // px / s  (each band)

// ─── helpers ─────────────────────────────────────────────────────────────────────

function lerp(p: number, a: number, b: number, from: number, to: number) {
  if (p <= a) return from
  if (p >= b) return to
  return from + ((p - a) / (b - a)) * (to - from)
}

function useAdaptiveIconSize() {
  const [size, setSize] = useState({ icon: 32, inner: 16 })
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth
      if (w < 480)       setSize({ icon: 24, inner: 12 })
      else if (w < 768)  setSize({ icon: 28, inner: 14 })
      else               setSize({ icon: 32, inner: 16 })
    }
    fn()
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return size
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

// ─── Band — one half-width scrolling strip ───────────────────────────────────
//
// direction="left"  → track moves from centre outward to the left edge
//   keyframe:  translateX(0) → translateX(-halfW)
//   so icons enter from the right (centre) and exit left
//
// direction="right" → track moves from left edge back toward centre then beyond
//   keyframe:  translateX(-halfW) → translateX(0)
//   so icons enter from the left (centre) and exit right
//
// Both bands are overflow:hidden + masked at the outer edge.

function Band({ direction, iconSize, iconInner }: {
  direction: 'left' | 'right'
  iconSize: number
  iconInner: number
}) {
  const GAP = 12
  // Give each band its own shuffled order so the two lanes look different
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

  // left band: right-side mask (outer edge) fades out; centre side stays sharp
  // right band: left-side mask (outer edge) fades out
  const maskImage =
    direction === 'left'
      ? 'linear-gradient(to left,  #050505 0%, transparent 14%)'
      : 'linear-gradient(to right, #050505 0%, transparent 14%)'

  // left band: icons start at centre (translateX 0) and animate to -halfW (leftward)
  // right band: icons start offset by -halfW (so centre is the "source") and animate to 0 (rightward)
  const animName = direction === 'left' ? 'bandLeft' : 'bandRight'

  return (
    <div
      style={{
        width: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        // clip outer edge with a mask gradient
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
          // right band starts pre-offset so the "start" of its content sits at centre
          animation:
            halfW > 0
              ? `${animName} ${duration}s linear infinite`
              : 'none',
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
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        pointerEvents: active ? 'auto' : 'none',
        zIndex: 2,
        // tiny hairline at centre so the split is subtly visible
        // using a pseudo-element via box-shadow trick on inner div instead
      }}
    >
      {/* centre divider — 1px line */}
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

      <Band direction="left"  iconSize={iconSize} iconInner={iconInner} />
      <Band direction="right" iconSize={iconSize} iconInner={iconInner} />
    </motion.div>
  )
}

// ─── EverywhereReveal ───────────────────────────────────────────────────────────

export function EverywhereReveal() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { icon, inner } = useAdaptiveIconSize()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // ── letter blur
  const blurPx = useTransform(scrollYProgress, (p) => {
    if (reducedMotion) return 0
    if (p <= T.HOLD_END)     return 0
    if (p <= T.BLUR_PEAK)    return lerp(p, T.HOLD_END,  T.BLUR_PEAK,    0,  12)
    if (p <= T.TEXT_FADE_END) return lerp(p, T.BLUR_PEAK, T.TEXT_FADE_END, 12, 0)
    return 0
  })
  const textFilter  = useMotionTemplate`blur(${blurPx}px)`
  const textOpacity = useTransform(scrollYProgress, (p) =>
    lerp(p, T.HOLD_END, T.TEXT_FADE_END, 1, 0)
  )

  // ── bands gate
  const [bandsActive, setBandsActive] = useState(false)
  useEffect(() => {
    if (reducedMotion) return
    return scrollYProgress.on('change', (p) => {
      setBandsActive(p >= T.BANDS_IN_START)
    })
  }, [scrollYProgress, reducedMotion])

  return (
    <div ref={containerRef} style={{ height: '220vh', position: 'relative' }}>
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
        {/* word */}
        <motion.p
          aria-hidden="true"
          style={{
            fontSize: 'clamp(2rem, 7vw, 6rem)',
            fontWeight: 300,
            letterSpacing: '-0.03em',
            color: '#f0f0f0',
            lineHeight: 1,
            margin: 0,
            filter: textFilter,
            opacity: textOpacity,
            userSelect: 'none',
            zIndex: 1,
            position: 'relative',
          }}
        >
          everywhere
        </motion.p>

        {/* dual bands appear after text fades */}
        <DualBands active={bandsActive} iconSize={icon} iconInner={inner} />
      </div>
    </div>
  )
}
