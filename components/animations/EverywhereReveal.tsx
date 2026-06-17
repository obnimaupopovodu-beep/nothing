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
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'

// ========== КОНФИГУРАЦИЯ АНИМАЦИИ ==========
const ANIMATION_CONFIG = {
  // Фазы скролла (в долях от 0 до 1, где 1 = полный скролл)
  PHASES: {
    TITLE_FADE_OUT: 0.32, // Заголовок "Your audience is" исчезает
    EVERYWHERE_START: 0.12, // "everywhere" начинает расходиться
    EVERYWHERE_END: 0.32, // "everywhere" полностью исчезает
    ICONS_START: 0.22, // Иконки начинают вылетать (раньше, чтобы успеть)
    BODY_START: 0.32, // Тело текста начинает появляться
    BODY_END: 0.42, // Тело текста полностью видно
    COUNTER_START: 0.46, // Счётчик активируется
    COUNTER_END: 1.50, // Счётчик завершает подсчёт (может быть >1 для затягивания)
  },
  // Параллакс
  PARALLAX: {
    BASE_DIVISOR: 40, // Базовое значение для деления смещения мыши
    VARIATION_RANGE: 20, // На сколько меняется divisor в зависимости от удалённости
    MAX_ORBIT_DIST: 52, // Максимальное расстояние от центра (в %)
  },
  // Иконки
  ICON_SIZES: {
    RING_0: 40,
    RING_1: 40,
    RING_2: 30,
  },
  INNER_SIZES: {
    RING_0: 27,
    RING_1: 24,
    RING_2: 20,
  },
  // Счётчик
  COUNTER_TARGET: 150, // Количество платформ, до которого считаем
  // Орбиты (базовый набор, будет дополнен при необходимости)
  BASE_ORBITS: [
    { cx: -22, cy: -8, delay: 0.00, ring: 0, cpBias: 0.12 },
    { cx: -14, cy: 9, delay: 0.04, ring: 0, cpBias: -0.08 },
    { cx: 0, cy: 14, delay: 0.06, ring: 0, cpBias: 0.10 },
    { cx: 14, cy: 9, delay: 0.04, ring: 0, cpBias: -0.10 },
    { cx: 22, cy: -8, delay: 0.00, ring: 0, cpBias: 0.08 },
    { cx: -34, cy: -16, delay: 0.10, ring: 1, cpBias: 0.15 },
    { cx: -26, cy: 18, delay: 0.13, ring: 1, cpBias: -0.12 },
    { cx: -10, cy: 26, delay: 0.16, ring: 1, cpBias: 0.18 },
    { cx: 10, cy: 26, delay: 0.16, ring: 1, cpBias: -0.18 },
    { cx: 26, cy: 18, delay: 0.13, ring: 1, cpBias: 0.12 },
    { cx: 34, cy: -16, delay: 0.10, ring: 1, cpBias: -0.15 },
    { cx: 0, cy: -22, delay: 0.08, ring: 1, cpBias: 0.10 },
    { cx: -42, cy: -4, delay: 0.18, ring: 2, cpBias: 0.20 },
    { cx: -36, cy: 28, delay: 0.20, ring: 2, cpBias: -0.14 },
    { cx: -8, cy: 34, delay: 0.22, ring: 2, cpBias: 0.16 },
    { cx: 8, cy: 34, delay: 0.22, ring: 2, cpBias: -0.16 },
    { cx: 36, cy: 28, delay: 0.20, ring: 2, cpBias: 0.14 },
    { cx: 42, cy: -4, delay: 0.18, ring: 2, cpBias: -0.20 },
    { cx: 20, cy: -28, delay: 0.16, ring: 2, cpBias: 0.18 },
    { cx: -20, cy: -28, delay: 0.16, ring: 2, cpBias: -0.18 },
    { cx: 48, cy: 10, delay: 0.24, ring: 2, cpBias: 0.10 },
    { cx: -48, cy: 10, delay: 0.24, ring: 2, cpBias: -0.10 },
    { cx: 0, cy: -32, delay: 0.14, ring: 2, cpBias: 0.12 },
    { cx: 30, cy: -20, delay: 0.17, ring: 2, cpBias: -0.12 },
    { cx: -30, cy: -20, delay: 0.17, ring: 2, cpBias: 0.22 },
    { cx: 44, cy: 24, delay: 0.21, ring: 2, cpBias: -0.22 },
  ],
} as const

// Типы
type RingLevel = 0 | 1 | 2
interface OrbitConfig {
  cx: number
  cy: number
  delay: number
  ring: RingLevel
  cpBias: number
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function lerp(p: number, a: number, b: number, from: number, to: number): number {
  if (p <= a) return from
  if (p >= b) return to
  return from + ((p - a) / (b - a)) * (to - from)
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

function getParallaxDivisor(cx: number, cy: number): number {
  const dist = Math.sqrt(cx * cx + cy * cy)
  const { BASE_DIVISOR, VARIATION_RANGE, MAX_ORBIT_DIST } = ANIMATION_CONFIG.PARALLAX
  return BASE_DIVISOR - (dist / MAX_ORBIT_DIST) * VARIATION_RANGE
}

function makePath(cx: number, cy: number, cpBias: number, vw: number, vh: number): string {
  const ox = (cx / 100) * vw
  const oy = (cy / 100) * vh
  const cpx = ox * (0.45 + cpBias)
  const cpy = oy * (0.45 - cpBias * 0.5)
  return `M 0 0 Q ${cpx} ${cpy} ${ox} ${oy}`
}

// Генерация дополнительных орбит, если платформ больше, чем базовых
function generateOrbits(count: number): OrbitConfig[] {
  const base = [...ANIMATION_CONFIG.BASE_ORBITS]
  if (count <= base.length) return base.slice(0, count)

  // Дополнительные орбиты: равномерно распределяем по кольцам (в основном внешнее кольцо)
  const extraCount = count - base.length
  const newOrbits: OrbitConfig[] = []
  for (let i = 0; i < extraCount; i++) {
    const angle = (i / extraCount) * 2 * Math.PI
    const radius = 50 + Math.random() * 10 // от 50 до 60% от центра
    const cx = Math.cos(angle) * radius
    const cy = Math.sin(angle) * radius * 0.6 // чуть сжатие по вертикали
    const delay = 0.18 + (i / extraCount) * 0.12
    const ring: RingLevel = 2 // все внешние
    const cpBias = (Math.random() - 0.5) * 0.2
    newOrbits.push({ cx, cy, delay, ring, cpBias })
  }
  return [...base, ...newOrbits]
}

// ========== КОМПОНЕНТ ОДНОЙ ПЛАТФОРМЫ ==========
interface PlatformNodeProps {
  platform: typeof platforms[0]
  orbit: OrbitConfig
  scrollP: MotionValue<number>
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  index: number
  vw: number
  vh: number
}

function PlatformNode({
  platform,
  orbit,
  scrollP,
  mouseX,
  mouseY,
  vw,
  vh,
}: PlatformNodeProps) {
  const { PHASES, ICON_SIZES, INNER_SIZES } = ANIMATION_CONFIG
  const ICONS_SPAN = PHASES.BODY_END - PHASES.ICONS_START
  const activateAt = PHASES.ICONS_START + orbit.delay * ICONS_SPAN * 0.6
  const fullyAt = activateAt + 0.46

  // Opacity: появление и лёгкое затухание в конце
  const opacity = useTransform(scrollP, (p) => {
    const fadeIn = lerp(p, activateAt, fullyAt, 0, 1)
    const fadeP4 = lerp(p, PHASES.COUNTER_START, PHASES.COUNTER_END, 1, 0.7)
    return clamp01(fadeIn) * (p > PHASES.COUNTER_START ? fadeP4 : 1)
  })

  // Позиция на орбите (в px)
  const ox = (orbit.cx / 100) * vw
  const oy = (orbit.cy / 100) * vh

  // Анимация вылета (ease-out)
  const scrollX = useTransform(scrollP, (p) => {
    const t = clamp01(lerp(p, activateAt, fullyAt + 0.02, 0, 1))
    return (1 - Math.pow(1 - t, 5)) * ox
  })
  const scrollY = useTransform(scrollP, (p) => {
    const t = clamp01(lerp(p, activateAt, fullyAt + 0.02, 0, 1))
    return (1 - Math.pow(1 - t, 5)) * oy
  })

  const divisor = getParallaxDivisor(orbit.cx, orbit.cy)

  // Итоговые координаты с учётом параллакса мыши
  const x = useTransform(
  [scrollX, mouseX],
  (values) => values[0] + values[1] / divisor
)
const y = useTransform(
  [scrollY, mouseY],
  (values) => values[0] + values[1] / divisor
)

  // Масштаб и размытие при появлении
  const scale = useTransform(scrollP, (p) => lerp(p, activateAt, fullyAt, 0.4, 1))
  const blur = useTransform(scrollP, (p) => lerp(p, activateAt, fullyAt, 6, 0))
  const filter = useMotionTemplate`blur(${blur}px)`

  // Линия траектории (пунктир)
  const lineOpacity = useTransform(scrollP, (p) => {
    const fadeIn = lerp(p, activateAt - 0.04, activateAt + 0.02, 0, 0.35)
    const fadeOut = lerp(p, PHASES.COUNTER_START, PHASES.COUNTER_END, 0.35, 0)
    return p > PHASES.COUNTER_START ? fadeOut : clamp01(fadeIn)
  })

  const path = makePath(orbit.cx, orbit.cy, orbit.cpBias, vw, vh)
  const iconSize = orbit.ring === 0 ? ICON_SIZES.RING_0 : orbit.ring === 1 ? ICON_SIZES.RING_1 : ICON_SIZES.RING_2
  const innerSize = orbit.ring === 0 ? INNER_SIZES.RING_0 : orbit.ring === 1 ? INNER_SIZES.RING_1 : INNER_SIZES.RING_2

  return (
    <>
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
            background: `${platform.squareBg}22`,
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

// ========== КОМПОНЕНТ ПУЛЬСИРУЮЩЕГО КОЛЬЦА ==========
function PulseRing({ scrollP, delay }: { scrollP: MotionValue<number>; delay: number }) {
  const { PHASES } = ANIMATION_CONFIG
  const opacity = useTransform(scrollP, (p) => {
    const t = lerp(p, PHASES.EVERYWHERE_START + delay, PHASES.EVERYWHERE_END, 0, 1)
    if (t < 0.3) return (t / 0.3) * 0.5
    if (t < 0.7) return 0.5
    return ((1 - (t - 0.7) / 0.3)) * 0.5
  })
  const scale = useTransform(scrollP, (p) => 1 + lerp(p, PHASES.EVERYWHERE_START + delay, PHASES.EVERYWHERE_END + 0.1, 0, 2.8))
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

// ========== КОМПОНЕНТ СЧЁТЧИКА ==========
function CounterDisplay({ scrollP }: { scrollP: MotionValue<number> }) {
  const { PHASES, COUNTER_TARGET } = ANIMATION_CONFIG
  const [count, setCount] = useState(0)
  const opacity = useTransform(scrollP, (p) =>
    lerp(p, PHASES.COUNTER_START + 0.05, PHASES.COUNTER_START + 0.18, 0, 1)
  )

  useEffect(() => {
    const unsubscribe = scrollP.on('change', (p) => {
      const t = clamp01(lerp(p, PHASES.COUNTER_START, PHASES.COUNTER_END, 0, 1))
      setCount(Math.round(t * COUNTER_TARGET))
    })
    return unsubscribe
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
      <div
        style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          fontWeight: 200,
          letterSpacing: '-0.04em',
          color: '#f0f0f0',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {count}
        <span style={{ fontSize: '0.5em', opacity: 0.5, marginLeft: '0.1em' }}>+</span>
      </div>
      <div
        style={{
          fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)',
          fontWeight: 400,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.30)',
          marginTop: '8px',
        }}
      >
        platforms worldwide
      </div>
    </motion.div>
  )
}

// ========== ОСНОВНОЙ КОМПОНЕНТ ==========
export function EverywhereReveal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const [vw, setVw] = useState(1280)
  const [vh, setVh] = useState(800)

  // Адаптивный масштаб для орбит
  const scaleFactor = Math.min(1, vw / 1024)

  useEffect(() => {
    const updateSize = () => {
      setVw(window.innerWidth)
      setVh(window.innerHeight)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Параллакс мыши и касания
  const rawMouseX = useMotionValue(0)
  const rawMouseY = useMotionValue(0)
  const mouseX = useSpring(rawMouseX, { stiffness: 60, damping: 20, mass: 0.5 })
  const mouseY = useSpring(rawMouseY, { stiffness: 60, damping: 20, mass: 0.5 })

  const onPointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number
      if ('touches' in e) {
        const touch = e.touches[0]
        if (!touch) return
        clientX = touch.clientX
        clientY = touch.clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }
      rawMouseX.set(clientX - window.innerWidth / 2)
      rawMouseY.set(clientY - window.innerHeight / 2)
    },
    [rawMouseX, rawMouseY]
  )

  useEffect(() => {
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('touchmove', onPointerMove)
    }
  }, [onPointerMove])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // --- Вычисление анимаций текста ---
  const { PHASES } = ANIMATION_CONFIG
  const maxSpacingNum = 0.55
  const letterSpacingNum = useTransform(
    scrollYProgress,
    (p) => -0.03 + lerp(p, 0.0, PHASES.TITLE_FADE_OUT, 0, 1) * (maxSpacingNum + 0.03)
  )
  const letterSpacingEm = useMotionTemplate`${letterSpacingNum}em`

  const wordFinalOpacity = useTransform(scrollYProgress, (p) =>
    clamp01(lerp(p, PHASES.EVERYWHERE_START, PHASES.EVERYWHERE_END, 1, 0))
  )

  const eyebrowOpacity = useTransform(scrollYProgress, (p) =>
    clamp01(lerp(p, PHASES.EVERYWHERE_START, PHASES.EVERYWHERE_END, 1, 0))
  )

  const glowOpacity = useTransform(scrollYProgress, (p) =>
    clamp01(lerp(p, PHASES.EVERYWHERE_START, PHASES.EVERYWHERE_END, 0, 1)) *
    clamp01(lerp(p, PHASES.BODY_START, PHASES.BODY_END, 1, 0))
  )

  const bodyOpacity = useTransform(scrollYProgress, (p) => {
    const fadeIn = clamp01(lerp(p, PHASES.BODY_END, PHASES.COUNTER_START + 0.08, 0, 1))
    const fadeOut = clamp01(lerp(p, PHASES.COUNTER_END - 0.06, PHASES.COUNTER_END, 1, 0))
    return Math.min(fadeIn, fadeOut)
  })

  const bodyY = useTransform(scrollYProgress, (p) => {
    const progress = clamp01(lerp(p, PHASES.BODY_END, PHASES.COUNTER_START + 0.08, 0, 1))
    return `${(1 - progress) * 20}px`
  })

  // --- Подготовка данных платформ ---
  const visiblePlatforms = useMemo(() => {
    return platforms.slice(0, Math.min(platforms.length, 100)) // ограничим разумным числом
  }, [])

  // Генерация орбит с учётом количества платформ
  const orbits = useMemo(() => {
    const generated = generateOrbits(visiblePlatforms.length)
    // Применяем адаптивный масштаб к координатам
    return generated.map((orbit) => ({
      ...orbit,
      cx: orbit.cx * scaleFactor,
      cy: orbit.cy * scaleFactor,
    }))
  }, [visiblePlatforms.length, scaleFactor])

  // Кешируем узлы платформ
  const platformNodes = useMemo(() => {
    return visiblePlatforms.map((platform, i) => (
      <PlatformNode
        key={platform.name}
        platform={platform}
        orbit={orbits[i] || orbits[0]} // fallback
        scrollP={scrollYProgress}
        index={i}
        mouseX={mouseX}
        mouseY={mouseY}
        vw={vw}
        vh={vh}
      />
    ))
  }, [visiblePlatforms, orbits, scrollYProgress, mouseX, mouseY, vw, vh])

  // --- fallback для reduced motion ---
  if (reducedMotion) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
          gap: 24,
        }}
      >
        <span
          style={{
            fontSize: 'clamp(0.6rem,0.9vw,0.75rem)',
            fontWeight: 500,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.30)',
          }}
        >
          Distribution
        </span>
        <span
          style={{
            fontSize: 'clamp(1.4rem,3.8vw,3.2rem)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '-0.02em',
          }}
        >
          Your audience is
        </span>
        <span
          style={{
            fontSize: 'clamp(2rem,7vw,6rem)',
            fontWeight: 300,
            color: '#f0f0f0',
            letterSpacing: '0.1em',
          }}
        >
          everywhere
        </span>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
            maxWidth: '44ch',
          }}
        >
          We distribute to all major platforms simultaneously — day-and-date worldwide.
        </p>
      </div>
    )
  }

  // --- Основной рендер ---
  return (
    <div ref={containerRef} style={{ height: '140vh', position: 'relative' }}>
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
        {/* Glow-эффект */}
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

        {/* Пульсирующие кольца */}
        <PulseRing scrollP={scrollYProgress} delay={0} />
        <PulseRing scrollP={scrollYProgress} delay={0.06} />
        <PulseRing scrollP={scrollYProgress} delay={0.12} />

        {/* Все иконки платформ */}
        {platformNodes}

        {/* Текстовый контент */}
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'clamp(6px, 0.8vw, 12px)',
            }}
          >
            <motion.span
              style={{
                fontSize: 'clamp(0.6rem, 0.9vw, 0.75rem)',
                fontWeight: 500,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.30)',
                opacity: eyebrowOpacity,
              }}
            >
              Distribution
            </motion.span>
            <motion.span
              style={{
                fontSize: 'clamp(1.4rem, 3.8vw, 3.2rem)',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                opacity: eyebrowOpacity,
              }}
            >
              Your audience is
            </motion.span>
          </div>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
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

            <motion.p
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                translateX: '-50%',
                translateY: '-50%',
                opacity: bodyOpacity,
                y: bodyY,
                fontSize: 'clamp(0.75rem, 2.0vw, 1.5rem)',
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.51)',
                letterSpacing: '0.01em',
                lineHeight: 1.75,
                margin: 0,
                textAlign: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              We distribute to all major platforms simultaneously&nbsp;—{' '}
              <span style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                day-and-date worldwide.
              </span>
            </motion.p>
          </div>
        </div>

        {/* Счётчик */}
        <CounterDisplay scrollP={scrollYProgress} />
      </div>
    </div>
  )
}