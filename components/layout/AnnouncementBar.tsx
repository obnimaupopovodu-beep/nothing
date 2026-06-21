'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PLAYLISTS = [
  { title: 'Nothing Selections Vol. 1', accent: '111,255,163' },
  { title: 'Late Night Drives',          accent: '122,176,255' },
  { title: 'New Frequencies',            accent: '214,182,255' },
  { title: 'Label Essentials',           accent: '255,210,120' },
  { title: 'Raw & Unreleased',           accent: '255,146,146' },
]

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true)

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          key="announcement-bar"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden', position: 'relative', zIndex: 60 }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.035)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 clamp(16px, 4vw, 40px)',
                height: 42,
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(8px, 2vw, 20px)',
              }}
            >
              {/* Left label */}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  flexShrink: 0,
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.38)',
                  whiteSpace: 'nowrap',
                }}
              >
                {/* Spotify mini icon */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.07)" />
                  <path d="M7.2 9.4c3.5-1 6.8-.7 9.9.8"  stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M8 12.1c2.8-.7 5.3-.45 7.7.72" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M8.9 14.7c2-.45 3.8-.25 5.5.55" stroke="rgba(255,255,255,0.4)"  strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Now on Spotify
              </span>

              {/* Divider */}
              <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.09)', flexShrink: 0 }} />

              {/* Playlist chips — scrollable on narrow screens */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flex: 1,
                  minWidth: 0,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 90%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 90%, transparent 100%)',
                  paddingInline: 4,
                }}
                className="ann-chips"
              >
                {PLAYLISTS.map((p) => (
                  <a
                    key={p.title}
                    href="#playlists"
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      borderRadius: 999,
                      border: `1px solid rgba(${p.accent}, 0.18)`,
                      background: `rgba(${p.accent}, 0.07)`,
                      fontSize: 10,
                      lineHeight: 1,
                      letterSpacing: '0.06em',
                      color: `rgba(${p.accent}, 0.9)`,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.2s ease, border-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `rgba(${p.accent}, 0.15)`
                      e.currentTarget.style.borderColor = `rgba(${p.accent}, 0.35)`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `rgba(${p.accent}, 0.07)`
                      e.currentTarget.style.borderColor = `rgba(${p.accent}, 0.18)`
                    }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: `rgba(${p.accent}, 0.8)`,
                        flexShrink: 0,
                      }}
                    />
                    {p.title}
                  </a>
                ))}
              </div>

              {/* View all button */}
              <a
                href="#playlists"
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 13px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.13)',
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: 10,
                  lineHeight: 1,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                }}
              >
                View all
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 8L8 2M8 2H4M8 2v4" />
                </svg>
              </a>

              {/* Divider */}
              <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.09)', flexShrink: 0 }} />

              {/* Close */}
              <button
                onClick={() => setVisible(false)}
                aria-label="Dismiss"
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.28)',
                  transition: 'color 0.2s ease, background 0.2s ease',
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.28)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M2 2l8 8M10 2L2 10" />
                </svg>
              </button>
            </div>
          </div>
          <style>{`.ann-chips::-webkit-scrollbar { display: none; }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
