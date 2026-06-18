'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'
import { useMemo, useState, useEffect, useRef } from 'react'

const SpotifyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.08)" />
    <path d="M7.2 9.4c3.5-1 6.8-.7 9.9.8" stroke="rgba(255,255,255,0.92)" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M8 12.1c2.8-.7 5.3-.45 7.7.72" stroke="rgba(255,255,255,0.78)" strokeWidth="1.55" strokeLinecap="round" />
    <path d="M8.9 14.7c2-.45 3.8-.25 5.5.55" stroke="rgba(255,255,255,0.62)" strokeWidth="1.45" strokeLinecap="round" />
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
    accentRgb: '111,255,163',
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
    accentRgb: '122,176,255',
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
    accentRgb: '214,182,255',
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
    accentRgb: '255,210,120',
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
    accentRgb: '255,146,146',
    tags: ['Demos', 'Unreleased', 'Sketches'],
  },
]

function Waveform({ activeColor, active }: { activeColor: string; active: boolean }) {
  const bars = useMemo(() => [34, 60, 42, 76, 54, 28, 68, 38, 58, 46, 70, 33], [])
  return (
    <div style={{ display: 'flex', alignItems: 'end', gap: 5, height: 48 }}>
      {bars.map((h, i) => (
        <motion.span
          key={i}
          animate={{ height: active ? h : Math.max(18, h * 0.74), opacity: active ? 1 : 0.42 }}
          transition={{ duration: 0.5, delay: active ? i * 0.015 : 0, ease: [0.22, 1, 0.36, 1] }}
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

/* ─── Mobile carousel card ─────────────────────────────────────────── */
function MobilePlaylistCard({
  playlist,
  index,
  isActive,
}: {
  playlist: typeof playlists[number]
  index: number
  isActive: boolean
}) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <a
      href={playlist.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        flexShrink: 0,
        width: 'calc(80vw)',
        maxWidth: 320,
        borderRadius: 24,
        border: `1px solid rgba(${playlist.accentRgb}, ${isActive ? 0.18 : 0.07})`,
        background: isActive
          ? `linear-gradient(160deg, rgba(${playlist.accentRgb},0.12) 0%, rgba(255,255,255,0.03) 100%)`
          : 'rgba(255,255,255,0.03)',
        boxShadow: isActive
          ? `0 24px 64px rgba(0,0,0,0.28), 0 0 0 1px rgba(${playlist.accentRgb},0.14)`
          : '0 8px 24px rgba(0,0,0,0.16)',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 24px 24px',
        gap: 0,
        transition: 'border-color 0.4s ease, background 0.4s ease, box-shadow 0.4s ease',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        scrollSnapAlign: 'center',
        willChange: 'transform',
        transform: isActive ? 'scale(1)' : 'scale(0.94)',
        opacity: isActive ? 1 : 0.62,
        transitionProperty: 'transform, opacity, border-color, background, box-shadow',
        transitionDuration: '0.4s',
        transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: `rgba(${playlist.accentRgb}, 0.85)`, lineHeight: 1 }}>
          {playlist.mood}
        </span>
        <span style={{ fontSize: 28, lineHeight: 0.9, letterSpacing: '-0.06em', color: isActive ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.28)', transition: 'color 0.4s ease' }}>
          {number}
        </span>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Waveform active={isActive} activeColor={playlist.waveColor} />
      </div>
      <h3 style={{ margin: 0, fontSize: 'clamp(20px, 6vw, 26px)', lineHeight: 1.0, letterSpacing: '-0.04em', color: '#fff', marginBottom: 12 }}>
        {playlist.title}
      </h3>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.52)', flex: 1, marginBottom: 20 }}>
        {playlist.description}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ padding: '6px 10px', borderRadius: 999, background: `rgba(${playlist.accentRgb}, 0.1)`, border: `1px solid rgba(${playlist.accentRgb}, 0.2)`, fontSize: 11, lineHeight: 1, letterSpacing: '0.04em', color: `rgba(${playlist.accentRgb}, 0.9)` }}>
            {playlist.tracks}
          </span>
          {playlist.tags.slice(0, 1).map((tag) => (
            <span key={tag} style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 11, lineHeight: 1, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.52)' }}>
              {tag}
            </span>
          ))}
        </div>
        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '999px', border: `1px solid rgba(${playlist.accentRgb}, ${isActive ? 0.3 : 0.1})`, background: isActive ? `rgba(${playlist.accentRgb}, 0.1)` : 'rgba(255,255,255,0.04)', color: isActive ? `rgb(${playlist.accentRgb})` : 'rgba(255,255,255,0.6)', transition: 'all 0.4s ease' }}>
          <ArrowUpRight size={16} weight="regular" />
        </span>
      </div>
    </a>
  )
}

/* ─── Dot indicators ───────────────────────────────────────────────── */
function CarouselDots({ total, active }: { total: number; active: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i === active ? 20 : 6,
            height: 6,
            borderRadius: 999,
            background: i === active ? '#fff' : 'rgba(255,255,255,0.22)',
            transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Main component ───────────────────────────────────────────────── */
export function PlaylistsSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!isMobile || !trackRef.current) return
    const cards = trackRef.current.querySelectorAll('[data-carousel-card]')
    if (!cards.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx)
            setActiveSlide(idx)
          }
        })
      },
      { root: trackRef.current, threshold: 0.55 }
    )
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [isMobile])

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
      id="playlists"
      style={{
        position: 'relative',
        padding: 'clamp(56px, 12vw, 180px) 0',
        background: '#050505',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* ── MOBILE LAYOUT ───────────────────────────────────────── */}
      {isMobile && (
        <div>
          <div className="section-shell">
            <motion.div
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.84)', fontSize: 12, lineHeight: 1, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 22 }}>
                <SpotifyIcon />
                Spotify
              </div>
              <h2 style={{ margin: 0, fontSize: 'clamp(40px, 11vw, 64px)', lineHeight: 0.92, letterSpacing: '-0.07em', color: '#fff' }}>
                Our Playlists.
              </h2>
              <p style={{ marginTop: 18, marginBottom: 0, maxWidth: '34ch', fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.52)' }}>
                Handpicked collections shaped as living listening routes, not static lists.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <div
              ref={trackRef}
              style={{ display: 'flex', gap: 14, overflowX: 'scroll', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingInline: 'calc((100vw - 80vw) / 2)', paddingBlock: '28px 8px', paddingRight: 'calc((100vw - 80vw) / 2)' }}
              className="carousel-track"
            >
              {playlists.map((playlist, index) => (
                <div key={playlist.title} data-carousel-card data-idx={index} style={{ scrollSnapAlign: 'center', flexShrink: 0 }}>
                  <MobilePlaylistCard playlist={playlist} index={index} isActive={activeSlide === index} />
                </div>
              ))}
            </div>
          </motion.div>

          <CarouselDots total={playlists.length} active={activeSlide} />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ textAlign: 'center', marginTop: 14, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}
          >
            Swipe to explore
          </motion.p>
        </div>
      )}

      {/* ── DESKTOP LAYOUT ──────────────────────────────────────── */}
      {!isMobile && (
        <div className="section-shell">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 0.9fr) minmax(0, 1.35fr)',
            gap: 'clamp(28px, 5vw, 72px)',
            alignItems: 'start',
          }}>
            {/* Sticky sidebar */}
            <div style={{ position: 'sticky', top: 120, alignSelf: 'start' }}>
              <motion.div
                initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.84)', fontSize: 12, lineHeight: 1, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 22 }}>
                  <SpotifyIcon />
                  Spotify
                </div>
                <h2 style={{ margin: 0, fontSize: 'clamp(40px, 8vw, 92px)', lineHeight: 0.92, letterSpacing: '-0.07em', color: '#fff', maxWidth: '8ch' }}>
                  Our<br />Playlists.
                </h2>
                <p style={{ marginTop: 24, marginBottom: 0, maxWidth: '28ch', fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,0.58)' }}>
                  Handpicked collections from the Nothing Records team — shaped as living listening routes, not static lists.
                </p>
              </motion.div>
            </div>

            {/* Desktop playlist cards */}
            <div onMouseLeave={() => setActiveIndex(null)} style={{ display: 'grid', gap: 10 }}>
              {playlists.map((playlist, index) => {
                const isActive = activeIndex === index
                const isIdle = activeIndex === null
                const number = String(index + 1).padStart(2, '0')
                const cardOpacity = isIdle ? 1 : isActive ? 1 : 0.72
                const cardScale = isIdle ? 1 : isActive ? 1 : 0.993

                /*
                 * FIX: No fixed height — cards are height:auto and sized by content.
                 * Collapse effect achieved by animating paddingBlock (idle→compact→active).
                 * overflow:visible so tall titles are never clipped.
                 * Title font capped at 34px to stay comfortable inside the card.
                 */
                const paddingTop = isIdle ? 20 : isActive ? 24 : 14
                const paddingBottom = isIdle ? 20 : isActive ? 24 : 14

                return (
                  <motion.a
                    key={playlist.title}
                    href={playlist.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onBlur={() => setActiveIndex(null)}
                    initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.24 }}
                    transition={{ duration: 0.7, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    animate={{
                      opacity: cardOpacity,
                      scale: cardScale,
                      paddingTop,
                      paddingBottom,
                    }}
                    style={{
                      position: 'relative',
                      display: 'block',
                      /* height:auto — content determines size, no clipping */
                      overflow: 'visible',
                      borderRadius: 24,
                      paddingLeft: 26,
                      paddingRight: 26,
                      border: isIdle
                        ? '1px solid rgba(255,255,255,0.065)'
                        : isActive
                          ? '1px solid rgba(255,255,255,0.1)'
                          : '1px solid rgba(255,255,255,0.05)',
                      background: isIdle
                        ? 'rgba(255,255,255,0.028)'
                        : isActive
                          ? `linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.024) 100%), ${playlist.color}`
                          : 'rgba(255,255,255,0.022)',
                      boxShadow: isActive ? '0 20px 56px rgba(0,0,0,0.22)' : '0 4px 16px rgba(0,0,0,0.10)',
                      textDecoration: 'none',
                      color: 'inherit',
                      backdropFilter: 'blur(18px)',
                      WebkitBackdropFilter: 'blur(18px)',
                      willChange: 'transform, opacity',
                      transition: 'border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease',
                    }}
                  >
                    {/* Radial highlight on hover */}
                    <motion.div
                      animate={{ opacity: isActive ? 0.72 : 0 }}
                      transition={softTransition}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 24,
                        background: 'radial-gradient(circle at 82% 28%, rgba(255,255,255,0.08), transparent 36%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Card inner grid */}
                    <div style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'grid',
                      gridTemplateColumns: '72px minmax(0, 1fr) auto',
                      gap: 20,
                      alignItems: 'start',
                    }}>
                      {/* Number */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 2 }}>
                        <motion.div
                          animate={{ color: isIdle ? 'rgba(255,255,255,0.4)' : isActive ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.28)' }}
                          transition={softTransition}
                          style={{ fontSize: 28, lineHeight: 1, letterSpacing: '-0.06em' }}
                        >
                          {number}
                        </motion.div>
                      </div>

                      {/* Title + description */}
                      <div style={{ minWidth: 0 }}>
                        {/* Eyebrow */}
                        <motion.div
                          animate={{ opacity: isIdle ? 0.4 : isActive ? 0.56 : 0.28 }}
                          transition={softTransition}
                          style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8, fontSize: 11, lineHeight: 1, letterSpacing: '0.22em', textTransform: 'uppercase' }}
                        >
                          <span>Spotify playlist</span>
                          <span style={{ width: 4, height: 4, borderRadius: 999, background: isActive ? '#6fff9f' : 'rgba(255,255,255,0.22)', flexShrink: 0 }} />
                          <span>{playlist.mood}</span>
                        </motion.div>

                        {/* Title — font capped at 34px so multi-word titles stay on 1-2 lines */}
                        <motion.h3
                          animate={{ opacity: isIdle ? 0.9 : isActive ? 1 : 0.62 }}
                          transition={softTransition}
                          style={{
                            margin: 0,
                            fontSize: 'clamp(18px, 2.4vw, 34px)',
                            lineHeight: 1.05,
                            letterSpacing: '-0.035em',
                            color: '#fff',
                            /* allow wrapping — never clip */
                            whiteSpace: 'normal',
                            overflowWrap: 'break-word',
                          }}
                        >
                          {playlist.title}
                        </motion.h3>

                        {/* Expandable description + tags */}
                        <motion.div
                          animate={{
                            opacity: isActive ? 1 : 0,
                            y: isActive ? 0 : 6,
                            // height:auto trick — animate maxHeight so layout is not clipped
                          }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: isActive ? 0.04 : 0 }}
                          style={{
                            overflow: 'hidden',
                            maxHeight: isActive ? 200 : 0,
                            pointerEvents: isActive ? 'auto' : 'none',
                            transition: 'max-height 0.45s cubic-bezier(0.22,1,0.36,1)',
                          }}
                        >
                          <p style={{ margin: '10px 0 8px', fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.62)' }}>
                            {playlist.description}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                            <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 11, lineHeight: 1, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.52)' }}>
                              {playlist.tracks}
                            </span>
                            {playlist.tags.map((tag) => (
                              <span key={tag} style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 11, lineHeight: 1, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.76)' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      </div>

                      {/* Right column: tracks count + arrow + waveform */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, minWidth: 150 }}>
                        {/* Tracks + arrow */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1 }}>
                          <motion.span animate={{ opacity: isIdle ? 0.76 : isActive ? 0.9 : 0.48 }} transition={softTransition}>
                            {playlist.tracks}
                          </motion.span>
                          <motion.span
                            animate={{ x: isActive ? 4 : 0, y: isActive ? -1 : 0, opacity: isIdle ? 0.8 : isActive ? 0.96 : 0.56, scale: isActive ? 1 : 0.975 }}
                            transition={springTransition}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 999, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.04)', color: '#fff', flexShrink: 0 }}
                          >
                            <ArrowUpRight size={18} weight="regular" />
                          </motion.span>
                        </div>

                        {/* Waveform — appears on hover */}
                        <motion.div
                          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 8, scale: isActive ? 1 : 0.992 }}
                          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: isActive ? 0.06 : 0 }}
                          style={{ width: 148, pointerEvents: 'none', transformOrigin: 'bottom right' }}
                        >
                          <Waveform active={isActive} activeColor={playlist.waveColor} />
                          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 11, lineHeight: 1, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
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
        </div>
      )}

      <style>{`.carousel-track::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}
