'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const tracks = [
  { n: '01', title: 'Subzero Cascade' },
  { n: '02', title: 'Drift Protocol' },
  { n: '03', title: 'Phantom Frequency' },
  { n: '04', title: 'Collapse Theory' },
  { n: '05', title: 'Void Signal' },
  { n: '06', title: 'Meridian Night' },
]

export function FeaturedRelease() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <section
        id="release"
        className="relative px-5 md:px-10 py-28 md:py-40"
        aria-label="Featured release"
      >
        <div className="max-w-5xl mx-auto">
          <motion.p
            className="text-[10px] tracking-[0.45em] text-[rgba(245,245,245,0.3)] uppercase mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
          >
            Featured Release
          </motion.p>

          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-start">
            {/* Album art */}
            <motion.div
              className="w-full md:w-72 flex-shrink-0"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="aspect-square rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #0a0a14 0%, #0d1a3a 50%, #050510 100%)',
                  border: '1px solid rgba(47,109,255,0.12)',
                  boxShadow: '0 0 60px rgba(47,109,255,0.08), 0 32px 64px rgba(0,0,0,0.6)',
                }}
              >
                {/* Abstract album art */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse 70% 70% at 30% 40%, rgba(47,109,255,0.15) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(20,60,180,0.08) 0%, transparent 60%)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Minimal geometric mark */}
                  <svg width="80" height="100" viewBox="0 0 80 100" fill="none" aria-hidden="true">
                    <path d="M20 92L8 8h64L60 92H20z" stroke="rgba(47,109,255,0.4)" strokeWidth="1"/>
                    <path d="M28 80L18 20h44L52 80H28z" fill="rgba(47,109,255,0.06)" stroke="rgba(47,109,255,0.2)" strokeWidth="0.5"/>
                    <path d="M36 68L28 32h24L52 68H36z" fill="rgba(47,109,255,0.1)"/>
                  </svg>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(47,109,255,0.4), transparent)' }}
                />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              className="flex flex-col gap-8 flex-1"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <p className="text-[10px] tracking-[0.35em] text-[rgba(245,245,245,0.3)] uppercase mb-3">2025</p>
                <h2
                  className="font-extralight text-[#F5F5F5] leading-none tracking-tight"
                  style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
                >
                  Subzero
                </h2>
                <h2
                  className="font-extralight leading-none tracking-tight"
                  style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', color: 'rgba(245,245,245,0.25)' }}
                >
                  Cascade EP
                </h2>
              </div>

              {/* Track list */}
              <ul className="flex flex-col gap-0 border-t border-white/[0.05]">
                {tracks.map((t, i) => (
                  <motion.li
                    key={t.n}
                    className="flex items-center gap-5 py-3.5 border-b border-white/[0.05] group cursor-default"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 + 0.3, duration: 0.5 }}
                  >
                    <span className="text-[11px] text-[rgba(245,245,245,0.2)] font-light tabular-nums w-5">{t.n}</span>
                    <span className="text-sm text-[rgba(245,245,245,0.7)] font-light group-hover:text-[#F5F5F5] transition-colors duration-200">{t.title}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                onClick={() => setModalOpen(true)}
                className="self-start flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-light tracking-wide text-[#F5F5F5] transition-all duration-300"
                style={{
                  background: '#2F6DFF',
                  boxShadow: '0 0 30px rgba(47,109,255,0.2)',
                }}
                whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(47,109,255,0.35)' }}
                whileTap={{ scale: 0.97 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Listen Now
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Embedded Player Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setModalOpen(false)}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            />
            <motion.div
              className="relative w-full max-w-lg rounded-3xl overflow-hidden"
              style={{
                background: '#0B0B0B',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
              }}
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
                <p className="text-sm text-[rgba(245,245,245,0.6)] font-light tracking-wide">Subzero Cascade EP</p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[rgba(245,245,245,0.4)] hover:text-[#F5F5F5] transition-colors"
                  aria-label="Close player"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="p-6">
                {/* Spotify embed placeholder (replace src with real URI) */}
                <iframe
                  src="https://open.spotify.com/embed/playlist/37i9dQZF1DX6J5NfMJS675?utm_source=generator&theme=0"
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl"
                  title="Spotify Player"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
