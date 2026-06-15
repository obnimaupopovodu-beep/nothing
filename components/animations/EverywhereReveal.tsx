'use client'

import { everywherePlatforms, platforms } from '@/components/data/platforms'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { Fragment, useEffect, useRef, useState } from 'react'

const WORD = 'everywhere'
const LETTERS = WORD.split('')

const HOVER_SPRING = { type: 'spring' as const, stiffness: 380, damping: 22 }

// Scroll timeline (0 → 1 while the sticky block travels through the track)
const HOLD_END = 0.12
const SPREAD_END = 0.58
const BLUR_PEAK = 0.5
const BLUR_FADE_END = 0.78
const ICONS_IN_START = 0.18
const ICONS_IN_END = 0.52
const TEXT_FADE_START = 0.65
const TEXT_FADE_END = 0.85
const TAPE_GAP_START = 0.55
const TAPE_GAP_END = 0.8

function useExpandedGapPx() {
  const [gap, setGap] = useState(52)

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setGap(16)
      else if (window.innerWidth < 1024) setGap(32)
      else setGap(52)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return gap
}

function Letter({
  letter,
  letterBlur,
  letterOpacity,
}: {
  letter: string
  letterBlur: ReturnType<typeof useTransform<number, number>>
  letterOpacity: ReturnType<typeof useTransform<number, number>>
}) {
  const filter = useMotionTemplate`blur(${letterBlur}px)`

  return (
    <motion.span
      aria-hidden="true"
      style={{ 
        display: 'inline-block', 
        flexShrink: 0, 
        cursor: 'default', 
        filter,
        opacity: letterOpacity,
        padding: '8px 4px',
      }}
      whileHover={{ scale: 1.1 }}
      transition={HOVER_SPRING}
    >
      {letter}
    </motion.span>
  )
}

function IconSlot({
  index,
  iconWidth,
  iconOpacity,
  iconScale,
  tapeGap,
  textOpacity,
}: {
  index: number
  iconWidth: ReturnType<typeof useTransform<number, number>>
  iconOpacity: ReturnType<typeof useTransform<number, number>>
  iconScale: ReturnType<typeof useTransform<number, number>>
  tapeGap: ReturnType<typeof useTransform<number, number>>
  textOpacity: ReturnType<typeof useTransform<number, number>>
}) {
  const platform = everywherePlatforms[index]

  return (
    <motion.div
      style={{
        width: iconWidth,
        opacity: iconOpacity,
        scale: iconScale,
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tapeGap,
      }}
    >
      <motion.a
        href={platform.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Listen on ${platform.name}`}
        whileHover={{ scale: 1.1 }}
        transition={HOVER_SPRING}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: 5,
          background: platform.squareBg,
          border: platform.squareBg === '#000000' ? '1px solid rgba(255,255,255,0.15)' : 'none',
          flexShrink: 0,
          textDecoration: 'none',
        }}
      >
        <PlatformIcon platform={platform} size={13} color="#ffffff" />
      </motion.a>
    </motion.div>
  )
}

function IconCarousel({ isActive }: { isActive: boolean }) {
  const allPlatforms = [...everywherePlatforms, ...platforms.slice(everywherePlatforms.length)]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        height: 48,
      }}
    >
      <style>{`
        @keyframes carouselScroll {
                  from { transform: translateX(-50%); }
                  to { transform: translateX(0); }
        }
        .carouselTrack {
          display: flex;
          gap: 8px;
          animation: carouselScroll 30s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div className="carouselTrack">
          {[...allPlatforms, ...allPlatforms].map((platform, i) => (
            <motion.a
              key={i}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }}
              transition={HOVER_SPRING}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 6,
                background: platform.squareBg,
                border: platform.squareBg === '#000000' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                flexShrink: 0,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              aria-label={platform.name}
            >
              <PlatformIcon platform={platform} size={14} color="#ffffff" />
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function EverywhereReveal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const expandedGapPx = useExpandedGapPx()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const gapPx = useTransform(scrollYProgress, (p) => {
    if (p <= HOLD_END) return 0
    if (p >= SPREAD_END) return expandedGapPx
    return ((p - HOLD_END) / (SPREAD_END - HOLD_END)) * expandedGapPx
  })

  const gap = useTransform(gapPx, (v) => `${v}px`)

  const letterBlur = useTransform(scrollYProgress, (p) => {
    if (reducedMotion) return 0
    if (p <= HOLD_END) return 0
    if (p <= BLUR_PEAK) return ((p - HOLD_END) / (BLUR_PEAK - HOLD_END)) * 8
    if (p <= BLUR_FADE_END) return 8 - ((p - BLUR_PEAK) / (BLUR_FADE_END - BLUR_PEAK)) * 8
    return 0
  })

  const letterOpacity = useTransform(scrollYProgress, (p) => {
    if (p <= TEXT_FADE_START) return 1
    if (p >= TEXT_FADE_END) return 0
    return 1 - ((p - TEXT_FADE_START) / (TEXT_FADE_END - TEXT_FADE_START))
  })

  const tapeGap = useTransform(scrollYProgress, (p) => {
    if (p <= TAPE_GAP_START) return expandedGapPx
    if (p >= TAPE_GAP_END) return 8
    return expandedGapPx - ((p - TAPE_GAP_START) / (TAPE_GAP_END - TAPE_GAP_START)) * (expandedGapPx - 8)
  })

  const iconWidth = useTransform(scrollYProgress, (p) => {
    if (p <= ICONS_IN_START) return 0
    if (p >= ICONS_IN_END) return 24
    return ((p - ICONS_IN_START) / (ICONS_IN_END - ICONS_IN_START)) * 24
  })

  const iconOpacity = useTransform(scrollYProgress, (p) => {
    if (p <= ICONS_IN_START) return 0
    if (p >= ICONS_IN_END) return 0.7
    return ((p - ICONS_IN_START) / (ICONS_IN_END - ICONS_IN_START)) * 0.7
  })

  const iconScale = useTransform(scrollYProgress, (p) => {
    if (p <= ICONS_IN_START) return 0.7
    if (p >= ICONS_IN_END) return 1
    return 0.7 + ((p - ICONS_IN_START) / (ICONS_IN_END - ICONS_IN_START)) * 0.3
  })

  const textOpacity = useTransform(scrollYProgress, (p) => {
    if (p <= TEXT_FADE_START) return 1
    if (p >= TEXT_FADE_END) return 0
    return 1 - ((p - TEXT_FADE_START) / (TEXT_FADE_END - TEXT_FADE_START))
  })

  const [carouselActive, setCarouselActive] = useState(false)

  useEffect(() => {
    if (reducedMotion) return
    const unsub = scrollYProgress.onChange((p) => {
      setCarouselActive(p >= TEXT_FADE_END)
    })
    return unsub
  }, [scrollYProgress, reducedMotion])

  return (
    <div
      ref={containerRef}
      style={{
        height: '220vh',
        position: 'relative',
      }}
    >
      <div
        aria-label="Everywhere — available on major streaming platforms"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          minHeight: 'clamp(220px, 38vh, 420px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '0 clamp(16px, 4vw, 32px)',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
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
              fontSize: 'clamp(1.6rem, 6vw, 4.5rem)',
              fontWeight: 300,
              letterSpacing: '-0.03em',
              color: '#f0f0f0',
              lineHeight: 1,
            }}
          >
            {LETTERS.map((letter, index) => (
              <Fragment key={`${letter}-${index}`}>
                <Letter letter={letter} letterBlur={letterBlur} letterOpacity={letterOpacity} />

                {index < everywherePlatforms.length && !carouselActive && (
                  <IconSlot
                    index={index}
                    iconWidth={iconWidth}
                    iconOpacity={iconOpacity}
                    iconScale={iconScale}
                    tapeGap={tapeGap}
                    textOpacity={textOpacity}
                  />
                )}
              </Fragment>
            ))}
          </motion.div>

          {/* Carousel overlay - appears after text fades */}
          <IconCarousel isActive={carouselActive} />
        </div>
      </div>
    </div>
  )
}
