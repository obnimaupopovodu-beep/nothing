'use client'

import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer className="px-6 md:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/[0.04]">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3"
      >
        {/* Logo mark — minimal SVG monolith */}
        <svg width="18" height="24" viewBox="0 0 18 24" fill="none" aria-hidden="true">
          <path d="M3 22L1 2h16l-2 20H3z" stroke="rgba(47,109,255,0.5)" strokeWidth="1" fill="none"/>
          <path d="M5 18L3.5 6h11L13 18H5z" fill="rgba(47,109,255,0.12)"/>
        </svg>
        <span className="text-xs tracking-[0.3em] text-[rgba(245,245,245,0.3)] uppercase font-light">Aurora</span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-[11px] tracking-widest text-[rgba(245,245,245,0.2)] uppercase"
      >
        &copy; {new Date().getFullYear()} Aurora. All rights reserved.
      </motion.p>
    </footer>
  )
}
