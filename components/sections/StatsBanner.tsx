'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

const STATS = [
  { value: 90, suffix: '%', label: 'royalties stay with the artist' },
  { value: 60, suffix: '+', label: 'artists released with us'      },
  { value: 48, suffix: 'h', label: 'answer on every demo sent'     },
]

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target)
      return
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
    <div className="stat">
      <span className="stat-n num-grad" aria-label={`${value}${suffix}`}>
        {count}{suffix}
      </span>
      <span className="stat-l">{label}</span>
    </div>
  )
}

export function StatsBanner() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} aria-label="Label numbers" className="band">
      <div className="shell">
        <div className="stats">
          {STATS.map((s) => <StatItem key={s.label} {...s} active={isInView} />)}
        </div>
      </div>

      <style jsx>{`
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--line-soft);
          border-bottom: 1px solid var(--line-soft);
        }
        :global(.stat) {
          padding: clamp(28px, 4vw, 46px) clamp(18px, 3vw, 38px);
          border-left: 1px solid var(--line-soft);
        }
        :global(.stat:first-child) { border-left: 0; padding-left: 0; }
        :global(.stat-n) {
          display: block;
          font-size: clamp(42px, 6vw, 84px);
          font-weight: 900;
          letter-spacing: -0.05em;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        :global(.stat-l) {
          display: block;
          margin-top: 14px;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.5;
          color: var(--ink-2);
          max-width: 22ch;
        }
        @media (max-width: 760px) {
          .stats { grid-template-columns: 1fr; }
          :global(.stat) { border-left: 0; border-top: 1px solid var(--line-soft); padding-left: 0; }
          :global(.stat:first-child) { border-top: 0; }
        }
      `}</style>
    </section>
  )
}
