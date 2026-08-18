'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const FAQ = [
  {
    q: 'What do you take from a release?',
    a: 'Ten percent of royalties for distribution and release management. The remaining ninety percent stays with the artist, and every payout line is visible in your dashboard.',
  },
  {
    q: 'How long until I hear back about a demo?',
    a: 'Within 48 hours. If the track does not fit the label, we say so directly and explain what stood in the way. We do not leave demos unanswered.',
  },
  {
    q: 'Do I keep the rights to my music?',
    a: 'Yes. You keep master ownership and publishing. We license the recording for distribution over an agreed term, and you can end the agreement when the term closes.',
  },
  {
    q: 'Can you release a track that is already out?',
    a: 'Often yes. If a record still has room to grow, we take it down from the previous distributor, rework the release plan, and put it out again with promo behind it.',
  },
  {
    q: 'Is promotion included?',
    a: 'Promotion is optional and quoted per release. You always see which actions were paid for, where they ran, and what they returned.',
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" aria-label="Frequently asked questions" className="band sec">
      <div className="shell">
        <div className="wrap">
          <motion.h2
            className="h2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Questions
            <br />
            artists ask us.
          </motion.h2>

          <div className="list">
            {FAQ.map((item, i) => {
              const isOpen = open === i
              return (
                <div key={item.q} className="row">
                  <button
                    type="button"
                    className="q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="q-text">{item.q}</span>
                    <span className={isOpen ? 'sign open' : 'sign'} aria-hidden="true">
                      <i />
                      <i />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="a">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .wrap {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: clamp(30px, 5vw, 80px);
          align-items: start;
        }
        .list { border-top: 1px solid var(--line-soft); }
        .row { border-bottom: 1px solid var(--line-soft); }
        .q {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          padding: 22px 0;
          min-height: 48px;
          background: none;
          border: 0;
          cursor: pointer;
          text-align: left;
          font: inherit;
        }
        .q-text {
          font-size: clamp(15px, 1.8vw, 18px);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--ink);
        }
        .sign {
          position: relative;
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border: 1px solid var(--line);
          border-radius: 999px;
          display: grid;
          place-items: center;
          transition: border-color 0.25s ease, background 0.25s ease, transform 0.35s var(--ease-spring);
        }
        .q:hover .sign { border-color: rgba(140, 170, 255, 0.42); background: var(--glass); }
        .sign i {
          position: absolute;
          background: var(--blue-soft);
          transition: transform 0.35s var(--ease-spring), opacity 0.25s ease;
        }
        .sign i:first-child { width: 11px; height: 1.5px; }
        .sign i:last-child  { width: 1.5px; height: 11px; }
        .sign.open { transform: rotate(45deg); }
        .a {
          padding: 0 0 24px;
          max-width: 62ch;
          font-size: 14.5px;
          line-height: 1.7;
          color: var(--ink-2);
        }
        @media (max-width: 900px) {
          .wrap { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
