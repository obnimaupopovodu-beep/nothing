'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  o: number
  drift: number
  offsetX: number
  offsetY: number
  velocityX: number
  velocityY: number
}

const SCROLL_PARALLAX = 0.22
const CURSOR_RADIUS = 145
const CURSOR_PUSH = 34
const SPRING_STRENGTH = 130
const SPRING_DAMPING = 18

function wrap(value: number, size: number) {
  return ((value % size) + size) % size
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const stars: Star[] = Array.from({ length: 220 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.15,
      o: Math.random() * 0.45 + 0.05,
      drift: Math.random() * 0.55 + 0.2,
      offsetX: 0,
      offsetY: 0,
      velocityX: 0,
      velocityY: 0,
    }))

    let raf = 0
    let w = 0, h = 0
    let lastTime = 0
    let scrollTarget = -window.scrollY * SCROLL_PARALLAX
    let scrollOffset = scrollTarget
    let cursorX = 0
    let cursorY = 0
    let cursorActive = false

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width  = w
      canvas.height = h
    }
    const onScroll = () => {
      scrollTarget = -window.scrollY * SCROLL_PARALLAX
    }
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      cursorX = event.clientX
      cursorY = event.clientY
      cursorActive = true
    }
    const onPointerLeave = () => {
      cursorActive = false
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    if (!reduced) {
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerleave', onPointerLeave)
      window.addEventListener('blur', onPointerLeave)
    }

    const draw = (now: number) => {
      const dt = Math.min((now - (lastTime || now)) / 1000, 0.05)
      lastTime = now
      if (!reduced) {
        scrollOffset += (scrollTarget - scrollOffset) * (1 - Math.exp(-dt * 9))
      }

      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const baseX = s.x * w
        const baseY = wrap(s.y * h + scrollOffset, h)

        if (!reduced) {
          let targetX = 0
          let targetY = 0
          if (cursorActive) {
            const dx = baseX - cursorX
            const dy = baseY - cursorY
            const distance = Math.hypot(dx, dy)
            if (distance < CURSOR_RADIUS) {
              const proximity = 1 - distance / CURSOR_RADIUS
              const force = CURSOR_PUSH * proximity * proximity * (3 - 2 * proximity)
              targetX = (distance ? dx / distance : 1) * force
              targetY = (distance ? dy / distance : 0) * force
            }
          }

          // The damped spring eases both repulsion and the return to rest.
          s.velocityX = (s.velocityX + (targetX - s.offsetX) * SPRING_STRENGTH * dt) * Math.exp(-SPRING_DAMPING * dt)
          s.velocityY = (s.velocityY + (targetY - s.offsetY) * SPRING_STRENGTH * dt) * Math.exp(-SPRING_DAMPING * dt)
          s.offsetX += s.velocityX * dt
          s.offsetY += s.velocityY * dt
          s.y = wrap(s.y + s.drift * dt / h, 1)
        }

        ctx.beginPath()
        ctx.arc(baseX + s.offsetX, baseY + s.offsetY, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(214,229,255,${s.o})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('blur', onPointerLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', width: '100%', height: '100%' }}
    />
  )
}
