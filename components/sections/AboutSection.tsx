'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const PILLARS = [
  { title: 'Sound', body: 'Every release is chosen for emotional weight — not algorithmic reach.' },
  { title: 'Vision', body: 'We work with artists who treat music as a medium for storytelling.' },
  { title: 'Culture', body: 'At the intersection of electronic music, visual art, and digital identity.' },
]

export function AboutSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.3'] })
  const y = useTransform(scrollYProgress, [0, 1], [40, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      id="about"
      ref={ref}
      className="relative w-full border-t border-white/[0.06]"
      style={{ background: '#050505' }}
      aria-label="About"
    >
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '200px',
          background: 'radial-gradient(ellipse 40% 200px at 20% 0%, rgba(47,109,255,0.05) 0%, transparent 100%)',
        }}
      />

      <motion.div className="relative z-10 section-shell" style={{ y, opacity }}>
        <div className="py-24 md:py-32">
          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row md:items-start md:gap-16">
            {/* Left: heading block */}
            <div className="mb-10 md:mb-0 md:w-64 md:shrink-0">
              <p
                style={{
                  fontSize: '9px',
                  letterSpacing: '0.5em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,245,245,0.22)',
                  marginBottom: '16px',
                }}
              >
                Who We Are
              </p>
              <h2
                className="font-extralight"
                style={{
                  fontSize: 'clamp(1.7rem, 4vw, 2.6rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: '#F5F5F5',
                }}
              >
                Music Exists In The Space Between
              </h2>
              <p
                className="font-light"
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'rgba(245,245,245,0.38)',
                  marginTop: '16px',
                  maxWidth: '28ch',
                }}
              >
                An independent electronic music label focused on curated sound, visual storytelling and immersive digital culture.
              </p>
            </div>

            {/* Right: pillars as horizontal rows */}
            <div className="flex-1 min-w-0">
              {PILLARS.map((p, i) => (
                <motion.div
                  key={p.title}
                  className="flex items-start gap-6 border-b border-white/[0.06] py-6"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span
                    style={{
                      fontSize: '9px',
                      letterSpacing: '0.42em',
                      textTransform: 'uppercase',
                      color: 'rgba(47,109,255,0.55)',
                      display: 'block',
                      width: '72px',
                      flexShrink: 0,
                      paddingTop: '2px',
                    }}
                  >
                    {p.title}
                  </span>
                  <p
                    className="font-light"
                    style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(245,245,245,0.42)' }}
                  >
                    {p.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
