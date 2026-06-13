'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useMouse } from '@/hooks/useMouse'

const Scene = dynamic(
  () => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })),
  { ssr: false, loading: () => null }
)

export function HeroSection() {
  const mouse = useMouse()

  return (
    <section
      id="hero"
      className="relative w-full h-dvh flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* WebGL Canvas */}
      <div className="absolute inset-0 z-0">
        <Scene mouseX={mouse.x} mouseY={mouse.y} />
      </div>

      {/* Radial vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 25%, rgba(5,5,5,0.7) 65%, #050505 100%)',
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #050505)' }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 select-none pointer-events-none">
        <motion.p
          className="text-[10px] tracking-[0.48em] text-[rgba(245,245,245,0.35)] uppercase mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Music / Culture / Frequency
        </motion.p>

        <motion.h1
          className="font-extralight leading-none tracking-[-0.04em] text-[#F5F5F5]"
          style={{ fontSize: 'clamp(5rem, 20vw, 16rem)' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          AURORA
        </motion.h1>

        <motion.p
          className="mt-6 text-sm text-[rgba(245,245,245,0.4)] font-light tracking-wide max-w-[260px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          Electronic music label and creative collective.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        <span className="text-[9px] tracking-[0.4em] text-[rgba(245,245,245,0.2)] uppercase">Scroll</span>
        <motion.div
          className="w-px h-10 origin-top"
          style={{ background: 'linear-gradient(to bottom, rgba(47,109,255,0.5), transparent)' }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
