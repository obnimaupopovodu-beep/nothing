'use client'

import { motion, useTransform, type MotionValue } from 'framer-motion'

export type PathGeometry = {
  sourceX: number
  sourceY: number
  wordWidth: number
  rightEdge: number
  cards: { x: number; y: number; width: number; height: number }[]
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const INITIAL_STRETCH = 0.55
export const PATH_BEAD_DIAMETER = 20
const restScale = (emissions: number) => 1 + INITIAL_STRETCH * (1 - emissions / 3)
const ease = (value: number) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

export const pathPhase = (progress: number, index: number) => clamp((progress - 0.04 - index * 0.3) / 0.25)

export function wordPose(progress: number) {
  if (progress < 0.04) return { scaleX: restScale(0), scaleY: 1, x: 0 }
  const index = Math.min(2, Math.floor((progress - 0.04) / 0.3))
  const phase = pathPhase(progress, index)
  const base = restScale(index)
  const compressed = base * 0.9
  const restored = restScale(index + 1)
  if (phase < 0.22) {
    const tension = ease(phase / 0.22)
    return { scaleX: base + (compressed - base) * tension, scaleY: 1 + 0.055 * tension, x: -4 * tension }
  }
  const recovery = clamp((phase - 0.22) / 0.78)
  const settle = 1 - ease(recovery)
  const bounce = Math.sin(recovery * Math.PI * 4) * Math.exp(-recovery * 4) * (1 - recovery)
  return {
    scaleX: restored + (compressed - restored) * settle + 0.2 * bounce,
    scaleY: 1 + 0.055 * settle - 0.07 * bounce,
    x: -4 * settle - 5 * bounce,
  }
}

type Point = { x: number; y: number }

// A continuous curve through alternating bends, with no sharp zigzag corners.
function curve(points: Point[], progress: number): Point {
  const t = clamp(progress) * (points.length - 1)
  const index = Math.min(points.length - 2, Math.floor(t))
  const local = t - index
  const p0 = points[Math.max(0, index - 1)]
  const p1 = points[index]
  const p2 = points[index + 1]
  const p3 = points[Math.min(points.length - 1, index + 2)]
  const axis = (key: 'x' | 'y') => 0.5 * (
    2 * p1[key] + (-p0[key] + p2[key]) * local +
    (2 * p0[key] - 5 * p1[key] + 4 * p2[key] - p3[key]) * local ** 2 +
    (-p0[key] + 3 * p1[key] - 3 * p2[key] + p3[key]) * local ** 3
  )
  return { x: axis('x'), y: axis('y') }
}

export function beadPose(progress: number, index: number, geometry: PathGeometry | null) {
  const hidden = { x: 0, y: 0, width: 0, height: 0, radius: 50, rotation: 0, opacity: 0, morph: 0 }
  if (!geometry) return hidden
  const phase = pathPhase(progress, index)
  const card = geometry.cards[index]
  if (!card) return hidden

  const source = {
    x: geometry.sourceX + geometry.wordWidth * restScale(index) * 0.9 - 4,
    y: geometry.sourceY,
  }
  const room = Math.max(24, geometry.rightEdge - source.x - 28)
  const travel = clamp((phase - 0.22) / 0.46)
  // A quick launch followed by a gentle arrival, instead of constant speed.
  const distance = 1 - (1 - travel) ** 2
  const points = [
    source,
    { x: source.x + Math.min(100, room * 0.65), y: source.y - 12 },
    { x: source.x + Math.min(155, room), y: source.y + 52 },
    { x: source.x + Math.min(60, room * 0.4), y: source.y + 112 },
    { x: card.x + (index === 0 ? 65 : -45), y: card.y - 65 },
    { x: card.x, y: card.y },
  ]
  const point = curve(points, distance)
  const before = curve(points, Math.max(0, distance - 0.005))
  const after = curve(points, Math.min(1, distance + 0.005))
  const direction = Math.atan2(after.y - before.y, after.x - before.x)
  const morph = ease((phase - 0.68) / 0.24)
  const birth = ease((phase - 0.14) / 0.08)
  const elongation = 1 + 0.3 * Math.sin(travel * Math.PI) * (1 - morph)
  const beadWidth = (6 + (PATH_BEAD_DIAMETER - 6) * birth) * elongation
  const beadHeight = (6 + (PATH_BEAD_DIAMETER - 6) * birth) / elongation
  const width = beadWidth + (card.width - beadWidth) * morph
  const height = beadHeight + (card.height - beadHeight) * morph

  return {
    x: point.x - width / 2,
    y: point.y - height / 2,
    width,
    height,
    radius: 50 + (14 - 50) * morph,
    rotation: direction * 180 / Math.PI * (1 - morph),
    opacity: birth * (1 - ease((phase - 0.9) / 0.1)),
    morph,
  }
}

export function ReleasePathWord({ progress, animated }: { progress: MotionValue<number>; animated: boolean }) {
  const pose = useTransform(progress, wordPose)
  const scaleX = useTransform(pose, (value) => value.scaleX)
  const scaleY = useTransform(pose, (value) => value.scaleY)
  const x = useTransform(pose, (value) => value.x)
  return (
    <motion.span className="release-path-word" style={animated ? { scaleX, scaleY, x, transformOrigin: 'left center' } : { scaleX: 1, scaleY: 1, x: 0 }}>
      path
    </motion.span>
  )
}

export function ReleasePathBead({ progress, index, geometry }: { progress: MotionValue<number>; index: number; geometry: PathGeometry | null }) {
  const pose = useTransform(progress, (value) => beadPose(value, index, geometry))
  const x = useTransform(pose, (value) => value.x)
  const y = useTransform(pose, (value) => value.y)
  const width = useTransform(pose, (value) => value.width)
  const height = useTransform(pose, (value) => value.height)
  const borderRadius = useTransform(pose, (value) => value.radius)
  const rotate = useTransform(pose, (value) => value.rotation)
  const opacity = useTransform(pose, (value) => value.opacity)
  const backgroundColor = useTransform(pose, (value) => `rgba(214, 223, 255, ${1 - value.morph})`)
  const borderColor = useTransform(pose, (value) => `rgba(255, 255, 255, ${0.6 - value.morph * 0.54})`)
  return (
    <motion.div
      aria-hidden="true"
      className="release-path-bead"
      style={{ x, y, width, height, borderRadius, rotate, opacity, backgroundColor, borderColor }}
    />
  )
}

export function ReleasePathCard({ children, index, progress, animated, wide }: {
  children: React.ReactNode
  index: number
  progress: MotionValue<number>
  animated: boolean
  wide: boolean
}) {
  const phase = useTransform(progress, (value) => pathPhase(value, index))
  const opacity = useTransform(phase, (value) => ease((value - 0.84) / 0.12))
  const contentOpacity = useTransform(phase, (value) => ease((value - 0.84) / 0.16))
  const contentY = useTransform(contentOpacity, (value) => (1 - value) * 14)
  const clipPath = useTransform(contentOpacity, (value) => `inset(0 0 ${(1 - value) * 100}% 0)`)
  return (
    <motion.article
      className={`card release-path-card${wide ? ' release-path-card-wide' : ''}`}
      style={animated ? { opacity } : { opacity: 1 }}
      initial={false}
    >
      <motion.div className="release-path-content" style={animated ? { opacity: contentOpacity, y: contentY, clipPath } : { opacity: 1, y: 0, clipPath: 'none' }}>
        {children}
      </motion.div>
    </motion.article>
  )
}
