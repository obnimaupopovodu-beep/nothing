'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, Play } from '@phosphor-icons/react'
import { useRef, useState, useEffect } from 'react'

const SpotifyIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
)

// Акцентные цвета для каждой карточки (можно менять)
const colors = [
  { bg: 'from-[#1DB954] to-[#1ed760]', shadow: 'rgba(29,185,84,0.3)' },
  { bg: 'from-[#6c5ce7] to-[#a29bfe]', shadow: 'rgba(108,92,231,0.3)' },
  { bg: 'from-[#fdcb6e] to-[#f39c12]', shadow: 'rgba(253,203,110,0.3)' },
  { bg: 'from-[#e17055] to-[#d63031]', shadow: 'rgba(225,112,85,0.3)' },
  { bg: 'from-[#00cec9] to-[#0984e3]', shadow: 'rgba(0,206,201,0.3)' },
]

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Для анимации фонового шара
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 })

  const ballX = useTransform(springX, (val) => `${val}px`)
  const ballY = useTransform(springY, (val) => `${val}px`)

  // Получаем цвет для активной карточки
  const activeColor = hoveredIndex !== null ? colors[hoveredIndex % colors.length] : colors[0]

  return (
    <section
      id="playlists"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '96px 0', position: 'relative', overflow: 'hidden' }}
      aria-label="Spotify playlists"
      ref={containerRef}
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          mouseX.set(e.clientX - rect.left - rect.width / 2)
          mouseY.set(e.clientY - rect.top - rect.height / 2)
        }
      }}
    >
      {/* Фоновый шар – двигается за мышью и меняет цвет */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${hoveredIndex !== null ? activeColor.shadow : 'rgba(255,255,255,0.02)'} 0%, transparent 70%)`,
          translateX: '-50%',
          translateY: '-50%',
          x: ballX,
          y: ballY,
          pointerEvents: 'none',
          opacity: 0.6,
          transition: 'background 0.4s ease',
          zIndex: 0,
        }}
      />

      <div className="section-shell" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '80px', flexWrap: 'wrap' }}>

          {/* Left: heading (без изменений, только добавил анимацию) */}
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

          {/* Right: интерактивный список карточек */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {playlists.map((playlist, index) => {
              const color = colors[index % colors.length]
              const isHovered = hoveredIndex === index

              return (
                <motion.a
                  key={playlist.title}
                  href={playlist.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: index * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <motion.div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      background: isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                      backdropFilter: isHovered ? 'blur(8px)' : 'none',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'background 0.3s ease, border-color 0.3s ease',
                      cursor: 'pointer',
                    }}
                    whileHover={{
                      scale: 1.02,
                      borderColor: 'rgba(255,255,255,0.15)',
                      boxShadow: `0 8px 32px ${color.shadow}`,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {/* Псевдо-обложка – цветной градиент */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: `linear-gradient(135deg, ${color.shadow.replace('0.3', '0.8')}, ${color.shadow.replace('0.3', '0.2')})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '18px',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      {playlist.title.charAt(0)}
                    </div>

                    {/* Информация */}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: isHovered ? '#fff' : 'rgba(240,240,240,0.82)',
                          letterSpacing: '-0.01em',
                          marginBottom: '2px',
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {playlist.title}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '13px',
                          color: isHovered ? 'rgba(240,240,240,0.6)' : 'rgba(240,240,240,0.28)',
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {playlist.description}
                      </span>
                    </span>

                    {/* Количество треков */}
                    <span
                      style={{
                        fontSize: '12px',
                        color: isHovered ? 'rgba(240,240,240,0.5)' : 'rgba(240,240,240,0.22)',
                        letterSpacing: '0.06em',
                        flexShrink: 0,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {playlist.tracks}
                    </span>

                    {/* Кнопка Play + иконка Spotify – появляются при наведении */}
                    <motion.div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0,
                        color: isHovered ? '#1DB954' : 'rgba(240,240,240,0.18)',
                        transition: 'color 0.3s ease',
                      }}
                      animate={{ x: isHovered ? 0 : 4 }}
                    >
                      <SpotifyIcon size={16} />
                      <Play size={16} weight="fill" style={{ opacity: isHovered ? 1 : 0.4 }} />
                      <ArrowUpRight size={16} weight="regular" style={{ opacity: isHovered ? 1 : 0.4 }} />
                    </motion.div>
                  </motion.div>
                </motion.a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}