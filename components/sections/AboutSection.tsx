'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const PILLARS = [
  {
    title: 'Sound',
    body: 'Every release is chosen for emotional weight — not algorithmic reach. We prioritize feeling over format.',
  },
  {
    title: 'Vision',
    body: 'We work with artists who treat music as a medium for storytelling, not just a product to distribute.',
  },
  {
    title: 'Culture',
    body: 'NOTHING RECORDS exists at the intersection of electronic music, visual art, and digital identity.',
  },
]

export function AboutSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.3'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [48, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      id="about"
      ref={ref}
      className="relative w-full"
      style={{
        background: '#050505',
        marginTop: '-2px', // seamless overlap with hero bottom
      }}
      aria-label="About"
    >
      {/* Atmospheric top glow — connects to hero */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '320px',
          background:
            'radial-gradient(ellipse 60% 300px at 50% 0%, rgba(47,109,255,0.04) 0%, transparent 100%)',
        }}
      />

      <motion.div
        className="relative z-10 max-w-sm mx-auto px-5"
        style={{ y, opacity }}
      >
        {/* Section label */}
        <p
          className="text-[9px] tracking-[0.5em] uppercase pt-20 pb-6"
          style={{ color: 'rgba(245,245,245,0.25)' }}
        >
          Who We Are
        </p>

        {/* Headline */}
        <h2
          className="font-extralight leading-[1.1] tracking-[-0.03em]"
          style={{
            fontSize: 'clamp(2rem, 9vw, 3.5rem)',
            color: '#F5F5F5',
          }}
        >
          Music Exists In The Space Between
        </h2>

        {/* Body */}
        <p
          className="mt-6 font-light leading-relaxed"
          style={{
            fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
            color: 'rgba(245,245,245,0.55)',
            maxWidth: '38ch',
          }}
        >
          NOTHING RECORDS is an independent electronic music label focused on curated sound,
          visual storytelling and immersive digital culture.
        </p>

        {/* Thin divider */}
        <div
          className="mt-12 mb-12"
          style={{
            height: '1px',
            background: 'linear-gradient(to right, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 60%, transparent)',
          }}
        />

        {/* Pillars */}
        <div className="flex flex-col gap-8 pb-20">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <p
                className="text-[9px] tracking-[0.4em] uppercase mb-2"
                style={{ color: 'rgba(47,109,255,0.7)' }}
              >
                {p.title}
              </p>
              <p
                className="font-light leading-relaxed"
                style={{
                  fontSize: 'clamp(0.8125rem, 3.2vw, 0.9375rem)',
                  color: 'rgba(245,245,245,0.45)',
                }}
              >
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
