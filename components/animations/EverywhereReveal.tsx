'use client'

import { everywherePlatforms, platforms } from '@/components/data/platforms'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { Fragment, useEffect, useRef, useState } from 'react'

// ─── constants ───────────────────────────────────────────────────────────────────

const WORD = 'everywhere'
const LETTERS = WORD.split('')

// ─── scroll timeline ─────────────────────────────────────────────────────────────
//
//  0.00 – 0.08   hold
//  0.08 – 0.40   inline icons appear, gap opens
//  0.40 – 0.70   letters blur → fade-out
//  0.66 – 0.82   side platforms fade-IN  (overlap with text fade-out)
//  0.84 – 0.94   side platforms fade-OUT (cross-fade into carousel)
//  0.86 – 1.00   carousel active

const T = {
  HOLD_END:         0.08,
  ICONS_IN_END:     0.40,
  BLUR_PEAK:        0.50,
  TEXT_FADE_START:  0.54,
  TEXT_FADE_END:    0.70,
  SIDE_IN_START:    0.66,
  SIDE_IN_END:      0.82,
  SIDE_OUT_START:   0.84,
  SIDE_OUT_END:     0.94,
  CAROUSEL_START:   0.86,
  GAP_COLLAPSE_END: 0.95,
} as const

const SPRING        = { type: 'spring' as const, stiffness: 340, damping: 24 }
const CAROUSEL_SPEED = 80 // px / s

// ─── adaptive sizing ─────────────────────────────────────────────────────────────

type Sizes = { gap: number; icon: number; inner: number; carIcon: number }

function useAdaptive(): Sizes {
  const [v, setV] = useState<Sizes>({ gap: 48, icon: 24, inner: 13, carIcon: 32 })
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth
      if (w < 480)       setV({ gap: 14, icon: 18, inner: 10, carIcon: 26 })
      else if (w < 768)  setV({ gap: 26, icon: 20, inner: 11, carIcon: 28 })
      else if (w < 1024) setV({ gap: 36, icon: 22, inner: 12, carIcon: 30 })
      else               setV({ gap: 48, icon: 24, inner: 13, carIcon: 32 })
    }
    fn()
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return v
}

// ─── lerp ────────────────────────────────────────────────────────────────────────────

function lerp(p: number, a: number, b: number, from: number, to: number) {
  if (p <= a) return from
  if (p >= b) return to
  return from + ((p - a) / (b - a)) * (to - from)
}

// ─── IconBadge ─────────────────────────────────────────────────────────────────

function IconBadge({
  platform, size, innerSize,
}: {
  platform: (typeof platforms)[0]
  size: number
  innerSize: number
}) {
  return (
    <motion.a
      href={platform.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Listen on ${platform.name}`}
      whileHover={{ scale: 1.12 }}
      transition={SPRING}
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
      }}
    >
      <PlatformIcon platform={platform} size={innerSize} color="#ffffff" />
    </motion.a>
  )
}

// ─── Letter ──────────────────────────────────────────────────────────────────────────

function Letter({
  char, blurPx, opacity,
}: {
  char: string
  blurPx: ReturnType<typeof useTransform>
  opacity: ReturnType<typeof useTransform>
}) {
  const filter = useMotionTemplate`blur(${blurPx}px)`
  return (
    <motion.span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        flexShrink: 0,
        lineHeight: 1, // no padding — padding causes visible box during blur
        filter,
        opacity,
      }}
      whileHover={{ scale: 1.08 }}
      transition={SPRING}
    >
      {char}
    </motion.span>
  )
}

// ─── InlineIconSlot ─────────────────────────────────────────────────────────────

function InlineIconSlot({
  index, progress, size, inner,
}: {
  index: number
  progress: ReturnType<typeof useMotionValue>
  size: number
  inner: number
}) {
  const platform = everywherePlatforms[index]
  const width   = useTransform(progress, (p) => lerp(p, T.HOLD_END, T.ICONS_IN_END, 0, size))
  const opacity = useTransform(progress, (p) => lerp(p, T.HOLD_END, T.ICONS_IN_END, 0, 1))
  const scale   = useTransform(progress, (p) => lerp(p, T.HOLD_END, T.ICONS_IN_END, 0.5, 1))

  return (
    <motion.div
      style={{
        width,
        opacity,
        scale,
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconBadge platform={platform} size={size} innerSize={inner} />
    </motion.div>
  )
}

// ─── SideIcons ──────────────────────────────────────────────────────────────────

const sidePlatforms = platforms.slice(everywherePlatforms.length)
const sideLeft      = sidePlatforms.slice(0, Math.ceil(sidePlatforms.length / 2))
const sideRight     = sidePlatforms.slice(Math.ceil(sidePlatforms.length / 2))

function SideIcons({
  list, side, progress, size, inner,
}: {
  list: typeof platforms
  side: 'left' | 'right'
  progress: ReturnType<typeof useMotionValue>
  size: number
  inner: number
}) {
  const opacity = useTransform(progress, (p) => {
    if (p >= T.SIDE_OUT_START) return lerp(p, T.SIDE_OUT_START, T.SIDE_OUT_END, 1, 0)
    return lerp(p, T.SIDE_IN_START, T.SIDE_IN_END, 0, 1)
  })

  return (
    <motion.div
      style={{
        position: 'absolute',
        [side]: 'clamp(12px, 3vw, 40px)',
        top: '50%',
        translateY: '-50%',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        opacity,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {list.map((p) => (
        <IconBadge key={p.name} platform={p} size={size} innerSize={inner} />
      ))}
    </motion.div>
  )
}

// ─── IconCarousel ──────────────────────────────────────────────────────────────

function IconCarousel({ active, size, inner }: { active: boolean; size: number; inner: number }) {
  const doubled = [...platforms, ...platforms]
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackW, setTrackW] = useState(0)

  useEffect(() => {
    if (!active || !trackRef.current) return
    const gap = 10
    const items = Array.from(trackRef.current.children) as HTMLElement[]
    const half = platforms.length
    let w = 0
    for (let i = 0; i < half; i++) {
      w += (items[i]?.getBoundingClientRect().width ?? size) + gap
    }
    setTrackW(w)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const duration = trackW > 0 ? trackW / CAROUSEL_SPEED : 20

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        pointerEvents: active ? 'auto' : 'none',
        zIndex: 2,
      }}
    >
      {/* edge fade masks */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background:
            'linear-gradient(to right, #050505 0%, transparent 10%, transparent 90%, #050505 100%)',
        }}
      />

      {/* scrolling track — doubled for seamless loop */}
      {/* translateX: 0 → -trackW so icons travel left, entering from left edge */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: 10,
          willChange: 'transform',
          animation:
            active && trackW > 0
              ? `evCarousel ${duration}s linear infinite`
              : 'none',
        }}
      >
        {doubled.map((p, i) => (
          <IconBadge key={i} platform={p} size={size} innerSize={inner} />
        ))}
      </div>

      <style>{`
        @keyframes evCarousel {
          from { transform: translateX(0px); }
          to   { transform: translateX(-${trackW}px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes evCarousel { from, to { transform: none; } }
        }
      `}</style>
    </motion.div>
  )
}

// ─── EverywhereReveal (main) ───────────────────────────────────────────────────────

export function EverywhereReveal() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { gap: maxGap, icon, inner, carIcon } = useAdaptive()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // letter gap
  const gapPx = useTransform(scrollYProgress, (p) => {
    if (p <= T.HOLD_END)          return 0
    if (p <= T.ICONS_IN_END)      return lerp(p, T.HOLD_END, T.ICONS_IN_END, 0, maxGap)
    if (p <= T.TEXT_FADE_START)   return maxGap
    if (p <= T.GAP_COLLAPSE_END)  return lerp(p, T.TEXT_FADE_START, T.GAP_COLLAPSE_END, maxGap, 0)
    return 0
  })
  const gap = useMotionTemplate`${gapPx}px`

  // letter blur: ramp up then back down, opacity handles the final disappearance
  const letterBlur = useTransform(scrollYProgress, (p) => {
    if (reducedMotion) return 0
    if (p <= T.HOLD_END)      return 0
    if (p <= T.BLUR_PEAK)     return lerp(p, T.HOLD_END,  T.BLUR_PEAK,     0,  10)
    if (p <= T.TEXT_FADE_END) return lerp(p, T.BLUR_PEAK, T.TEXT_FADE_END, 10, 0)
    return 0
  })

  // letter opacity
  const letterOpacity = useTransform(scrollYProgress, (p) =>
    lerp(p, T.TEXT_FADE_START, T.TEXT_FADE_END, 1, 0)
  )

  // carousel gate
  const [carouselActive, setCarouselActive] = useState(false)
  useEffect(() => {
    if (reducedMotion) return
    return scrollYProgress.on('change', (p) => {
      setCarouselActive(p >= T.CAROUSEL_START)
    })
  }, [scrollYProgress, reducedMotion])

  return (
    <div ref={containerRef} style={{ height: '260vh', position: 'relative' }}>
      <div
        aria-label="Everywhere — available on all major platforms"
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
        {/* side icons: appear after text is gone, fade out before carousel */}
        {sidePlatforms.length > 0 && (
          <>
            <SideIcons list={sideLeft}  side="left"  progress={scrollYProgress} size={icon} inner={inner} />
            <SideIcons list={sideRight} side="right" progress={scrollYProgress} size={icon} inner={inner} />
          </>
        )}

        {/* word + inline icons */}
        <div
          style={{
            width: '100%',
            padding: '0 clamp(16px, 5vw, 48px)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <motion.div
            role="presentation"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'max-content',
              minWidth: '100%',
              margin: '0 auto',
              gap,
              fontSize: 'clamp(1.5rem, 5.5vw, 4.5rem)',
              fontWeight: 300,
              letterSpacing: '-0.03em',
              color: '#f0f0f0',
              lineHeight: 1,
            }}
          >
            {LETTERS.map((char, i) => (
              <Fragment key={`${char}-${i}`}>
                <Letter
                  char={char}
                  blurPx={letterBlur as ReturnType<typeof useTransform>}
                  opacity={letterOpacity as ReturnType<typeof useTransform>}
                />
                {i < everywherePlatforms.length && (
                  <InlineIconSlot
                    index={i}
                    progress={scrollYProgress}
                    size={icon}
                    inner={inner}
                  />
                )}
              </Fragment>
            ))}
          </motion.div>
        </div>

        {/* carousel fades in over everything */}
        <IconCarousel active={carouselActive} size={carIcon} inner={inner + 2} />
      </div>
    </div>
  )
}
