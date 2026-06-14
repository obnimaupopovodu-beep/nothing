'use client'

import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const Scene = dynamic(
  () => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })),
  { ssr: false, loading: () => null }
)

const ACTION_CARDS = [
  { id: 'playlists', label: 'Playlists', sub: 'Curated selections', href: '#platforms' },
  { id: 'new-music', label: 'New Music', sub: 'Latest releases', href: '#releases' },
  { id: 'socials', label: 'Socials', sub: 'Follow the community', href: '#social' },
]

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  return (
    <section id="hero" ref={ref} className="relative w-full" style={{ height: '120vh' }} aria-label="Hero">
      <div className="sticky top-0 w-full h-dvh overflow-hidden">
        <div className="absolute inset-0 z-0"><Scene mouseX={0} mouseY={0} /></div>

        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% 40%, transparent 15%, rgba(5,5,5,0.6) 55%, #050505 100%)'
        }} />
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: '40%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(5,5,5,0.9) 70%, #050505 100%)'
        }} />

        <motion.div
          className="relative z-20 flex flex-col items-center justify-center h-full"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <div className="w-full px-6" style={{ maxWidth: '420px', margin: '0 auto' }}>
            <motion.p
              className="text-center mb-4"
              style={{ fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(245,245,245,0.28)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              Independent Electronic Music Label
            </motion.p>

            <motion.h1
              className="text-center font-extralight leading-none select-none"
              style={{ fontSize: 'clamp(3.5rem, 18vw, 9rem)', letterSpacing: '-0.04em', color: '#F5F5F5' }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              NOTHING<br />
              <span style={{ color: 'rgba(245,245,245,0.45)', fontWeight: 100 }}>RECORDS</span>
            </motion.h1>

            <motion.div
              className="mt-8 flex flex-col gap-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {ACTION_CARDS.map((card, i) => (
                <motion.a
                  key={card.id}
                  href={card.href}
                  className="group flex items-center justify-between px-5 py-4 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(12px)',
                    textDecoration: 'none',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ background: 'rgba(47,109,255,0.07)', borderColor: 'rgba(47,109,255,0.22)' }}
                  whileTap={{ scale: 0.982 }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 400, color: '#F5F5F5', letterSpacing: '0.01em' }}>{card.label}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(245,245,245,0.38)', marginTop: '2px', fontWeight: 300 }}>{card.sub}</div>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ color: 'rgba(47,109,255,0.5)', flexShrink: 0 }}>
                    <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              <motion.span
                style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(245,245,245,0.18)' }}
                animate={{ opacity: [0.18, 0.35, 0.18] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                ↓ Explore the label
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
