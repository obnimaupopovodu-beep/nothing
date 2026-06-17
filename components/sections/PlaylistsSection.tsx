'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
)

const playlists = [
  {
    title: 'Nothing Selections Vol. 1',
    description: 'Our curated picks — deep electronic, ambient and atmospheric cuts.',
    tracks: '24 tracks',
    href: 'https://open.spotify.com',
  },
  {
    title: 'Late Night Drives',
    description: 'Slow-rolling phonk and lo-fi for nocturnal hours.',
    tracks: '18 tracks',
    href: 'https://open.spotify.com',
  },
  {
    title: 'New Frequencies',
    description: 'Fresh submissions and emerging artists from our network.',
    tracks: '31 tracks',
    href: 'https://open.spotify.com',
  },
  {
    title: 'Label Essentials',
    description: 'The definitive Nothing Records listening experience from day one.',
    tracks: '42 tracks',
    href: 'https://open.spotify.com',
  },
  {
    title: 'Raw & Unreleased',
    description: 'Demos, sketches and unreleased material from our artists.',
    tracks: '11 tracks',
    href: 'https://open.spotify.com',
  },
]

export function PlaylistsSection() {
  return (
    <section
      id="playlists"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '96px 0' }}
      aria-label="Spotify playlists"
    >
      <div className="section-shell">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '80px' }}>

          {/* Left: heading */}
          <motion.div
            style={{ width: '260px', flexShrink: 0 }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="label-caps" style={{ marginBottom: '14px' }}>Spotify</p>
            <h2
              style={{
                fontSize: 'clamp(1.7rem, 2.8vw, 2.4rem)',
                fontWeight: 200,
                letterSpacing: '-0.04em',
                color: '#f0f0f0',
                lineHeight: 1.12,
                marginBottom: '16px',
              }}
            >
              Our
              <br />Playlists.
            </h2>
            <p style={{ fontSize: '13px', lineHeight: 1.75, color: 'rgba(240,240,240,0.38)', maxWidth: '24ch' }}>
              Handpicked collections from the Nothing Records team.
            </p>
          </motion.div>

          {/* Right: playlist list */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {playlists.map((playlist, index) => (
              <motion.a
                key={playlist.title}
                href={playlist.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: index * 0.05 + 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 0',
                    borderBottom: index < playlists.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <span
                    style={{
                      color: '#1DB954',
                      opacity: 0.7,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <SpotifyIcon />
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: 'rgba(240,240,240,0.82)',
                        letterSpacing: '-0.01em',
                        marginBottom: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {playlist.title}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: 'rgba(240,240,240,0.28)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {playlist.description}
                    </span>
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(240,240,240,0.22)', letterSpacing: '0.06em', flexShrink: 0 }}>
                    {playlist.tracks}
                  </span>
                  <ArrowUpRight size={13} weight="regular" style={{ color: 'rgba(240,240,240,0.18)', flexShrink: 0 }} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
