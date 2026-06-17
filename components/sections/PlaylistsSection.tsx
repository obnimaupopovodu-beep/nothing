'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'

const SpotifyIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.08)" />
    <path
      d="M7.2 9.4c3.5-1 6.8-.7 9.9.8"
      stroke="rgba(255,255,255,0.92)"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M8 12.1c2.8-.7 5.3-.45 7.7.72"
      stroke="rgba(255,255,255,0.78)"
      strokeWidth="1.55"
      strokeLinecap="round"
    />
    <path
      d="M8.9 14.7c2-.45 3.8-.25 5.5.55"
      stroke="rgba(255,255,255,0.62)"
      strokeWidth="1.45"
      strokeLinecap="round"
    />
  </svg>
)

const playlists = [
  {
    title: 'Nothing Selections Vol. 1',
    description: 'Our curated picks — deep electronic, ambient and atmospheric cuts.',
    tracks: '24 tracks',
    href: 'https://open.spotify.com',
    mood: 'Atmospheric',
    color: 'rgba(111, 255, 163, 0.10)',
    waveColor: 'rgba(111, 255, 163, 0.66)',
    tags: ['Ambient', 'Deep cuts', 'Label curation'],
  },
  {
    title: 'Late Night Drives',
    description: 'Slow-rolling phonk and lo-fi for nocturnal hours.',
    tracks: '18 tracks',
    href: 'https://open.spotify.com',
    mood: 'Night drive',
    color: 'rgba(122, 176, 255, 0.10)',
    waveColor: 'rgba(122, 176, 255, 0.66)',
    tags: ['Phonk', 'Lo-fi', 'Nocturnal'],
  },
  {
    title: 'New Frequencies',
    description: 'Fresh submissions and emerging artists from our network.',
    tracks: '31 tracks',
    href: 'https://open.spotify.com',
    mood: 'Discovery',
    color: 'rgba(214, 182, 255, 0.10)',
    waveColor: 'rgba(214, 182, 255, 0.68)',
    tags: ['New artists', 'Fresh finds', 'Network'],
  },
  {
    title: 'Label Essentials',
    description: 'The definitive Nothing Records listening experience from day one.',
    tracks: '42 tracks',
    href: 'https://open.spotify.com',
    mood: 'Core catalog',
    color: 'rgba(255, 210, 120, 0.10)',
    waveColor: 'rgba(255, 210, 120, 0.68)',
    tags: ['Essentials', 'Catalog', 'Start here'],
  },
  {
    title: 'Raw & Unreleased',
    description: 'Demos, sketches and unreleased material from our artists.',
    tracks: '11 tracks',
    href: 'https://open.spotify.com',
    mood: 'Behind the scenes',
    color: 'rgba(255, 146, 146, 0.10)',
    waveColor: 'rgba(255, 146, 146, 0.68)',
    tags: ['Demos', 'Unreleased', 'Sketches'],
  },
]

function Waveform({
  activeColor,
  active,
}: {
  activeColor: string
  active: boolean
}) {
  const bars = useMemo(() => [34, 60, 42, 76, 54, 28, 68, 38, 58, 46, 70, 33], [])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'end',
        gap: 5,
        height: 48,
      }}
    >
      {bars.map((h, i) => (
        <motion.span
          key={i}
          animate={{
            height: active ? h : Math.max(18, h * 0.74),
            opacity: active ? 1 : 0.42,
          }}
          transition={{
            duration: 0.5,
            delay: active ? i * 0.015 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            width: 4,
            borderRadius: 999,
            background: active
              ? `linear-gradient(180deg, rgba(255,255,255,0.88) 0%, ${activeColor} 100%)`
              : 'rgba(255,255,255,0.18)',
          }}
        />
      ))}
    </div>
  )
}

export function PlaylistsSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const springTransition = {
    type: 'spring' as const,
    stiffness: 82,
    damping: 24,
    mass: 1.02,
  }

  const softTransition = {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(96px, 12vw, 180px) 24px',
        background: '#050505',
        color: '#fff',
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(0, 1.35fr)',
          gap: 'clamp(28px, 5vw, 72px)',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 120,
            alignSelf: 'start',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.84)',
                fontSize: 12,
                lineHeight: 1,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 22,
              }}
            >
              <SpotifyIcon />
              Spotify
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(46px, 6vw, 92px)',
                lineHeight: 0.92,
                letterSpacing: '-0.07em',
                color: '#fff',
                maxWidth: '8ch',
              }}
            >
              Our
              <br />
              Playlists.
            </h2>

            <p
              style={{
                marginTop: 24,
                marginBottom: 0,
                maxWidth: '28ch',
                fontSize: 16,
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.58)',
              }}
            >
              Handpicked collections from the Nothing Records team — shaped as living
              listening routes, not static lists.
            </p>
          </motion.div>
        </div>

        <div
          onMouseLeave={() => setActiveIndex(null)}
          style={{
            display: 'grid',
            gap: 14,
          }}
        >
          {playlists.map((playlist, index) => {
            const isActive = activeIndex === index
            const isIdle = activeIndex === null
            const number = String(index + 1).padStart(2, '0')

            return (
              <motion.a
                key={playlist.title}
                href={playlist.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                onTouchStart={() => setActiveIndex(index)}
                initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.24 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                animate={{
                  height: isIdle ? 140 : isActive ? 194 : 122,
                  opacity: isIdle ? 1 : isActive ? 1 : 0.78,
                  y: isIdle ? 0 : isActive ? -1 : 0,
                  scale: isIdle ? 1 : isActive ? 1 : 0.992,
                }}
                style={{
                  position: 'relative',
                  display: 'block',
                  overflow: 'hidden',
                  borderRadius: 30,
                  border: isIdle
                    ? '1px solid rgba(255,255,255,0.065)'
                    : isActive
                      ? '1px solid rgba(255,255,255,0.1)'
                      : '1px solid rgba(255,255,255,0.055)',
                  background: isIdle
                    ? 'rgba(255,255,255,0.028)'
                    : isActive
                      ? `linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.024) 100%), ${playlist.color}`
                      : 'rgba(255,255,255,0.024)',
                  boxShadow: isIdle
                    ? '0 12px 28px rgba(0,0,0,0.14)'
                    : isActive
                      ? '0 20px 56px rgba(0,0,0,0.22)'
                      : '0 10px 24px rgba(0,0,0,0.12)',
                  textDecoration: 'none',
                  color: 'inherit',
                  backdropFilter: 'blur(18px)',
                  willChange: 'transform, height, opacity',
                }}
              >
                <motion.div
                  animate={{
                    opacity: isActive ? 0.72 : 0,
                  }}
                  transition={softTransition}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'radial-gradient(circle at 82% 28%, rgba(255,255,255,0.08), transparent 36%)',
                    pointerEvents: 'none',
                  }}
                />

                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    display: 'grid',
                    gridTemplateColumns: '88px minmax(0, 1fr) auto',
                    gap: 22,
                    padding: '24px 26px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <motion.div
                      animate={{
                        color: isIdle
                          ? 'rgba(255,255,255,0.4)'
                          : isActive
                            ? 'rgba(255,255,255,0.94)'
                            : 'rgba(255,255,255,0.3)',
                      }}
                      transition={softTransition}
                      style={{
                        fontSize: 32,
                        lineHeight: 0.9,
                        letterSpacing: '-0.06em',
                      }}
                    >
                      {number}
                    </motion.div>
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <motion.div
                        animate={{
                          opacity: isIdle ? 0.4 : isActive ? 0.56 : 0.3,
                        }}
                        transition={softTransition}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 10,
                          fontSize: 11,
                          lineHeight: 1,
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                        }}
                      >
                        <span>Spotify playlist</span>
                        <span
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: '999px',
                            background: isIdle
                              ? 'rgba(255,255,255,0.22)'
                              : isActive
                                ? '#6fff9f'
                                : 'rgba(255,255,255,0.16)',
                          }}
                        />
                        <span>{playlist.mood}</span>
                      </motion.div>

                      <motion.h3
                        animate={{
                          opacity: isIdle ? 0.9 : isActive ? 1 : 0.68,
                        }}
                        transition={softTransition}
                        style={{
                          margin: 0,
                          fontSize: 'clamp(28px, 3.2vw, 46px)',
                          lineHeight: 0.96,
                          letterSpacing: '-0.06em',
                          color: '#fff',
                          maxWidth: isActive ? '13ch' : '16ch',
                        }}
                      >
                        {playlist.title}
                      </motion.h3>
                    </div>

                    <motion.div
                      animate={{
                        opacity: isActive ? 1 : 0,
                        y: isActive ? 0 : 10,
                        scale: isActive ? 1 : 0.99,
                      }}
                      transition={{
                        duration: 0.58,
                        ease: [0.22, 1, 0.36, 1],
                        delay: isActive ? 0.04 : 0,
                      }}
                      style={{
                        overflow: 'hidden',
                        pointerEvents: isActive ? 'auto' : 'none',
                        transformOrigin: 'top left',
                      }}
                    >
                      <p
                        style={{
                          margin: '16px 0 14px',
                          fontSize: 15,
                          lineHeight: 1.65,
                          color: 'rgba(255,255,255,0.62)',
                          maxWidth: '48ch',
                        }}
                      >
                        {playlist.description}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        {playlist.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: '9px 12px',
                              borderRadius: 999,
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.07)',
                              fontSize: 12,
                              lineHeight: 1,
                              letterSpacing: '0.04em',
                              color: 'rgba(255,255,255,0.76)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  <div
                    style={{
                      minWidth: 170,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        color: 'rgba(255,255,255,0.72)',
                        fontSize: 14,
                        lineHeight: 1,
                      }}
                    >
                      <motion.span
                        animate={{
                          opacity: isIdle ? 0.76 : isActive ? 0.9 : 0.52,
                        }}
                        transition={softTransition}
                      >
                        {playlist.tracks}
                      </motion.span>

                      <motion.span
                        animate={{
                          x: isActive ? 5 : 0,
                          y: isActive ? -1 : 0,
                          opacity: isIdle ? 0.8 : isActive ? 0.96 : 0.62,
                          scale: isActive ? 1 : 0.975,
                        }}
                        transition={springTransition}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: '999px',
                          border: '1px solid rgba(255,255,255,0.09)',
                          background: 'rgba(255,255,255,0.04)',
                          color: '#fff',
                        }}
                      >
                        <ArrowUpRight size={18} weight="regular" />
                      </motion.span>
                    </div>

                    <motion.div
                      animate={{
                        opacity: isActive ? 1 : 0,
                        y: isActive ? 0 : 8,
                        scale: isActive ? 1 : 0.992,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                        delay: isActive ? 0.06 : 0,
                      }}
                      style={{
                        width: 148,
                        pointerEvents: 'none',
                        transformOrigin: 'bottom right',
                      }}
                    >
                      <Waveform active={isActive} activeColor={playlist.waveColor} />

                      <div
                        style={{
                          marginTop: 12,
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          lineHeight: 1,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.38)',
                        }}
                      >
                        <span>Preview</span>
                        <span>Open playlist</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}