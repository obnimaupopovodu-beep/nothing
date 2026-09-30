'use client'

import { useMotionValue, useSpring } from 'framer-motion'
import type { PointerEvent } from 'react'

export function useMagneticButton() {
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const x = useSpring(targetX, { stiffness: 260, damping: 24, mass: 0.5 })
  const y = useSpring(targetY, { stiffness: 260, damping: 24, mass: 0.5 })

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const bounds = event.currentTarget.getBoundingClientRect()
    targetX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10)
    targetY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 10)
  }

  const onPointerLeave = () => {
    targetX.set(0)
    targetY.set(0)
  }

  return { style: { x, y }, onPointerMove, onPointerLeave }
}
