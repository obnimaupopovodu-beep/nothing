'use client'

import { EverywhereReveal } from '@/components/animations/EverywhereReveal'
import { platforms } from '@/components/data/platforms'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'
import { useRef, useEffect, useState } from 'react'

/* ── Featured tier: top 3 get large cards ─────────────────────────────── */
const FEATURED_COUNT = 3
const featuredPlatforms = platforms.slice(0, FEATURED_COUNT)
const restPlatforms = platforms.slice(FEATURED_COUNT)

/* ── Helpers ───────────────────────────────────────────────────────────── */
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16)
    const g = parseInt(clean[1] + clean[1], 16)
    const b = parseInt(clean[2] + clean[2], 16)
    return `${r},${g},${b}`
  }
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `${r},${g},${b}`
}

/* ── Featured card ─────────────────────────────────────────────────────── */
function FeaturedCard({
  platform,
  index,
}: {
  platform: typeof platforms[number]
  index: number
}) {
  const [hovered, setHovered] = useState(false)
  const rgb = hexToRgb(platform.squareBg)

  return (
    <motion.a
      href={platform.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(20px, 4vw, 28px)',
        borderRadius: 20,
        border: `1px solid rgba(${rgb}, ${hovered ? 0.28 : 0.1})`,
        background: hovered
          ? `linear-gradient(145deg, rgba(${rgb},0.12) 0%, rgba(255,255,255,0.03) 100%)`
          : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: hovered
          ? `0 16px 48px rgba(0,0,0,0.24), 0 0 0 1px rgba(${rgb},0.16)`
          : '0 4px 16px rgba(0,0,0,0.12)',
        transition: 'border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease',
        cursor: 'pointer',
        minHeight: 'clamp(120px, 20vw, 160px)',
        color: 'inherit',
      }}
    >
      {/* top row: icon + arrow */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 12,
          background: hovered ? `rgba(${rgb},0.18)` : 'rgba(255,255,255,0.06)',
          transition: 'background 0.35s ease',
          flexShrink: 0,
        }}>
          <span style={{ color: hovered ? `rgb(${rgb})` : 'rgba(255,255,255,0.7)', transition: 'color 0.35s ease', display: 'flex' }}>
            <PlatformIcon platform={platform} size={18} />
          </span>
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 999,
          border: `1px solid rgba(${rgb}, ${hovered ? 0.3 : 0.1})`,
          background: hovered ? `rgba(${rgb},0.1)` : 'rgba(255,255,255,0.04)',
          color: hovered ? `rgb(${rgb})` : 'rgba(255,255,255,0.4)',
          transition: 'all 0.35s ease',
          transform: hovered ? 'translate(2px,-2px)' : 'translate(0,0)',
        }}>
          <ArrowUpRight size={14} weight="regular" />
        </span>
      </div>

      {/* bottom: name + desc */}
      <div>
        <div style={{
          fontSize: 'clamp(16px, 3.5vw, 20px)',
          fontWeight: 500,
          letterSpacing: '-0.03em',
          color: hovered ? '#fff' : 'rgba(255,255,255,0.88)',
          transition: 'color 0.25s ease',
          lineHeight: 1.1,
          marginBottom: 6,
        }}>
          {platform.name}
        </div>
        <div style={{
          fontSize: 12,
          letterSpacing: '0.01em',
          color: `rgba(${rgb}, ${hovered ? 0.82 : 0.42})`,
          lineHeight: 1.4,
          transition: 'color 0.35s ease',
        }}>
          {platform.desc}
        </div>
      </div>
    </motion.a>
  )
}

/* ── Standard list row ─────────────────────────────────────────────────── */
function PlatformRow({
  platform,
  index,
  isLast,
}: {
  platform: typeof platforms[number]
  index: number
  isLast: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const rgb = hexToRgb(platform.squareBg)

  return (
    <motion.a
      href={platform.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.025 + 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none',
        display: 'block',
        borderRadius: 10,
        margin: '0 -10px',
        padding: '0 10px',
        background: hovered ? `rgba(${rgb},0.06)` : 'transparent',
        transition: 'background 0.25s ease',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '13px 0',
        borderBottom: !isLast ? '1px solid rgba(255,255,255,0.05)' : 'none',
        minHeight: 50,
      }}>
        {/* Colored dot */}
        <span style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: `rgb(${rgb})`,
          flexShrink: 0,
          opacity: hovered ? 1 : 0.5,
          transition: 'opacity 0.25s ease',
          boxShadow: hovered ? `0 0 8px rgba(${rgb},0.6)` : 'none',
        }} />

        {/* Icon */}
        <span style={{
          color: hovered ? `rgb(${rgb})` : 'rgba(255,255,255,0.3)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.25s ease',
        }}>
          <PlatformIcon platform={platform} size={15} />
        </span>

        {/* Name */}
        <span style={{
          flex: 1,
          minWidth: 0,
          fontSize: 'clamp(13px, 2.5vw, 14px)',
          fontWeight: 400,
          color: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)',
          letterSpacing: '-0.01em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color 0.25s ease',
        }}>
          {platform.name}
        </span>

        {/* Desc — hidden on mobile */}
        <span style={{
          fontSize: 12,
          color: hovered ? `rgba(${rgb},0.7)` : 'rgba(255,255,255,0.24)',
          letterSpacing: '0.01em',
          flexShrink: 0,
          display: 'var(--desc-display, none)',
          transition: 'color 0.25s ease',
        }}>
          {platform.desc}
        </span>

        {/* Arrow — only on hover */}
        <span style={{
          flexShrink: 0,
          display: 'flex',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translate(0,0)' : 'translate(-4px,4px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          color: `rgb(${rgb})`,
        }}>
          <ArrowUpRight size={14} weight="regular" />
        </span>
      </div>
    </motion.a>
  )
}

/* ── Marquee for secondary platforms ───────────────────────────────────── */
function PlatformMarquee() {
  const prefersReduced = useReducedMotion()
  // Use last 18 platforms for marquee
  const marqueeItems = platforms.slice(9)
  // Duplicate for seamless loop
  const doubled = [...marqueeItems, ...marqueeItems]

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      paddingBlock: 'clamp(28px, 5vw, 48px)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      marginTop: 'clamp(28px, 5vw, 48px)',
    }}>
      {/* Fade masks */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, #050505 0%, transparent 10%, transparent 90%, #050505 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      <div
        style={{
          display: 'flex',
          gap: 32,
          width: 'max-content',
          animation: prefersReduced ? 'none' : 'platformMarquee 36s linear infinite',
        }}
      >
        {doubled.map((platform, i) => {
          const rgb = hexToRgb(platform.squareBg)
          return (
            <a
              key={`${platform.name}-${i}`}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              title={platform.name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.03)',
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.52)',
                fontSize: 13,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'background 0.25s ease, border-color 0.25s ease, color 0.25s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.background = `rgba(${rgb},0.1)`
                el.style.borderColor = `rgba(${rgb},0.3)`
                el.style.color = `rgb(${rgb})`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.background = 'rgba(255,255,255,0.03)'
                el.style.borderColor = 'rgba(255,255,255,0.07)'
                el.style.color = 'rgba(255,255,255,0.52)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                <PlatformIcon platform={platform} size={14} />
              </span>
              {platform.name}
            </a>
          )
        })}
      </div>

      <style>{`
        @keyframes platformMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

/* ── Main section ───────────────────────────────────────────────────────── */
export function PlatformsSection() {
  return (
    <section
      id="platforms"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      aria-label="Streaming platforms"
    >
      <EverywhereReveal />

      <div
        className="section-shell"
        style={{
          paddingTop: 8,
          paddingBottom: 'clamp(48px, 10vw, 96px)',
          /* Show desc column on wider screens */
        }}
      >
        {/* ── Featured tier label ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 'clamp(16px, 3vw, 24px)',
          }}
        >
          <span style={{
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            lineHeight: 1,
          }}>
            Primary
          </span>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </motion.div>

        {/* ── Featured cards grid ───────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(8px, 2vw, 14px)',
          marginBottom: 'clamp(28px, 5vw, 48px)',
        }}>
          {featuredPlatforms.map((platform, index) => (
            <FeaturedCard key={platform.name} platform={platform} index={index} />
          ))}
        </div>

        {/* ── Also available label ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 'clamp(8px, 2vw, 16px)',
          }}
        >
          <span style={{
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}>
            Also available on
          </span>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </motion.div>

        {/* ── Standard list: platforms 4–9 ─────────────────────────── */}
        <div style={{ marginBottom: 0 }}>
          {platforms.slice(FEATURED_COUNT, 9).map((platform, index) => (
            <PlatformRow
              key={platform.name}
              platform={platform}
              index={index}
              isLast={index === 9 - FEATURED_COUNT - 1}
            />
          ))}
        </div>

        {/* ── Marquee: platforms 9+ ─────────────────────────────────── */}
        <PlatformMarquee />

      </div>

      {/* Responsive desc visibility */}
      <style>{`
        @media (min-width: 640px) {
          [style*="--desc-display"] { --desc-display: block !important; }
        }
      `}</style>
    </section>
  )
}
