'use client'

import { useState, useEffect, useRef } from 'react'

export function useMouse() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1
      target.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        target.current.x = (e.gamma / 45) * 0.5
        target.current.y = ((e.beta - 45) / 45) * 0.5
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onOrientation, { passive: true })

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const tick = () => {
      smooth.current.x = lerp(smooth.current.x, target.current.x, 0.05)
      smooth.current.y = lerp(smooth.current.y, target.current.y, 0.05)
      setMouse({ x: smooth.current.x, y: smooth.current.y })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('deviceorientation', onOrientation)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return mouse
}
