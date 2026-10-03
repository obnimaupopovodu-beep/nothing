'use client'

import { platforms, type Platform } from '@/components/data/platforms'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './EverywhereReveal.css'

const DISTRIBUTION_COUNT = 150
const WORD = 'EVERYWHERE'
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const phase = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}
// Open centre for the message; varied sizes and distances imply spatial reach.
const POSITIONS = [
  [-.35,-.20], [.34,-.22], [-.32,.22], [.33,.23], [-.07,-.34], [.10,.34],
  [-.43,.02], [.43,-.02], [-.23,-.33], [.24,-.34], [-.22,.35], [.25,.35],
  [-.43,-.32], [.43,.32], [-.43,.32], [.43,-.32], [-.34,-.08], [.34,.09],
  [-.14,-.23], [.14,.25], [-.04,.25], [.04,-.24], [-.46,-.16], [.46,.17],
  [-.34,.36], [.34,-.36],
] as const
const MOBILE_POSITIONS = [
  [-.33,-.29], [.33,-.29], [-.32,.29], [.32,.29], [-.10,-.37], [.10,.37],
  [-.40,-.16], [.40,.16], [-.37,-.41], [.37,-.41], [-.36,.41], [.36,.41],
] as const

function DistributionNode({ platform, index, progress, width, height, mobile, mouseX, mouseY }: {
  platform: Platform; index: number; progress: MotionValue<number>; width: number; height: number; mobile: boolean
  mouseX: MotionValue<number>; mouseY: MotionValue<number>
}) {
  const point = mobile ? MOBILE_POSITIONS[index] : POSITIONS[index]
  const prominent = index < 6
  const start = .22 + (index % 6) * .022
  const unfold = useTransform(progress, value => phase(value, start, .67 + (index % 3) * .025))
  const x = useTransform([unfold, mouseX], ([p, mx]: number[]) => p * point[0] * width + mx * (prominent ? 12 : 6))
  const y = useTransform([unfold, mouseY], ([p, my]: number[]) => p * point[1] * height + my * (prominent ? 9 : 4))
  const z = useTransform(unfold, value => (1 - value) * -180 - (prominent ? 0 : 65))
  const scale = useTransform(unfold, value => .35 + value * .65)
  const opacity = useTransform(progress, value => phase(value, start + .04, start + .2) * (prominent ? .85 : .45))
  const filter = useTransform(unfold, value => `blur(${(1 - value) * 5}px)`)
  const size = mobile ? (prominent ? 30 : 22) : (prominent ? 48 : 26)
  return <motion.div className="everywhere-node" style={{ x, y, z, scale, opacity, filter, width: size, height: size, translateX: '-50%', translateY: '-50%' }}>
    <a href={platform.href} target="_blank" rel="noopener noreferrer" aria-label={platform.name}
      style={{ '--platform-color': platform.squareBg === '#000000' ? '#f5f5f2' : platform.squareBg } as CSSProperties}>
      <PlatformIcon platform={platform} size={size} />
      <span className="everywhere-node__label">{platform.name} ↗</span>
    </a>
  </motion.div>
}

function TravelingLetter({ letter, index, progress, width, height }: {
  letter: string; index: number; progress: MotionValue<number>; width: number; height: number
}) {
  const spread = useTransform(progress, value => phase(value, .14 + index * .007, .65))
  const x = useTransform(spread, value => (index - (WORD.length - 1) / 2) * width * .11 * value)
  const y = useTransform(spread, value => (index % 2 ? 1 : -1) * height * .12 * value)
  const z = useTransform(spread, value => -240 * value)
  const rotateY = useTransform(spread, value => (index - (WORD.length - 1) / 2) * -3 * value)
  const opacity = useTransform(progress, value => 1 - phase(value, .35, .65))
  return <motion.span style={{ x, y, z, rotateY, opacity }}>{letter}</motion.span>
}

function ReachCounter({ progress }: { progress: MotionValue<number> }) {
  const number = useTransform(progress, value => Math.round(phase(value, .57, .9) * DISTRIBUTION_COUNT))
  const [count, setCount] = useState(() => number.get())
  useMotionValueEvent(number, 'change', value => setCount(value))
  return <span>{count}+ platforms worldwide</span>
}

export function EverywhereReveal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 1280, height: 800 })
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: .0001 })
  const rawMouseX = useMotionValue(0)
  const rawMouseY = useMotionValue(0)
  const mouseX = useSpring(rawMouseX, { stiffness: 60, damping: 20 })
  const mouseY = useSpring(rawMouseY, { stiffness: 60, damping: 20 })
  const eyebrowOpacity = useTransform(progress, value => 1 - phase(value, .15, .36))
  const finalOpacity = useTransform(progress, value => phase(value, .58, .76))
  const finalY = useTransform(progress, value => 28 * (1 - phase(value, .58, .76)))
  const detailOpacity = useTransform(progress, value => phase(value, .72, .87))
  const [linksReady, setLinksReady] = useState(false)
  useMotionValueEvent(progress, 'change', value => setLinksReady(value >= .72))

  useEffect(() => {
    const element = stageRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(element)
    return () => observer.disconnect()
  }, [reducedMotion])

  if (reducedMotion) return <div className="everywhere-static">
    <p className="everywhere-eyebrow">Your audience is everywhere</p>
    <h2>One release.<br />Every platform.</h2>
    <p className="everywhere-description">One release date. All major platforms. Worldwide.</p>
    <div className="everywhere-static__platforms">{platforms.map(platform => <a key={platform.name} href={platform.href} target="_blank" rel="noopener noreferrer"><PlatformIcon platform={platform} size={24} /><span>{platform.name}</span></a>)}</div>
    <p className="everywhere-meta">{DISTRIBUTION_COUNT}+ platforms worldwide</p>
  </div>

  const mobile = size.width < 700
  const visiblePlatforms = platforms.slice(0, mobile ? MOBILE_POSITIONS.length : POSITIONS.length)
  return <div ref={containerRef} className="everywhere-reveal">
    <div className="everywhere-stage" ref={stageRef}
      onPointerMove={event => {
        if (event.pointerType !== 'mouse') return
        const bounds = event.currentTarget.getBoundingClientRect()
        rawMouseX.set((event.clientX - bounds.left) / bounds.width * 2 - 1)
        rawMouseY.set((event.clientY - bounds.top) / bounds.height * 2 - 1)
      }}
      onPointerLeave={() => { rawMouseX.set(0); rawMouseY.set(0) }}>
      <h2 className="everywhere-sr-only">Your audience is everywhere. One release. Every platform.</h2>
      <div className="everywhere-grain" aria-hidden="true" />
      <div className="everywhere-heading" aria-hidden="true">
        <motion.p className="everywhere-eyebrow" style={{ opacity: eyebrowOpacity }}>Your audience is</motion.p>
        <div className="everywhere-word">{Array.from(WORD).map((letter,index) => <TravelingLetter key={index} letter={letter} index={index} progress={progress} width={size.width} height={size.height} />)}</div>
      </div>
      <div className="everywhere-platforms" inert={!linksReady}>
        {visiblePlatforms.map((platform,index) => <DistributionNode key={platform.name} platform={platform} index={index} progress={progress} width={size.width} height={size.height} mobile={mobile} mouseX={mouseX} mouseY={mouseY} />)}
      </div>
      <motion.div className="everywhere-message" style={{ opacity: finalOpacity, y: finalY }} aria-hidden="true">
        <p>One release.<br /><span>Every platform.</span></p>
        <motion.div className="everywhere-description" style={{ opacity: detailOpacity }}>One release date. All major platforms. Worldwide.</motion.div>
      </motion.div>
      <motion.div className="everywhere-meta" style={{ opacity: detailOpacity }}><i aria-hidden="true" /><ReachCounter progress={progress} /><span className="everywhere-meta__aside">Same day. Everywhere.</span></motion.div>
    </div>
  </div>
}
