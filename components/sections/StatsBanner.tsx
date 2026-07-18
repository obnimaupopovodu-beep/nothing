'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

const STATS = [
  { value: 90, suffix: '%', label: 'royalties to artist' },
  { value: 60, suffix: '+', label: 'artists released'    },
  { value: 48, suffix: 'h', label: 'response time'       },
]

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target); return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(e * target))
      if (p < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [active, target, duration])

  return count
}

function StatItem({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCountUp(value, active)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
      <span
        aria-label={`${value}${suffix}`}
        style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: '#FAFAFA', fontVariantNumeric: 'tabular-nums' }}
      >
        {count}{suffix}
      </span>
      <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,250,250,0.32)' }}>
        {label}
      </span>
    </div>
  )
}

export function StatsBanner() {
  const ref      = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      aria-label="Label statistics"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(2.5rem, 6vw, 4rem) 0', position: 'relative', zIndex: 1, background: '#000000' }}
    >
      <div className="section-shell">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(2rem, 8vw, 6rem)', flexWrap: 'wrap' }}>
          {STATS.map((s) => <StatItem key={s.label} {...s} active={isInView} />)}
        </div>
      </div>
    </section>
  )
}
