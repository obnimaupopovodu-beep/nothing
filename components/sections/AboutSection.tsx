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
    <section id="about" ref={ref} className="relative w-full" style={{ background: '#050505', marginTop: '-2px' }} aria-label="About">
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{
        height: '280px',
        background: 'radial-gradient(ellipse 50% 280px at 50% 0%, rgba(47,109,255,0.04) 0%, transparent 100%)'
      }} />

      <motion.div className="relative z-10" style={{ y, opacity }}>
        {/* — section header — */}
        <div className="px-6 pt-20 pb-12" style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(245,245,245,0.22)', marginBottom: '20px' }}>Who We Are</p>
          <h2 className="font-extralight" style={{ fontSize: 'clamp(1.9rem, 8vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.03em', color: '#F5F5F5' }}>
            Music Exists In The Space Between
          </h2>
          <p className="font-light" style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(245,245,245,0.42)', marginTop: '20px', maxWidth: '34ch', margin: '20px auto 0' }}>
            An independent electronic music label focused on curated sound, visual storytelling and immersive digital culture.
          </p>
        </div>

        {/* — thin rule — */}
        <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)', margin: '0 auto' }} />

        {/* — pillars — */}
        <div className="px-6 pt-10 pb-24" style={{ maxWidth: '420px', margin: '0 auto' }}>
          <div className="flex flex-col" style={{ gap: '0' }}>
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                className="flex flex-col items-center text-center"
                style={{ padding: '28px 0', borderBottom: i < PILLARS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span style={{ fontSize: '9px', letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(47,109,255,0.6)', marginBottom: '8px', display: 'block' }}>{p.title}</span>
                <p className="font-light" style={{ fontSize: '13px', lineHeight: 1.65, color: 'rgba(245,245,245,0.38)', maxWidth: '28ch' }}>{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
