'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'

export function Footer() {
  return (
    <footer id="connect" className="border-t border-white/[0.06] py-24 md:py-32">
      <div className="section-shell section-center">
        <div className="content-column flex flex-col items-center gap-14 text-center md:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="label-caps">Connect</p>
            <h2
              className="mt-5 font-extralight leading-[1.08] tracking-[-0.04em] text-white"
              style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)' }}
            >
              If the record fits, we will tell you.
              <br />
              If it does not, we will say that too.
            </h2>
          </motion.div>

          <motion.a
            href="mailto:hello@nothingrecords.com"
            className="inline-flex items-center gap-8 rounded-full border border-white/10 bg-white px-6 py-4 text-[14px] font-medium text-black transition-transform duration-300 hover:-translate-y-0.5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            hello@nothingrecords.com
            <ArrowUpRight size={18} weight="bold" />
          </motion.a>
        </div>
      </div>
    </footer>
  )
}
