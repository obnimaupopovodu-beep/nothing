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

// ─── constants ────────────────────────────────────────────────────────────────

const WORD = 'everywhere'
const LETTERS = WORD.split('')

// Scroll timeline  (scrollYProgress 0 → 1)
//  0.00 – 0.08  hold: nothing moves
//  0.08 – 0.40  icons fade+expand into gaps, gap between letters widens
//  0.40 – 0.65  letters blur up then fade out; icons start to compress
//  0.65 – 0.85  letters fully gone; side icons fade in
//  0.85 – 1.00  all icons collapse gap → carousel fires

const T = {
  HOLD_END:          0.08,
  ICONS_IN_END:      0.40,
  BLUR_PEAK:         0.52,
  TEXT_FADE_START:   0.56,
  TEXT_FADE_END:     0.72,
  SIDE_IN_START:     0.68,
  SIDE_IN_END:       0.84,
  GAP_COLLAPSE_END:  0.95,
  CAROUSEL_START:    0.88,
} as const

const SPRING = { type: 'spring' as const, stiffness: 340, damping: 24 }

// ─── adaptive sizing ──────────────────────────────────────────────────────────

function useAdaptive() {
  const [v, setV] = useState({ gap: 48, iconSize: 24, iconInner: 13, carouselIconSize: 32 })

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 480) setV({ gap: 14, iconSize: 18, iconInner: 10, carouselIconSize: 26 })
      else if (w < 768) setV({ gap: 26, iconSize: 20, iconInner: 11, carouselIconSize: 28 })
      else if (w < 1024) setV({ gap: 36, iconSize: 22, iconInner: 12, carouselIconSize: 30 })
      else setV({ gap: 48, iconSize: 24, iconInner: 13, carouselIconSize: 32 })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return v
}

// ─── lerp helper ──────────────────────────────────────────────────────────────

function lerp(p: number, a: number, b: number, from: number, to: number) {
  if (p <= a) return from
  if (p >= b) return to
  return from + ((p - a) / (b - a)) * (to - from)
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Letter({
  char,
  blurPx,
  opacity,
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
        filter,
        opacity,
        // No extra padding — padding causes the "visible box during blur" artifact.
        // The letter naturally has enough optical size from font metrics.
        lineHeight: 1,
      }}
      whileHover={{ scale: 1.08 }}
      transition={SPRING}
    >
      {char}
    </motion.span>
  )
}

function IconBadge({
  platform,
  size,
  innerSize,
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
        border:
          platform.squareBg === '#000000'
            ? '1px solid rgba(255,255,255,0.18)'
            : 'none',
        flexShrink: 0,
        textDecoration: 'none',
      }}
    >
      <PlatformIcon platform={platform} size={innerSize} color="#ffffff" />
    </motion.a>
  )
}

// Icon that lives between letters — expands from width:0 and fades in.
function InlineIconSlot({
  index,
  progress,
  iconSize,
  iconInner,
}: {
  index: number
  progress: ReturnType<typeof useMotionValue>
  iconSize: number
  iconInner: number
}) {
  const platform = everywherePlatforms[index]

  const width = useTransform(progress, (p) =>
    lerp(p, T.HOLD_END, T.ICONS_IN_END, 0, iconSize)
  )
  const opacity = useTransform(progress, (p) =>
    lerp(p, T.HOLD_END, T.ICONS_IN_END, 0, 1)
  )
  const scale = useTransform(progress, (p) =>
    lerp(p, T.HOLD_END, T.ICONS_IN_END, 0.6, 1)
  )

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
      <IconBadge platform={platform} size={iconSize} innerSize={iconInner} />
    </motion.div>
  )
}

// ─── Seamless carousel ────────────────────────────────────────────────────────

const CAROUSEL_SPEED_PX_PER_S = 80 // px/s, rightward

function IconCarousel({
  active,
  iconSize,
  iconInner,
}: {
  active: boolean
  iconSize: number
  iconInner: number
}) {
  const allPlatforms = [...everywherePlatforms, ...platforms.slice(everywherePlatforms.length)]
  // Double the array so the two halves tile seamlessly
  const doubled = [...allPlatforms, ...allPlatforms]

  const trackRef = useRef<HTMLDivElement>(null)
  const [trackW, setTrackW] = useState(0)

  useEffect(() => {
    if (!trackRef.current) return
    const half = allPlatforms.length
    // measure one full set width
    const items = trackRef.current.children
    let w = 0
    for (let i = 0; i < half; i++) {
      const el = items[i] as HTMLElement
      if (el) w += el.getBoundingClientRect().width + 8 // 8 = gap
    }
    setTrackW(w)
  }, [active, allPlatforms.length])

  const duration = trackW > 0 ? trackW / CAROUSEL_SPEED_PX_PER_S : 25

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
        overflow: 'hidden',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      {/* left + right edge masks */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background:
            'linear-gradient(to right, #050505 0%, transparent 12%, transparent 88%, #050505 100%)',
        }}
      />

      {/* scrolling track */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: 8,
          willChange: 'transform',
          animation: active
            ? `evCarousel ${duration}s linear infinite`
            : 'none',
        }}
      >
        {doubled.map((platform, i) => (
          <IconBadge
            key={i}
            platform={platform}
            size={iconSize}
            innerSize={iconInner}
          />
        ))}
      </div>

      <style>{`
        @keyframes evCarousel {
          from { transform: translateX(0); }
          to   { transform: translateX(-${trackW}px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="evCarousel"] { animation: none !important; }
        }
      `}</style>
    </motion.div>
  )
}

// ─── main export ──────────────────────────────────────────────────────────────

export function EverywhereReveal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { gap: maxGap, iconSize, iconInner, carouselIconSize } = useAdaptive()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // ── letter gap (px, via motion template) ────────────────────────────────
  const gapPx = useTransform(scrollYProgress, (p) => {
    // expand 0 → maxGap as icons appear, then collapse back to 0 when text fades
    if (p <= T.HOLD_END) return 0
    if (p <= T.ICONS_IN_END) return lerp(p, T.HOLD_END, T.ICONS_IN_END, 0, maxGap)
    if (p <= T.TEXT_FADE_START) return maxGap
    if (p <= T.GAP_COLLAPSE_END) return lerp(p, T.TEXT_FADE_START, T.GAP_COLLAPSE_END, maxGap, 0)
    return 0
  })
  const gap = useMotionTemplate`${gapPx}px`

  // ── letter blur (px) ─────────────────────────────────────────────────────
  const letterBlur = useTransform(scrollYProgress, (p) => {
    if (reducedMotion) return 0
    // ramp up to 10px at BLUR_PEAK, then fade back to 0 but text opacity takes over
    if (p <= T.HOLD_END) return 0
    if (p <= T.BLUR_PEAK) return lerp(p, T.HOLD_END, T.BLUR_PEAK, 0, 10)
    if (p <= T.TEXT_FADE_END) return lerp(p, T.BLUR_PEAK, T.TEXT_FADE_END, 10, 0)
    return 0
  })

  // ── letter opacity ───────────────────────────────────────────────────────
  const letterOpacity = useTransform(scrollYProgress, (p) =>
    lerp(p, T.TEXT_FADE_START, T.TEXT_FADE_END, 1, 0)
  )

  // ── side platforms fade-in ───────────────────────────────────────────────
  // the "extra" platforms that were NOT between letters appear left+right
  const sideOpacity = useTransform(scrollYProgress, (p) =>
    lerp(p, T.SIDE_IN_START, T.SIDE_IN_END, 0, 1)
  )

  // ── carousel phase ────────────────────────────────────────────────────────
  const [carouselActive, setCarouselActive] = useState(false)
  useEffect(() => {
    if (reducedMotion) return
    return scrollYProgress.on('change', (p) => {
      setCarouselActive(p >= T.CAROUSEL_START)
    })
  }, [scrollYProgress, reducedMotion])

  // ── extra side platforms (those not used inline) ─────────────────────────
  const sidePlatforms = platforms.slice(everywherePlatforms.length)

  return (
    <div
      ref={containerRef}
      style={{ height: '250vh', position: 'relative' }}
    >
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
        {/* ── word row ──────────────────────────────────────────────────── */}
        <div
          style={{
            width: '100%',
            padding: '0 clamp(16px, 5vw, 48px)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Side icons — left */}
          <motion.div
            style={{
              position: 'absolute',
              left: 'clamp(12px, 3vw, 32px)',
              top: '50%',
              translateY: '-50%',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              opacity: sideOpacity,
              pointerEvents: carouselActive ? 'none' : 'auto',
            }}
          >
            {sidePlatforms.slice(0, Math.ceil(sidePlatforms.length / 2)).map((p) => (
              <IconBadge key={p.name} platform={p} size={iconSize} innerSize={iconInner} />
            ))}
          </motion.div>

          {/* Side icons — right */}
          <motion.div
            style={{
              position: 'absolute',
              right: 'clamp(12px, 3vw, 32px)',
              top: '50%',
              translateY: '-50%',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              opacity: sideOpacity,
              pointerEvents: carouselActive ? 'none' : 'auto',
            }}
          >
            {sidePlatforms.slice(Math.ceil(sidePlatforms.length / 2)).map((p) => (
              <IconBadge key={p.name} platform={p} size={iconSize} innerSize={iconInner} />
            ))}
          </motion.div>

          {/* Word */}
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
              opacity: carouselActive ? 0 : 1,
              transition: 'opacity 0.3s ease',
              pointerEvents: carouselActive ? 'none' : 'auto',
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
                    iconSize={iconSize}
                    iconInner={iconInner}
                  />
                )}
              </Fragment>
            ))}
          </motion.div>
        </div>

        {/* ── carousel overlay ─────────────────────────────────────────── */}
        <IconCarousel
          active={carouselActive}
          iconSize={carouselIconSize}
          iconInner={iconInner + 1}
        />
      </div>
    </div>
  )
}
