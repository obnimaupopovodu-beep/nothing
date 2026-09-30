'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

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
  const [open, setOpen] = useState<number | null>(null)
  const reduceMotion = useReducedMotion()

  return (
    <section id="faq" aria-label="Frequently asked questions" className="band sec">
      <div className="shell">
        <div className="wrap">
          <div className="intro">
            <p className="eyebrow"><span aria-hidden="true" />FAQ / 01—05</p>
            <motion.h2
              className="faq-title"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Straight answers.
            </motion.h2>
          </div>

          <div className="list">
            {FAQ.map((item, i) => {
              const isOpen = open === i
              return (
                <div key={item.q} className={isOpen ? 'row open' : 'row'}>
                  <button
                    type="button"
                    className="q"
                    id={`faq-trigger-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
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
                        role="region"
                        aria-labelledby={`faq-trigger-${i}`}
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
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
          width: 100%;
          max-width: 960px;
          margin-inline: auto;
        }
        .intro { margin-bottom: clamp(38px, 5vw, 64px); }
        .eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 20px;
          color: var(--ink-3);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
        }
        .eyebrow span {
          display: block;
          width: 24px;
          height: 1px;
          background: var(--blue-soft);
        }
        :global(.faq-title) {
          margin: 0;
          color: var(--ink);
          font-size: clamp(36px, 4.4vw, 56px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.055em;
        }
        .list { border-top: 1px solid var(--line); }
        .row { border-bottom: 1px solid var(--line); }
        .q {
          width: 100%;
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr) 18px;
          align-items: center;
          gap: 20px;
          padding: 23px 0;
          min-height: 68px;
          background: none;
          border: 0;
          cursor: pointer;
          text-align: left;
          font: inherit;
        }
        .index {
          color: var(--ink-3);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          transition: color 0.25s ease;
        }
        .row.open .index, .q:hover .index { color: var(--blue-soft); }
        .q-text {
          font-size: clamp(16px, 1.45vw, 19px);
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: -0.025em;
          color: var(--ink);
        }
        .sign {
          position: relative;
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
        }
        .sign i {
          position: absolute;
          background: var(--ink-3);
          transition: background 0.25s ease, transform 0.3s var(--ease-spring);
        }
        .sign i:first-child { width: 14px; height: 1px; }
        .sign i:last-child  { width: 1px; height: 14px; }
        .sign.open i:last-child { transform: scaleY(0); }
        .row.open .sign i, .q:hover .sign i { background: var(--blue-soft); }
        .a {
          margin: 0 0 27px 64px;
          max-width: 68ch;
          font-size: 15px;
          line-height: 1.65;
          color: var(--ink-2);
        }
        @media (max-width: 700px) {
          .intro { margin-bottom: 36px; }
          .eyebrow { margin-bottom: 16px; }
          .q {
            grid-template-columns: 28px minmax(0, 1fr) 18px;
            gap: 12px;
            padding: 19px 0;
            min-height: 62px;
          }
          .a { margin-left: 40px; margin-bottom: 23px; font-size: 14px; }
        }
      `}</style>
    </section>
  )
}
