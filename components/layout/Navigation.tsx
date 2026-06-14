'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Music', href: '#platforms' },
  { label: 'Releases', href: '#releases' },
  { label: 'Connect', href: '#social' },
]

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 300)
  }

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          padding: '0 24px',
          height: '60px',
          background: scrolled ? 'rgba(5,5,5,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : 'none',
          transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
        }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <a href="#" style={{ fontSize: '11px', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#F5F5F5', fontWeight: 300, textDecoration: 'none' }}
          aria-label="Nothing Records home">NOTHING RECORDS</a>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center justify-center"
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '16px' }}>
            <motion.span className="block" style={{ height: '1px', background: '#F5F5F5', transformOrigin: 'center' }}
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} />
            <motion.span className="block" style={{ height: '1px', background: '#F5F5F5' }}
              animate={{ opacity: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.18 }} />
            <motion.span className="block" style={{ height: '1px', background: '#F5F5F5', transformOrigin: 'center' }}
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} />
          </div>
        </button>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{ background: 'rgba(5,5,5,0.97)', backdropFilter: 'blur(24px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center" style={{ gap: '36px' }}>
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  style={{ fontSize: 'clamp(2.8rem, 14vw, 5rem)', fontWeight: 200, letterSpacing: '-0.02em', color: 'rgba(245,245,245,0.65)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', transition: 'color 0.25s ease' }}
                  className="hover:text-[#F5F5F5]"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ delay: i * 0.07 + 0.08, ease: [0.16, 1, 0.3, 1], duration: 0.55 }}
                >
                  {link.label}
                </motion.button>
              ))}
            </nav>
            <motion.p
              style={{ position: 'absolute', bottom: '36px', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(245,245,245,0.2)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            >
              Nothing Records — {new Date().getFullYear()}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
