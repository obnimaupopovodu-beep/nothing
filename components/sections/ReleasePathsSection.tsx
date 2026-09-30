'use client'

import { motion } from 'framer-motion'
import type { PointerEvent } from 'react'
import { VinylRecord, Sparkle, WaveSine } from '@phosphor-icons/react/dist/ssr'

const MODES = [
  {
    tag: 'Release',
    title: 'Direct release management.',
    body: 'We distribute your track for 10% of royalties, keep the workflow simple, and show every number in one place.',
    Icon: VinylRecord,
    wide: true,
  },
  {
    tag: 'Promotion',
    title: 'Release support with momentum.',
    body: 'We pair the release with social campaigns and playlist outreach when your track needs extra reach.',
    Icon: Sparkle,
    wide: false,
  },
  {
    tag: 'Re-release',
    title: 'A second life for the right record.',
    body: 'If a track is already out but still has room to grow, we reframe it as a stronger release and push it again.',
    Icon: WaveSine,
    wide: false,
  },
]

function moveCardLight(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const bounds = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`)
  event.currentTarget.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`)
}

export function ReleasePathsSection() {
  return (
    <section id="releases" aria-label="Ways to release with us" className="band sec">
      <div className="shell">
        <motion.div
          className="head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="kicker"><i aria-hidden="true" />Three ways in</p>
          <h2 className="h2">Pick the path<br />your record needs.</h2>
        </motion.div>

        <div className="grid">
          {MODES.map((m, i) => (
            <motion.article
              key={m.tag}
              className={m.wide ? 'card cell cell-wide pointer-card' : 'card cell pointer-card'}
              onPointerMove={moveCardLight}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.75, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
            >
              <m.Icon size={22} weight="light" className="ic" aria-hidden="true" />
              <span className="tag">{m.tag}</span>
              <h3 className="h3 t">{m.title}</h3>
              <p className="b">{m.body}</p>
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx>{`
        :global(.head) { max-width: min(100%, 820px); margin-bottom: clamp(40px, 5vw, 68px); }
        :global(.head .kicker) { margin-bottom: 20px; }
        .grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: clamp(14px, 1.6vw, 22px);
          align-items: stretch;
        }
        :global(.cell) { display: flex; flex-direction: column; }
        :global(.pointer-card) { position: relative; overflow: hidden; isolation: isolate; }
        :global(.pointer-card > *) { position: relative; z-index: 1; }
        @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
          :global(.pointer-card::before) {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: radial-gradient(190px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(75, 111, 255, 0.17), transparent 75%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          :global(.pointer-card:hover::before) { opacity: 1; }
          :global(.pointer-card:hover) { border-color: rgba(108, 141, 255, 0.32); }
        }
        :global(.cell-wide) { padding: clamp(26px, 3.4vw, 44px); }
        :global(.cell .ic) { color: var(--blue-soft); }
        .tag {
          margin-top: 22px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ink-3);
        }
        .t { margin-top: 12px; color: var(--ink); }
        .b {
          margin-top: 14px;
          font-size: 14px;
          line-height: 1.65;
          color: var(--ink-2);
        }
:global(.cell-wide) .t { font-size: clamp(24px, 2.9vw, 34px); }
        @media (max-width: 1023px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
