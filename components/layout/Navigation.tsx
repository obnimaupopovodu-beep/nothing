'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'How we work',  href: '#releases'  },
  { label: 'Platforms', href: '#platforms' },
  { label: 'Playlists', href: '#playlists' },
  { label: 'Socials',   href: '#social'    },
  { label: 'FAQ',       href: '#faq'       },
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

  const go = (href: string) => {
    setMenuOpen(false)
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  return (
    <motion.header
      className="nav"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background:     scrolled || menuOpen ? 'rgba(4,6,14,0.68)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(18px)' : 'none',
        WebkitBackdropFilter: scrolled || menuOpen ? 'blur(18px)' : 'none',
        borderBottom:   scrolled || menuOpen ? '1px solid var(--line-soft)' : '1px solid transparent',
      }}
    >
      <div className="shell nav-in">
        <a href="#top" className="brand" onClick={(e) => { e.preventDefault(); go('#top') }}>
          NB<span>.</span>
        </a>

        <nav className="nav-links hide-mobile" aria-label="Primary">
          {navLinks.map((l) => (
            <button key={l.label} type="button" onClick={() => go(l.href)}>
              {l.label}
            </button>
          ))}
          <button type="button" className="btn btn-ghost nav-cta" onClick={() => go('#demo')}>
            Submit a track
          </button>
        </nav>

        <button
          type="button"
          className="burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <motion.span animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} />
          <motion.span animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="shell">
              {navLinks.map((l) => (
                <button key={l.label} type="button" className="drawer-link" onClick={() => go(l.href)}>
                  {l.label}
                </button>
              ))}
              <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 18 }} onClick={() => go('#demo')}>
                Submit a track
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        :global(.nav) {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          transition: background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease;
        }
        .nav-in {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .brand {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--ink);
          text-decoration: none;
        }
        .brand span { color: var(--blue-soft); }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 26px;
          white-space: nowrap;
        }
        .nav-links button {
          background: none;
          border: 0;
          cursor: pointer;
          font: inherit;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--ink-2);
          transition: color 0.25s ease;
        }
        .nav-links button:hover { color: var(--ink); }
        .nav-links :global(.nav-cta) {
          margin-left: 4px;
          padding: 10px 20px;
          min-height: 40px;
          font-size: 12px;
          letter-spacing: 0.06em;
        }
        .burger {
          display: none;
          width: 44px;
          height: 44px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--glass);
          cursor: pointer;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex-shrink: 0;
        }
        .burger :global(span) {
          display: block;
          width: 16px;
          height: 1.5px;
          background: var(--ink);
        }
        :global(.nav-drawer) {
          background: rgba(4, 6, 14, 0.97);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--line);
          padding: 8px 0 24px;
        }
        .drawer-link {
          display: block;
          width: 100%;
          text-align: left;
          padding: 15px 0;
          min-height: 48px;
          background: none;
          border: 0;
          border-bottom: 1px solid var(--line-soft);
          font: inherit;
          font-size: 15px;
          font-weight: 600;
          color: var(--ink-2);
          cursor: pointer;
        }
        .drawer-link:hover { color: var(--ink); }
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .burger { display: flex; }
        }
      `}</style>
    </motion.header>
  )
}
