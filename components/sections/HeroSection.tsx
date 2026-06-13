'use client'

import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const Scene = dynamic(
  () => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })),
  { ssr: false, loading: () => null }
)

const ACTION_CARDS = [
  {
    id: 'playlists',
    label: 'Playlists',
    sub: 'Curated selections and label favorites',
    href: '#playlists',
  },
  {
    id: 'new-music',
    label: 'New Music',
    sub: 'Latest releases and weekly discoveries',
    href: '#releases',
  },
  {
    id: 'socials',
    label: 'Socials',
    sub: 'Follow the community',
    href: '#socials',
  },
]

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      id="hero"
      ref={ref}
      className="relative w-full"
      style={{ height: '115vh' }}
      aria-label="Hero"
    >
      {/* Sticky viewport — hero content stays in view as About peeks in */}
      <div className="sticky top-0 w-full h-dvh overflow-hidden">

        {/* WebGL */}
        <div className="absolute inset-0 z-0">
          <Scene mouseX={0} mouseY={0} />
        </div>

        {/* Radial vignette */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% 40%, transparent 20%, rgba(5,5,5,0.65) 60%, #050505 100%)',
          }}
        />

        {/* Bottom gradient — softens the peek-through edge */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
          style={{
            height: '35%',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(5,5,5,0.85) 70%, #050505 100%)',
          }}
        />

        {/* Main content */}
        <motion.div
          className="relative z-20 flex flex-col items-center justify-center h-full px-5 pb-28"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          {/* Label tag */}
          <motion.p
            className="text-[9px] tracking-[0.5em] uppercase mb-5"
            style={{ color: 'rgba(245,245,245,0.3)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Independent Electronic Music Label
          </motion.p>

          {/* Wordmark */}
          <motion.h1
            className="font-extralight leading-none tracking-[-0.04em] text-[#F5F5F5] text-center select-none"
            style={{ fontSize: 'clamp(3.8rem, 16vw, 13rem)' }}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            NOTHING
            <br />
            <span className="font-thin" style={{ color: 'rgba(245,245,245,0.55)' }}>RECORDS</span>
          </motion.h1>

          {/* Action cards */}
          <motion.div
            className="w-full max-w-sm mt-10 flex flex-col gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {ACTION_CARDS.map((card, i) => (
              <motion.a
                key={card.id}
                href={card.href}
                className="group flex items-center justify-between px-5 py-4 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  textDecoration: 'none',
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{
                  background: 'rgba(47,109,255,0.08)',
                  borderColor: 'rgba(47,109,255,0.25)',
                }}
                whileTap={{ scale: 0.985 }}
              >
                <div>
                  <div
                    className="text-sm font-medium tracking-wide"
                    style={{ color: '#F5F5F5' }}
                  >
                    {card.label}
                  </div>
                  <div
                    className="text-[11px] mt-0.5 font-light"
                    style={{ color: 'rgba(245,245,245,0.4)' }}
                  >
                    {card.sub}
                  </div>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  style={{ color: 'rgba(47,109,255,0.6)' }}
                >
                  <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.a>
            ))}
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4 }}
          >
            <motion.span
              className="text-[9px] tracking-[0.4em] uppercase"
              style={{ color: 'rgba(245,245,245,0.18)' }}
              animate={{ opacity: [0.18, 0.38, 0.18] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              ↓ Explore the label
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
