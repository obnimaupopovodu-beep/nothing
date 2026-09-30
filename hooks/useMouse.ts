'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

export type MousePosition = { x: number; y: number }

export function useMouse(target: RefObject<HTMLElement | null>, disabled = false) {
  const mouse = useRef<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    if (disabled || !window.matchMedia('(pointer: fine)').matches) return

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const bounds = target.current?.getBoundingClientRect()
      if (!bounds) return

      const centerX = bounds.left + bounds.width / 2
      const centerY = bounds.top + bounds.height / 2
      mouse.current.x = Math.max(-1, Math.min(1, (event.clientX - centerX) / (window.innerWidth / 2)))
      mouse.current.y = Math.max(-1, Math.min(1, (centerY - event.clientY) / (window.innerHeight / 2)))
    }
    const onLeave = () => {
      mouse.current.x = 0
      mouse.current.y = 0
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [disabled, target])

  return mouse
}
