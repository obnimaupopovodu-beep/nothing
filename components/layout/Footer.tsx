'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'

export function Footer() {
  return (
    <footer
      id="connect"
      className="border-t border-white/8 px-5 py-10 md:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-[10px] tracking-[0.42em] uppercase text-white/34">
            Connect
          </p>
          <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.4rem)] font-extralight tracking-[-0.05em] text-white">
            If the record fits, we will tell you. If it does not, we will say that too.
          </h2>
        </motion.div>

        <motion.a
          href="mailto:hello@nothingrecords.com"
          className="inline-flex items-center justify-between gap-10 rounded-full border border-white/10 bg-white px-5 py-4 text-sm font-medium text-black transition-transform duration-300 hover:-translate-y-0.5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          hello@nothingrecords.com
          <ArrowUpRight size={18} weight="bold" />
        </motion.a>
      </div>
    </footer>
  )
}
