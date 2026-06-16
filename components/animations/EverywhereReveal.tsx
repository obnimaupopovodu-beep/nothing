'use client'

import { platforms } from '@/components/data/platforms'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  MotionValue,
} from 'framer-motion'
import { useEffect, useRef, useState, useMemo } from 'react'

// ─── scroll timeline ───────────────────────────────────────────────────────
const T = {
  // Phase 1 – typography hero
  P1_END:     0.12,
  // Phase 2 – signal emerges from word
  P2_START:   0.12,
  P2_END:     0.38,
  // Phase 3 – broadcast expansion
  P3_START:   0.38,
  P3_END:     0.72,
  // Phase 4 – resolution
  P4_START:   0.72,
  P4_END:     0.92,
} as const

function lerp(p: number, a: number, b: number, from: number, to: number) {
  if (p <= a) return from
  if (p >= b) return to
  return from + ((p - a) / (b - a)) * (to - from)
}

function clamp01(v: number) { return Math.max(0, Math.min(1, v) ) }

// ─── orbital layout ────────────────────────────────────────────────────────
// Art-directed positions: platforms radiate in controlled arcs
// (cx, cy) = offset from center in vw/vh units; delay = stagger
const ORBIT: { cx: number; cy: number; delay: number; ring: number }[] = [
  // ring 0 – inner halo, 5 platforms
  { cx: -22, cy: -8,  delay: 0.00, ring: 0 },
  { cx: -14, cy:  9,  delay: 0.04, ring: 0 },
  { cx:   0, cy: 14,  delay: 0.06, ring: 0 },
  { cx:  14, cy:  9,  delay: 0.04, ring: 0 },
  { cx:  22, cy: -8,  delay: 0.00, ring: 0 },
  // ring 1 – outer arc, 7 platforms
  { cx: -34, cy: -16, delay: 0.10, ring: 1 },
  { cx: -26, cy:  18, delay: 0.13, ring: 1 },
  { cx: -10, cy:  26, delay: 0.16, ring: 1 },
  { cx:   10, cy: 26, delay: 0.16, ring: 1 },
  { cx:  26, cy:  18, delay: 0.13, ring: 1 },
  { cx:  34, cy: -16, delay: 0.10, ring: 1 },
  { cx:   0, cy: -22, delay: 0.08, ring: 1 },
  // ring 2 – far scatter, remaining
  { cx: -42, cy:  -4, delay: 0.18, ring: 2 },
  { cx: -36, cy:  28, delay: 0.20, ring: 2 },
  { cx:  -8, cy:  34, delay: 0.22, ring: 2 },
  { cx:   8, cy:  34, delay: 0.22, ring: 2 },
  { cx:  36, cy:  28, delay: 0.20, ring: 2 },
  { cx:  42, cy:  -4, delay: 0.18, ring: 2 },
  { cx:  20, cy: -28, delay: 0.16, ring: 2 },
  { cx: -20, cy: -28, delay: 0.16, ring: 2 },
  { cx:  48, cy:  10, delay: 0.24, ring: 2 },
  { cx: -48, cy:  10, delay: 0.24, ring: 2 },
  { cx:   0, cy: -32, delay: 0.14, ring: 2 },
  { cx:  30, cy: -20, delay: 0.17, ring: 2 },
  { cx: -30, cy: -20, delay: 0.17, ring: 2 },
  { cx:  44, cy:  24, delay: 0.21, ring: 2 },
]

// ─── SVG signal paths ──────────────────────────────────────────────────────
// Each platform gets a bezier path from center to its orbital position
function makePath(cx: number, cy: number, vw: number, vh: number) {
  const ox = (cx / 100) * vw
  const oy = (cy / 100) * vh
  // control point bends the path slightly for organic feel
  const cpx = ox * 0.45 + (Math.random() - 0.5) * 40
  const cpy = oy * 0.45 + (Math.random() - 0.5) * 40
  return `M 0 0 Q ${cpx} ${cpy} ${ox} ${oy}`
}

// ─── PlatformNode ──────────────────────────────────────────────────────────
function PlatformNode({
  platform, orbit, scrollP, index, vw, vh,
}: {
  platform: typeof platforms[0]
  orbit: typeof ORBIT[0]
  scrollP: MotionValue<number>
  index: number
  vw: number
  vh: number
}) {
  // Each platform activates at a staggered point in P3
  const P3_SPAN = T.P3_END - T.P3_START
  const activateAt = T.P3_START + orbit.delay * P3_SPAN * 0.8
  const fullyAt    = activateAt + 0.06

  const opacity = useTransform(scrollP, (p) => {
    const fadeIn  = lerp(p, activateAt, fullyAt, 0, 1)
    // Phase 4: converge – platform fades slightly but stays
    const fadeP4  = lerp(p, T.P4_START, T.P4_END, 1, 0.7)
    return clamp01(fadeIn) * (p > T.P4_START ? fadeP4 : 1)
  })

  // Position: starts at (0,0) near the word, moves to orbital position
  const ox = (orbit.cx / 100) * vw
  const oy = (orbit.cy / 100) * vh

  const x = useTransform(scrollP, (p) => {
    const t = clamp01(lerp(p, activateAt, fullyAt + 0.02, 0, 1))
    // easeOutQuint
    const e = 1 - Math.pow(1 - t, 5)
    return e * ox
  })
  const y = useTransform(scrollP, (p) => {
    const t = clamp01(lerp(p, activateAt, fullyAt + 0.02, 0, 1))
    const e = 1 - Math.pow(1 - t, 5)
    return e * oy
  })

  const scale = useTransform(scrollP, (p) =>
    lerp(p, activateAt, fullyAt, 0.4, 1)
  )

  const blur = useTransform(scrollP, (p) =>
    lerp(p, activateAt, fullyAt, 6, 0)
  )
  const filter = useMotionTemplate`blur(${blur}px)`

  // Signal line opacity: appears just before the node
  const lineOpacity = useTransform(scrollP, (p) => {
    const fadeIn = lerp(p, activateAt - 0.04, activateAt + 0.02, 0, 0.35)
    const fadeOut = lerp(p, T.P4_START, T.P4_END, 0.35, 0)
    return p > T.P4_START ? fadeOut : clamp01(fadeIn)
  })

  const path = useMemo(() => makePath(orbit.cx, orbit.cy, vw, vh), [orbit.cx, orbit.cy, vw, vh])

  const iconSize = orbit.ring === 0 ? 28 : orbit.ring === 1 ? 24 : 20
  const innerSize = orbit.ring === 0 ? 14 : orbit.ring === 1 ? 12 : 10

  return (
    <>
      {/* signal path line */}
      <svg
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        width="0"
        height="0"
        aria-hidden
      >
        <motion.path
          d={path}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="0.5"
          fill="none"
          strokeDasharray="3 6"
          style={{ opacity: lineOpacity }}
        />
      </svg>

      {/* platform icon node */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          x,
          y,
          opacity,
          scale,
          filter,
          translateX: '-50%',
          translateY: '-50%',
          zIndex: 3,
        }}
      >
        <motion.a
          href={platform.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={platform.name}
          title={platform.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: iconSize,
            height: iconSize,
            borderRadius: Math.round(iconSize * 0.24),
            background: `${platform.squareBg}22`, // subtle tinted bg
            border: '1px solid rgba(255,255,255,0.10)',
            flexShrink: 0,
            textDecoration: 'none',
            backdropFilter: 'blur(4px)',
            transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease',
            cursor: 'pointer',
          }}
          whileHover={{
            background: `${platform.squareBg}55`,
            borderColor: `${platform.squareBg}88`,
            scale: 1.18,
          }}
        >
          <PlatformIcon platform={platform} size={innerSize} color="rgba(255,255,255,0.85)" />
        </motion.a>
      </motion.div>
    </>
  )
}

// ─── PulseRing ─────────────────────────────────────────────────────────────
// Expanding ring emanating from the word during Phase 2
function PulseRing({ scrollP, delay }: { scrollP: MotionValue<number>; delay: number }) {
  const opacity = useTransform(scrollP, (p) => {
    const t = lerp(p, T.P2_START + delay, T.P2_END, 0, 1)
    // ring pulses: rises and fades
    if (t < 0.3) return t / 0.3 * 0.5
    if (t < 0.7) return 0.5
    return (1 - (t - 0.7) / 0.3) * 0.5
  })
  const scale = useTransform(scrollP, (p) =>
    1 + lerp(p, T.P2_START + delay, T.P2_END + 0.1, 0, 2.8)
  )

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        translateX: '-50%',
        translateY: '-50%',
        width: '38vw',
        height: '10vw',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.18)',
        opacity,
        scale,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

// ─── CounterDisplay ────────────────────────────────────────────────────────
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
    <motion.div
      style={{
        position: 'absolute',
        bottom: 'clamp(60px, 8vh, 100px)',
        left: '50%',
        translateX: '-50%',
        opacity,
        zIndex: 5,
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
        fontWeight: 200,
        letterSpacing: '-0.04em',
        color: '#f0f0f0',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {count}<span style={{ fontSize: '0.5em', opacity: 0.5, marginLeft: '0.1em' }}>+</span>
      </div>
      <div style={{
        fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)',
        fontWeight: 400,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.30)',
        marginTop: '8px',
      }}>
        platforms worldwide
      </div>
    </motion.div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────
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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // typography motion
  const [maxSpacing] = useState('0.55em')
  const maxSpacingNum = parseFloat(maxSpacing)
  const letterSpacingEm = useMotionTemplate`${useTransform(
    scrollYProgress,
    (p) => ((-0.03 + lerp(p, 0.0, T.P1_END, 0, 1) * (maxSpacingNum + 0.03)).toFixed(4))
  )}em`

  // Phase 2: word starts to pulse/dim as signal takes over
  const wordOpacity = useTransform(scrollYProgress,
    (p) => lerp(p, T.P2_START, T.P3_START, 1, 0.18)
  )
  const eyebrowOpacity = useTransform(scrollYProgress,
    (p) => lerp(p, T.P2_START, T.P2_END, 1, 0)
  )

  // "We distribute" text
  const bodyOpacity = useTransform(scrollYProgress,
    (p) => clamp01(lerp(p, T.P3_END, T.P4_START, 0, 1))
  )

  // Phase 4: word fades fully
  const wordFinalOpacity = useTransform(scrollYProgress, (p) => {
    const base = lerp(p, T.P2_START, T.P3_START, 1, 0.18)
    const final = lerp(p, T.P4_START, T.P4_END, 0.18, 0)
    return p > T.P4_START ? final : base
  })

  // Glow halo around word in P2
  const glowOpacity = useTransform(scrollYProgress,
    (p) => clamp01(lerp(p, T.P2_START, T.P2_END, 0, 1)) *
           clamp01(lerp(p, T.P3_START, T.P3_END, 1, 0))
  )

  if (reducedMotion) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', background: '#050505', gap: 24 }}>
        <span style={{ fontSize: 'clamp(0.6rem,0.9vw,0.75rem)', fontWeight: 500,
          letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>
          Distribution
        </span>
        <span style={{ fontSize: 'clamp(1.4rem,3.8vw,3.2rem)', fontWeight: 300,
          color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.02em' }}>
          Your audience is
        </span>
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
    <div ref={containerRef} style={{ height: '320vh', position: 'relative' }}>
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
        {/* ── glow halo ── */}
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            translateX: '-50%',
            translateY: '-50%',
            width: 'clamp(200px, 40vw, 600px)',
            height: 'clamp(60px, 12vw, 160px)',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)',
            opacity: glowOpacity,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* ── pulse rings (Phase 2) ── */}
        <PulseRing scrollP={scrollYProgress} delay={0} />
        <PulseRing scrollP={scrollYProgress} delay={0.06} />
        <PulseRing scrollP={scrollYProgress} delay={0.12} />

        {/* ── platform nodes + signal lines (Phase 3) ── */}
        {visiblePlatforms.map((platform, i) => (
          <PlatformNode
            key={platform.name}
            platform={platform}
            orbit={ORBIT[i]}
            scrollP={scrollYProgress}
            index={i}
            vw={vw}
            vh={vh}
          />
        ))}

        {/* ── typography ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'clamp(8px, 1.2vw, 18px)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {/* eyebrow + subtitle */}
          <motion.div
            style={{
              opacity: eyebrowOpacity,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'clamp(6px, 0.8vw, 12px)',
            }}
          >
            <span style={{
              fontSize: 'clamp(0.6rem, 0.9vw, 0.75rem)',
              fontWeight: 500,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.30)',
            }}>Distribution</span>
            <span style={{
              fontSize: 'clamp(1.4rem, 3.8vw, 3.2rem)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>Your audience is</span>
          </motion.div>

          {/* hero word */}
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
              opacity: wordFinalOpacity,
            }}
          >
            everywhere
          </motion.span>
        </div>

        {/* ── body copy (Phase 3 → 4) ── */}
        <motion.p
          style={{
            position: 'absolute',
            bottom: 'clamp(100px, 14vh, 160px)',
            left: '50%',
            translateX: '-50%',
            opacity: bodyOpacity,
            zIndex: 4,
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
            whiteSpace: 'nowrap',
          }}
        >
          We distribute to all major platforms simultaneously —{' '}
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>day-and-date worldwide.</span>
        </motion.p>

        {/* ── counter (Phase 4) ── */}
        <CounterDisplay scrollP={scrollYProgress} />
      </div>
    </div>
  )
}
