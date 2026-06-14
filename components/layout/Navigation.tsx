'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'

const navLinks = [
  { label: 'Explore', href: '#explore' },
  { label: 'Platforms', href: '#platforms' },
  { label: 'Social', href: '#social' },
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
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="section-shell flex h-[68px] items-center justify-between"
        style={{
          background: scrolled ? 'rgba(5,5,5,0.78)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
          transition: 'background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease',
        }}
      >
        <a
          href="#explore"
          className="inline-flex items-center gap-2.5 text-[11px] font-medium tracking-[0.28em] uppercase text-white/85"
          aria-label="Nothing Records home"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <span className="h-2 w-2 rounded-full bg-[#7fb0ff] shadow-[0_0_20px_rgba(127,176,255,0.5)]" />
          </span>
          Nothing Records
        </a>

        <nav className="flex items-center gap-1.5 md:gap-2">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleNavClick(link.href)}
              className="hidden rounded-full px-3.5 py-2 text-[11px] font-medium tracking-[0.18em] uppercase text-white/55 transition-colors duration-300 hover:text-white md:inline-flex"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNavClick('#connect')}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-black transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 md:px-4"
          >
            Start
            <ArrowRight size={13} weight="bold" />
          </button>
        </nav>
      </div>
    </motion.header>
  )
}
