'use client'

import { platforms } from '@/components/data/platforms'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  MotionValue,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// const T = {
//   P1_END:      0.30,
//   P2_START:    0.12,
//   P2_END:      0.30,
//   ICONS_START: 0.28,
//   P3_START:    0.28,
//   P3_END:      0.35,
//   P4_START:    0.40,
//   P4_END:      1.50,
// } as const

const T = {
  P1_END:      0.32,   // заголовок уходит чуть позже
  P2_START:    0.12,
  P2_END:      0.32,   // "everywhere" задерживается дольше
  ICONS_START: 0.22,   // иконки начинают раньше, чтобы успеть до P2_END
  P3_START:    0.32,
  P3_END:      0.42,   // плавный переход к body text (было 0.35 — слишком резко)
  P4_START:    0.46,   // небольшая пауза перед counter
  P4_END:      1.50,   // counter считает не торопясь (было 1.50 — это почти весь скролл)
} as const

function lerp(p: number, a: number, b: number, from: number, to: number) {
  if (p <= a) return from
  if (p >= b) return to
  return from + ((p - a) / (b - a)) * (to - from)
}
function clamp01(v: number) { return Math.max(0, Math.min(1, v)) }

const ORBIT: { cx: number; cy: number; delay: number; ring: number; cpBias: number }[] = [
  { cx: -22, cy:  -8, delay: 0.00, ring: 0, cpBias:  0.12 },
  { cx: -14, cy:   9, delay: 0.04, ring: 0, cpBias: -0.08 },
  { cx:   0, cy:  14, delay: 0.06, ring: 0, cpBias:  0.10 },
  { cx:  14, cy:   9, delay: 0.04, ring: 0, cpBias: -0.10 },
  { cx:  22, cy:  -8, delay: 0.00, ring: 0, cpBias:  0.08 },
  { cx: -34, cy: -16, delay: 0.10, ring: 1, cpBias:  0.15 },
  { cx: -26, cy:  18, delay: 0.13, ring: 1, cpBias: -0.12 },
  { cx: -10, cy:  26, delay: 0.16, ring: 1, cpBias:  0.18 },
  { cx:  10, cy:  26, delay: 0.16, ring: 1, cpBias: -0.18 },
  { cx:  26, cy:  18, delay: 0.13, ring: 1, cpBias:  0.12 },
  { cx:  34, cy: -16, delay: 0.10, ring: 1, cpBias: -0.15 },
  { cx:   0, cy: -22, delay: 0.08, ring: 1, cpBias:  0.10 },
  { cx: -42, cy:  -4, delay: 0.18, ring: 2, cpBias:  0.20 },
  { cx: -36, cy:  28, delay: 0.20, ring: 2, cpBias: -0.14 },
  { cx:  -8, cy:  34, delay: 0.22, ring: 2, cpBias:  0.16 },
  { cx:   8, cy:  34, delay: 0.22, ring: 2, cpBias: -0.16 },
  { cx:  36, cy:  28, delay: 0.20, ring: 2, cpBias:  0.14 },
  { cx:  42, cy:  -4, delay: 0.18, ring: 2, cpBias: -0.20 },
  { cx:  20, cy: -28, delay: 0.16, ring: 2, cpBias:  0.18 },
  { cx: -20, cy: -28, delay: 0.16, ring: 2, cpBias: -0.18 },
  { cx:  48, cy:  10, delay: 0.24, ring: 2, cpBias:  0.10 },
  { cx: -48, cy:  10, delay: 0.24, ring: 2, cpBias: -0.10 },
  { cx:   0, cy: -32, delay: 0.14, ring: 2, cpBias:  0.12 },
  { cx:  30, cy: -20, delay: 0.17, ring: 2, cpBias: -0.12 },
  { cx: -30, cy: -20, delay: 0.17, ring: 2, cpBias:  0.22 },
  { cx:  44, cy:  24, delay: 0.21, ring: 2, cpBias: -0.22 },
]

const MAX_ORBIT_DIST = 52

function getParallaxDivisor(cx: number, cy: number): number {
  const dist = Math.sqrt(cx * cx + cy * cy)
  return 40 - (dist / MAX_ORBIT_DIST) * 20
}

function makePath(cx: number, cy: number, cpBias: number, vw: number, vh: number) {
  const ox = (cx / 100) * vw
  const oy = (cy / 100) * vh
  const cpx = ox * (0.45 + cpBias)
  const cpy = oy * (0.45 - cpBias * 0.5)
  return `M 0 0 Q ${cpx} ${cpy} ${ox} ${oy}`
}

function PlatformNode({
  platform, orbit, scrollP, mouseX, mouseY, vw, vh,
}: {
  platform: typeof platforms[0]
  orbit: typeof ORBIT[0]
  scrollP: MotionValue<number>
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  index: number
  vw: number
  vh: number
}) {
  const ICONS_SPAN = T.P3_END - T.ICONS_START
  const activateAt = T.ICONS_START + orbit.delay * ICONS_SPAN * 0.6
  const fullyAt    = activateAt + 0.06

  const opacity = useTransform(scrollP, (p) => {
    const fadeIn = lerp(p, activateAt, fullyAt, 0, 1)
    const fadeP4 = lerp(p, T.P4_START, T.P4_END, 1, 0.7)
    return clamp01(fadeIn) * (p > T.P4_START ? fadeP4 : 1)
  })

  const ox = (orbit.cx / 100) * vw
  const oy = (orbit.cy / 100) * vh

  const scrollX = useTransform(scrollP, (p) => {
    const t = clamp01(lerp(p, activateAt, fullyAt + 0.02, 0, 1))
    return (1 - Math.pow(1 - t, 5)) * ox
  })
  const scrollY = useTransform(scrollP, (p) => {
    const t = clamp01(lerp(p, activateAt, fullyAt + 0.02, 0, 1))
    return (1 - Math.pow(1 - t, 5)) * oy
  })

  const divisor = getParallaxDivisor(orbit.cx, orbit.cy)

  const x = useTransform(
    [scrollX, mouseX] as MotionValue[],
    ([sx, mx]: number[]) => sx + mx / divisor
  )
  const y = useTransform(
    [scrollY, mouseY] as MotionValue[],
    ([sy, my]: number[]) => sy + my / divisor
  )

  const scale = useTransform(scrollP, (p) => lerp(p, activateAt, fullyAt, 0.4, 1))
  const blur  = useTransform(scrollP, (p) => lerp(p, activateAt, fullyAt, 6, 0))
  const filter = useMotionTemplate`blur(${blur}px)`

  const lineOpacity = useTransform(scrollP, (p) => {
    const fadeIn  = lerp(p, activateAt - 0.04, activateAt + 0.02, 0, 0.35)
    const fadeOut = lerp(p, T.P4_START, T.P4_END, 0.35, 0)
    return p > T.P4_START ? fadeOut : clamp01(fadeIn)
  })

  const path = makePath(orbit.cx, orbit.cy, orbit.cpBias, vw, vh)
  const iconSize  = orbit.ring === 0 ? 28 : orbit.ring === 1 ? 24 : 20
  const innerSize = orbit.ring === 0 ? 14 : orbit.ring === 1 ? 12 : 10

  return (
    <>
      <svg
        style={{ position: 'absolute', top: '50%', left: '50%', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}
        width="0" height="0" aria-hidden
      >
        <motion.path d={path} stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" fill="none" strokeDasharray="3 6" style={{ opacity: lineOpacity }} />
      </svg>
      <motion.div style={{ position: 'absolute', top: '50%', left: '50%', x, y, opacity, scale, filter, translateX: '-50%', translateY: '-50%', zIndex: 3 }}>
        <motion.a
          href={platform.href} target="_blank" rel="noopener noreferrer"
          aria-label={platform.name} title={platform.name}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: iconSize, height: iconSize, borderRadius: Math.round(iconSize * 0.24),
            background: `${platform.squareBg}22`, border: '1px solid rgba(255,255,255,0.10)',
            flexShrink: 0, textDecoration: 'none', backdropFilter: 'blur(4px)',
            transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease', cursor: 'pointer',
          }}
          whileHover={{ background: `${platform.squareBg}55`, borderColor: `${platform.squareBg}88`, scale: 1.18 }}
        >
          <PlatformIcon platform={platform} size={innerSize} color="rgba(255,255,255,0.85)" />
        </motion.a>
      </motion.div>
    </>
  )
}

function PulseRing({ scrollP, delay }: { scrollP: MotionValue<number>; delay: number }) {
  const opacity = useTransform(scrollP, (p) => {
    const t = lerp(p, T.P2_START + delay, T.P2_END, 0, 1)
    if (t < 0.3) return (t / 0.3) * 0.5
    if (t < 0.7) return 0.5
    return ((1 - (t - 0.7) / 0.3)) * 0.5
  })
  const scale = useTransform(scrollP, (p) =>
    1 + lerp(p, T.P2_START + delay, T.P2_END + 0.1, 0, 2.8)
  )
  return (
    <motion.div aria-hidden style={{
      position: 'absolute', top: '50%', left: '50%',
      translateX: '-50%', translateY: '-50%',
      width: '38vw', height: '10vw', borderRadius: '50%',
      border: '1px solid rgba(255,255,255,0.18)',
      opacity, scale, pointerEvents: 'none', zIndex: 0,
    }} />
  )
}

function CounterDisplay({ scrollP }: { scrollP: MotionValue<number> }) {
  const [count, setCount] = useState(0)
  const opacity = useTransform(scrollP, (p) =>
    lerp(p, T.P4_START + 0.05, T.P4_START + 0.18, 0, 1)
  )
  useEffect(() => {
    return scrollP.on('change', (p) => {
      const t = clamp01(lerp(p, T.P4_START, T.P4_END, 0, 1))
      setCount(Math.round(t * 150))
    })
  }, [scrollP])
  return (
    <motion.div style={{
      position: 'absolute', bottom: 'clamp(60px, 8vh, 100px)',
      left: '50%', translateX: '-50%',
      opacity, zIndex: 5, textAlign: 'center', pointerEvents: 'none',
    }}>
      <div style={{
        fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 200,
        letterSpacing: '-0.04em', color: '#f0f0f0', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {count}<span style={{ fontSize: '0.5em', opacity: 0.5, marginLeft: '0.1em' }}>+</span>
      </div>
      <div style={{
        fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)', fontWeight: 400,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.30)', marginTop: '8px',
      }}>platforms worldwide</div>
    </motion.div>
  )
}

export function EverywhereReveal() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const [vw, setVw] = useState(1280)
  const [vh, setVh] = useState(800)
  useEffect(() => {
    const fn = () => { setVw(window.innerWidth); setVh(window.innerHeight) }
    fn()
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const rawMouseX = useMotionValue(0)
  const rawMouseY = useMotionValue(0)
  const mouseX = useSpring(rawMouseX, { stiffness: 60, damping: 20, mass: 0.5 })
  const mouseY = useSpring(rawMouseY, { stiffness: 60, damping: 20, mass: 0.5 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawMouseX.set(e.clientX - window.innerWidth  / 2)
      rawMouseY.set(e.clientY - window.innerHeight / 2)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [rawMouseX, rawMouseY])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const maxSpacingNum = 0.55
  const letterSpacingNum = useTransform(
    scrollYProgress,
    (p) => -0.03 + lerp(p, 0.0, T.P1_END, 0, 1) * (maxSpacingNum + 0.03)
  )
  const letterSpacingEm = useMotionTemplate`${letterSpacingNum}em`

  // 'everywhere' and eyebrow both fade out over P2_START→P2_END
  const wordFinalOpacity = useTransform(scrollYProgress, (p) =>
    clamp01(lerp(p, T.P2_START, T.P2_END, 1, 0))
  )

  const eyebrowOpacity = useTransform(scrollYProgress, (p) =>
    clamp01(lerp(p, T.P2_START, T.P2_END, 1, 0))
  )

  const glowOpacity = useTransform(scrollYProgress, (p) =>
    clamp01(lerp(p, T.P2_START, T.P2_END, 0, 1)) *
    clamp01(lerp(p, T.P3_START, T.P3_END, 1, 0))
  )

  const bodyOpacity = useTransform(scrollYProgress, (p) => {
    const fadeIn  = clamp01(lerp(p, T.P3_END, T.P4_START + 0.08, 0, 1))
    const fadeOut = clamp01(lerp(p, T.P4_END - 0.06, T.P4_END, 1, 0))
    return Math.min(fadeIn, fadeOut)
  })

  const bodyY = useTransform(scrollYProgress, (p) => {
  const progress = clamp01(lerp(p, T.P3_END, T.P4_START + 0.08, 0, 1))
  return `${(1 - progress) * 20}px`  // снизу 20px → на место
})

  if (reducedMotion) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#050505', gap: 24 }}>
        <span style={{ fontSize: 'clamp(0.6rem,0.9vw,0.75rem)', fontWeight: 500,
          letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>Distribution</span>
        <span style={{ fontSize: 'clamp(1.4rem,3.8vw,3.2rem)', fontWeight: 300,
          color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.02em' }}>Your audience is</span>
        <span style={{ fontSize: 'clamp(2rem,7vw,6rem)', fontWeight: 300,
          color: '#f0f0f0', letterSpacing: '0.1em' }}>everywhere</span>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', maxWidth: '44ch' }}>
          We distribute to all major platforms simultaneously — day-and-date worldwide.
        </p>
      </div>
    )
  }

  const visiblePlatforms = platforms.slice(0, Math.min(platforms.length, ORBIT.length))

  return (
    <div ref={containerRef} style={{ height: '140vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#050505', overflow: 'hidden',
      }}>
        <motion.div aria-hidden style={{
          position: 'absolute', top: '50%', left: '50%',
          translateX: '-50%', translateY: '-50%',
          width: 'clamp(200px, 40vw, 600px)', height: 'clamp(60px, 12vw, 160px)',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)',
          opacity: glowOpacity, pointerEvents: 'none', zIndex: 0,
        }} />

        <PulseRing scrollP={scrollYProgress} delay={0} />
        <PulseRing scrollP={scrollYProgress} delay={0.06} />
        <PulseRing scrollP={scrollYProgress} delay={0.12} />

        {visiblePlatforms.map((platform, i) => (
          <PlatformNode
            key={platform.name} platform={platform} orbit={ORBIT[i]}
            scrollP={scrollYProgress} index={i}
            mouseX={mouseX} mouseY={mouseY}
            vw={vw} vh={vh}
          />
        ))}

        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 'clamp(8px, 1.2vw, 18px)',
          pointerEvents: 'none', userSelect: 'none',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 'clamp(6px, 0.8vw, 12px)',
          }}>
            <motion.span style={{
              fontSize: 'clamp(0.6rem, 0.9vw, 0.75rem)', fontWeight: 500,
              letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)',
              opacity: eyebrowOpacity,
            }}>Distribution</motion.span>
            <motion.span style={{
              fontSize: 'clamp(1.4rem, 3.8vw, 3.2rem)', fontWeight: 300,
              color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.02em', lineHeight: 1.1,
              opacity: eyebrowOpacity,
            }}>Your audience is</motion.span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.span
              aria-label="everywhere"
              style={{
                fontSize: 'clamp(2rem, 7vw, 6rem)', fontWeight: 300,
                letterSpacing: letterSpacingEm,
                color: '#f0f0f0', lineHeight: 1,
                whiteSpace: 'nowrap', display: 'block',
                opacity: wordFinalOpacity,
              }}
            >
              everywhere
            </motion.span>

            <motion.p
              style={{
                position: 'absolute', top: '50%', left: '50%',
                translateX: '-50%', translateY: '-50%',
                opacity: bodyOpacity,
                y: bodyY,
                fontSize: 'clamp(0.75rem, 2.0vw, 1.5rem)', fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.51)', letterSpacing: '0.01em',
                lineHeight: 1.75, margin: 0,
                textAlign: 'center', pointerEvents: 'none',
                userSelect: 'none', whiteSpace: 'nowrap',
              }}
            >
              We distribute to all major platforms simultaneously&nbsp;—{' '}
              <span style={{ color: 'rgba(255, 255, 255, 0.75)' }}>day-and-date worldwide.</span>
            </motion.p>
          </div>
        </div>

        <CounterDisplay scrollP={scrollYProgress} />
      </div>
    </div>
  )
}
