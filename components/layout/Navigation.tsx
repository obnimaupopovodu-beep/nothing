'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'About',         href: '#about'    },
  { label: 'Our Playlists', href: '#playlists' },
  { label: 'Our Socials',   href: '#social'   },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="section-shell flex h-[64px] items-center justify-between"
        style={{
          background:     scrolled || menuOpen ? 'rgba(0,0,0,0.90)'          : 'transparent',
          backdropFilter: scrolled || menuOpen ? 'blur(24px) saturate(1.1)' : 'none',
          borderBottom:   scrolled || menuOpen ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          transition: 'background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease',
        }}
      >
        {/* Wordmark — monochrome dot */}
        <a href="/" className="inline-flex items-center gap-2.5" aria-label="Nothing Records home" style={{ textDecoration: 'none' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FFFFFF', opacity: 0.85 }} />
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(250,250,250,0.88)' }}>
            Nothing Records
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <button key={link.label} type="button" onClick={() => handleNavClick(link.href)}
              style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(250,250,250,0.40)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.18s ease', borderRadius: '6px', minHeight: '44px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,0.88)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,0.40)')}
            >
              {link.label}
            </button>
          ))}
          {/* Primary CTA — pill */}
          <button type="button" onClick={() => handleNavClick('#connect')}
            style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center', padding: '9px 22px', borderRadius: '9999px', background: '#FAFAFA', color: '#09090B', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', transition: 'background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease', minHeight: '44px' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,255,255,0.10)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAFA';  e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'none' }}
            onMouseDown={(e)  => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            Submit a track
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} className="sm:hidden"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '5px', width: '44px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', padding: '0', flexShrink: 0 }}
        >
          <motion.span animate={menuOpen ? { rotate: 45,  y:  7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'block', width: '20px', height: '1px', background: 'rgba(250,250,250,0.82)', transformOrigin: 'center' }} />
          <motion.span animate={menuOpen ? { opacity: 0 }          : { opacity: 1 }}        transition={{ duration: 0.2 }}                                                                                                                                     style={{ display: 'block', width: '14px', height: '1px', background: 'rgba(250,250,250,0.82)', alignSelf: 'flex-start', marginLeft: '12px' }} />
          <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'block', width: '20px', height: '1px', background: 'rgba(250,250,250,0.82)', transformOrigin: 'center' }} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '8px 0 20px' }}
          >
            <div className="section-shell" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navLinks.map((link) => (
                <button key={link.label} type="button" onClick={() => handleNavClick(link.href)}
                  style={{ width: '100%', textAlign: 'left', padding: '14px 0', fontSize: '13px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(250,250,250,0.60)', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', minHeight: '48px' }}
                >
                  {link.label}
                </button>
              ))}
              <button type="button" onClick={() => handleNavClick('#connect')}
                style={{ marginTop: '12px', width: '100%', padding: '14px', borderRadius: '9999px', background: '#FAFAFA', color: '#09090B', fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', minHeight: '48px' }}
              >
                Submit a track
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
