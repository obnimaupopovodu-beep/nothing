'use client'

import { motion } from 'framer-motion'

const PILLARS = [
  { title: 'Sound',   body: 'Every release is chosen for emotional weight, not algorithmic reach.' },
  { title: 'Vision',  body: 'We work with artists who treat music as a medium for storytelling.' },
  { title: 'Culture', body: 'At the intersection of electronic music, visual art, and digital identity.' },
]

export function AboutSection() {
  return (
    <section id="about" aria-label="About the label" className="band sec">
      <div className="shell">
        <div className="split">
          <motion.h2
            className="h2"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            Records that
            <br />
            refuse
            <br />
            <span className="accent">to blend in.</span>
          </motion.h2>

          <motion.p
            className="lede"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Nothing Records signs a small number of electronic artists each year and works each
            record properly: clean distribution, honest reporting, and promo only when the track
            can carry it. No inflated promises, no silence after you send a demo.
          </motion.p>
        </div>

        <div className="pillars">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              className="pillar"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="p-title">{p.title}</h3>
              <p className="p-body">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .split {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(28px, 5vw, 80px);
          align-items: end;
        }
        .accent { color: var(--blue-soft); }
        .pillars {
          margin-top: clamp(48px, 8vw, 96px);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(22px, 4vw, 48px);
        }
        :global(.pillar) { border-top: 1px solid var(--line); padding-top: 20px; }
        .p-title {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.02em;
          color: var(--ink);
        }
        .p-body {
          margin-top: 10px;
          font-size: 14px;
          line-height: 1.65;
          color: var(--ink-2);
          max-width: 34ch;
        }
        @media (max-width: 900px) {
          .split { grid-template-columns: 1fr; align-items: start; }
          .pillars { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
