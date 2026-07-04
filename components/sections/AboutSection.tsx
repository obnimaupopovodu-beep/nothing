'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const PILLARS = [
  { title: 'Sound', body: 'Every release is chosen for emotional weight, not algorithmic reach.' },
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
          background: 'radial-gradient(ellipse 40% 200px at 20% 0%, rgba(127,176,255,0.05) 0%, transparent 100%)',
        }}
      />

      <motion.div className="relative z-10 section-shell" style={{ y, opacity }}>
        <div className="py-24 md:py-32">
          {/* Headline stacked full-width, pillars as a grid below (avoids repeating the split-header pattern used elsewhere) */}
          <h2
            className="font-extralight"
            style={{
              fontSize: 'clamp(1.9rem, 4.6vw, 3.2rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
              color: '#F5F5F5',
              maxWidth: '18ch',
            }}
          >
            Music exists in the space between.
          </h2>
          <p
            className="font-light"
            style={{
              fontSize: '15px',
              lineHeight: 1.75,
              color: 'rgba(245,245,245,0.4)',
              marginTop: '20px',
              maxWidth: '46ch',
            }}
          >
            An independent electronic music label focused on curated sound, visual storytelling and immersive digital culture.
          </p>

          {/* Pillars as a 3-column grid on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8 mt-16 md:mt-20">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                className="border-t border-white/[0.08] pt-6"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.32em',
                    textTransform: 'uppercase',
                    color: 'rgba(127,176,255,0.6)',
                    display: 'block',
                    marginBottom: '12px',
                  }}
                >
                  {p.title}
                </span>
                <p
                  className="font-light"
                  style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(245,245,245,0.42)', maxWidth: '32ch' }}
                >
                  {p.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
