'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Music', href: '#platforms' },
  { label: 'Releases', href: '#release' },
  { label: 'Connect', href: '#social' },
]

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    setTimeout(() => {
      const el = document.querySelector(href)
      el?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: scrolled ? 'rgba(5,5,5,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          transition: 'background 0.5s ease, backdrop-filter 0.5s ease',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : 'none',
        }}
      >
        <a
          href="#"
          className="text-[#F5F5F5] font-light tracking-[0.35em] text-xs uppercase select-none"
          aria-label="Aurora home"
        >
          AURORA
        </a>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative w-11 h-11 rounded-full glass flex items-center justify-center transition-all duration-300 hover:border-[rgba(47,109,255,0.3)]"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <div className="flex flex-col gap-[5px] w-[16px]">
            <motion.span
              className="block h-px bg-[#F5F5F5] origin-center"
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.span
              className="block h-px bg-[#F5F5F5]"
              animate={{ opacity: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block h-px bg-[#F5F5F5] origin-center"
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </button>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ background: 'rgba(5,5,5,0.97)', backdropFilter: 'blur(24px)' }}
          >
            <nav className="flex flex-col items-center gap-10">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="text-5xl md:text-7xl font-extralight tracking-tight text-[rgba(245,245,245,0.7)] hover:text-[#F5F5F5] transition-colors duration-300 uppercase cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ delay: i * 0.08 + 0.1, ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                >
                  {link.label}
                </motion.button>
              ))}
            </nav>
            <motion.p
              className="absolute bottom-10 text-[10px] tracking-[0.35em] text-[rgba(245,245,245,0.25)] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Music / Culture / Frequency
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
