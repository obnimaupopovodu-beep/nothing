'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'

const navLinks = [
  { label: 'Explore', href: '#explore' },
  { label: 'Connect', href: '#connect' },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8"
        style={{
          background: scrolled ? 'rgba(5,5,5,0.72)' : 'transparent',
          backdropFilter: scrolled ? 'blur(22px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
          transition: 'background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease',
        }}
      >
        <a
          href="#explore"
          className="inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.38em] uppercase text-white/86"
          aria-label="Nothing Records home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(127,176,255,0.92)] shadow-[0_0_24px_rgba(127,176,255,0.55)]" />
          </span>
          Nothing Records
        </a>

        <nav className="flex items-center gap-2">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleNavClick(link.href)}
              className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] tracking-[0.26em] uppercase text-white/66 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white md:inline-flex"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNavClick('#connect')}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white text-[11px] tracking-[0.26em] uppercase text-black transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 md:px-4 md:py-2 px-3 py-2"
          >
            Start
            <ArrowRight size={14} weight="bold" />
          </button>
        </nav>
      </div>
    </motion.header>
  )
}
