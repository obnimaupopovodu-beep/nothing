'use client'

import dynamic from 'next/dynamic'
import { motion, useReducedMotion } from 'framer-motion'
import { useMouse } from '@/hooks/useMouse'

const Scene = dynamic(
  () => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })),
  { ssr: false, loading: () => null }
)

/** Satellite links orbiting the sculpture. Angles in degrees on the outer ring. */
const SATELLITES = [
  { label: 'How we work',  href: '#releases',  angle: -52 },
  { label: 'Platforms', href: '#platforms', angle: 4   },
  { label: 'Playlists', href: '#playlists', angle: 58  },
]

export function HeroSection() {
  const mouse = useMouse()
  const reduce = useReducedMotion()

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      id="top"
      aria-label="Nothing Records"
      className="band"
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'grid',
        alignItems: 'center',
        paddingTop: 'clamp(20px, 5vh, 56px)',
        paddingBottom: 'clamp(48px, 8vh, 88px)',
        background: 'transparent',
      }}
    >
      <div className="shell">
        <div className="hero-grid">
          {/* ---------------- copy column ---------------- */}
          <div>
            <motion.p
              className="kicker"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <i aria-hidden="true" />
              Independent electronic label
            </motion.p>

            <motion.h1
              className="h1"
              style={{ marginTop: 24 }}
              initial={reduce ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              Nothing
              <br />
              <span className="h1-outline">Records</span>
            </motion.h1>

            <motion.p
              className="lede"
              style={{ marginTop: 26, maxWidth: '30ch' }}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              Distribution, promo and straight answers for electronic artists.
            </motion.p>

            <motion.div
              style={{ marginTop: 34, display: 'flex', flexWrap: 'wrap', gap: 14 }}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <button type="button" className="btn btn-primary" onClick={() => scrollTo('#demo')}>
                Submit a track
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => scrollTo('#releases')}>
                Hear the catalog
              </button>
            </motion.div>
          </div>

          {/* ---------------- sculpture column ---------------- */}
          <motion.div
            className="crystal-wrap"
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="orbit-glow" aria-hidden="true" />
            <div className="orbit" aria-hidden="true" />
            <div className="orbit-dashed" aria-hidden="true" />

            <div className="crystal-canvas">
              <Scene mouseX={mouse.x} mouseY={mouse.y} />
            </div>

            {/* satellite navigation pinned to the outer ring */}
            <div className="sat-orbit">
              {SATELLITES.map((s) => (
                <span
                  key={s.label}
                  className="sat-slot"
                  style={{ transform: `rotate(${s.angle}deg) translate(min(15vw, 208px)) rotate(${-s.angle}deg)` }}
                >
                  <button type="button" className="sat" onClick={() => scrollTo(s.href)}>
                    {s.label}
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(24px, 4vw, 72px);
          align-items: center;
        }
        :global(.crystal-wrap) {
          position: relative;
          display: grid;
          place-items: center;
          aspect-ratio: 1;
          width: 100%;
          max-width: 520px;
          margin-inline: auto;
        }
        .crystal-canvas {
          position: absolute;
          inset: 8%;
          animation: float 7s ease-in-out infinite;
        }
        .sat-orbit {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
        }
        .sat-slot {
          position: absolute;
          display: block;
        }
        .sat {
          pointer-events: auto;
          border: 1px solid var(--line);
          background: rgba(7, 11, 22, 0.72);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: var(--pill);
          padding: 9px 18px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-2);
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .sat:hover {
          color: var(--ink);
          border-color: rgba(140, 170, 255, 0.42);
          background: rgba(120, 155, 255, 0.12);
        }
        @media (max-width: 1023px) {
          .hero-grid { grid-template-columns: 1fr; gap: 12px; }
          :global(.crystal-wrap) { order: -1; max-width: 340px; }
        }
        @media (max-width: 640px) {
          .sat-orbit { display: none; }
          :global(.crystal-wrap) { max-width: 250px; }
        }
      `}</style>
    </section>
  )
}
