'use client'

import { useEffect, useRef, type RefObject } from 'react'

/** Container-sized adaptation of particle_motion.html; audio never depends on rendering. */
export function ParticleSphere({ analyser, compact = false }: {
  analyser: RefObject<AnalyserNode | null>
  compact?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !ctx) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const count = compact ? 780 : 2400
    const tau = Math.PI * 2
    const seed = (n: number) => { const x = Math.sin(n * 127.1 + 41.7) * 43758.5453123; return x - Math.floor(x) }
    const particles = Array.from({ length: count }, (_, i) => ({
      u: seed(i + 1) * tau, v: seed(i + 8001) * 2 - 1,
      jitter: seed(i + 17003), size: .58 + Math.pow(seed(i + 39011), 4) * 1.9, kind: seed(i + 49009),
    }))
    let width = 0, height = 0, frame = 0, previous = 0, time = 0, energy = 0
    let visible = true, disposed = false
    let bins = new Uint8Array(new ArrayBuffer(1024))
    let lastDraw = 0
    function draw(now: number) {
      frame = 0
      if (disposed || !visible || document.hidden) return
      // Sample every display frame so short transients remain visible.
      if (!reduced.matches && now - lastDraw < 1000 / 60) { frame = requestAnimationFrame(draw); return }
      lastDraw = now
      const dt = previous ? Math.min((now - previous) / 1000, .06) : 0
      previous = now
      if (!reduced.matches) time += dt
      let target = 0
      const node = analyser.current
      if (node && node.context.state === 'running' && !reduced.matches) {
        if (bins.length !== node.frequencyBinCount) bins = new Uint8Array(new ArrayBuffer(node.frequencyBinCount))
        node.getByteFrequencyData(bins)
        const hzPerBin = node.context.sampleRate / node.fftSize
        const low = Math.max(1, Math.floor(40 / hzPerBin)), high = Math.min(bins.length - 1, Math.ceil(180 / hzPerBin))
        let bass = 0, full = 0
        for (let i = low; i <= high; i++) bass += bins[i] / 255
        for (let i = 0; i < bins.length; i++) full += bins[i] / 255
        target = Math.min(1, bass / Math.max(1, high - low + 1) * .8 + full / bins.length * .2)
      }
      // Increase contrast between the sustained bed and strong hits.
      target = Math.pow(target, 2)
      energy += (target - energy) * (1 - Math.exp(-dt * (target > energy ? 60 : 28)))
      ctx!.clearRect(0, 0, width, height)
      const scale = Math.min(width, height) * .33 * (1 + energy * .28)
      const sy = Math.sin(time * .075 + .4), cy = Math.cos(time * .075 + .4)
      const angle = -.24 + .13 * Math.sin(time * .12), sx = Math.sin(angle), cx = Math.cos(angle)
      const opening = .5 + .5 * Math.sin(time * .17 - .8)
      for (const p of particles) {
        const { u, v } = p
        const latitude = Math.sqrt(Math.max(0, 1 - v * v))
        const twist = u + v * (1.12 + .38 * Math.sin(time * .23)) + .14 * Math.sin(time * .28 + v * 5)
        const pleat = Math.sin(6 * u + v * 4.8 + time * .48)
        const rip = Math.sin(11 * u - v * 7.5 - time * .31)
        const radius = (1 + pleat * (.12 + opening * .065 + energy * .025) + rip * .028 + .07 * Math.sin(time * .34)) * latitude
        const drift = (p.jitter - .5) * .035
        let x = radius * Math.cos(twist) + drift, z = radius * Math.sin(twist) + drift
        let y = v * (1.12 - opening * .09) + .14 * Math.sin(u * 3 + time * .37) * latitude
        const fold = Math.sin(time * .13) * .21
        x += fold * Math.sin(v * 5 + u * 2) * latitude
        z += fold * Math.cos(v * 6 - u * 3) * latitude
        y += .07 * Math.sin(time * .42 + u * 4) * latitude
        const rx = x * cy - z * sy, rz = x * sy + z * cy
        const ry = y * cx - rz * sx, depth = y * sx + rz * cx
        const perspective = 3.6 / (3.6 - depth * .30)
        const alpha = Math.max(.09, Math.min(.9, .36 + depth * .24 + p.jitter * .26))
        ctx!.fillStyle = p.kind > .965 ? `rgba(157,174,225,${alpha * .8})` : `rgba(239,240,245,${alpha})`
        ctx!.beginPath()
        ctx!.arc(width / 2 + rx * scale * perspective, height / 2 + ry * scale * perspective,
          p.size * perspective * (compact ? .48 : .65), 0, tau)
        ctx!.fill()
      }
      if (!reduced.matches) frame = requestAnimationFrame(draw)
    }
    function start() { if (!disposed && visible && !document.hidden && !frame) { previous = 0; frame = requestAnimationFrame(draw) } }
    function refresh() { cancelAnimationFrame(frame); frame = 0; start() }
    const resize = new ResizeObserver(entries => {
      const rect = entries[0].contentRect
      width = rect.width; height = rect.height
      const dpr = Math.min(devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      refresh()
    })
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; refresh() })
    resize.observe(canvas); intersection.observe(canvas)
    document.addEventListener('visibilitychange', refresh)
    reduced.addEventListener('change', refresh)
    start()
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect()
      document.removeEventListener('visibilitychange', refresh); reduced.removeEventListener('change', refresh)
    }
  }, [analyser, compact])
  return <canvas ref={canvasRef} className={`particle-sphere${compact ? ' particle-sphere--compact' : ''}`} aria-hidden="true" />
}
