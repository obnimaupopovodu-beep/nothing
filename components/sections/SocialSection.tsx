'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

/* ─── Data ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const

const socials = [
  {
    name: 'Instagram',
    handle: '@nothingrecords',
    href: 'https://instagram.com',
    accent: '#c4a47c',
    count: '84.2k',
    contexts: ['artist update', 'new story', 'photo drop', 'session out'],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    handle: '@nothingrecords',
    href: 'https://tiktok.com',
    accent: '#a8c2ae',
    count: '211k',
    contexts: ['studio clip', 'behind the scenes', 'live take', 'new track'],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    handle: 't.me/nothingrecords',
    href: 'https://t.me',
    accent: '#8ab2c8',
    count: '19.4k',
    contexts: ['new release', 'pre-save now', 'tour update', 'announcement'],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: 'X',
    handle: '@nothingrecords',
    href: 'https://x.com',
    accent: 'rgba(240,237,230,0.72)',
    count: '47.8k',
    contexts: ['community post', 'reply thread', 'listening party', 'label news'],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

/* ─── Pulse dot ───────────────────────────────── */
function PulseDot({ active, accent }: { active: boolean; accent: string }) {
  return (
    <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 12, height: 12, flexShrink: 0 }}>
      {active && (
        <motion.span
          style={{
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: `1px solid ${accent}`,
          }}
          initial={{ scale: 0.6, opacity: 0.6 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.4 }}
        />
      )}
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: active ? accent : 'rgba(240,237,230,0.25)',
          transition: 'background 0.3s ease',
          display: 'block',
        }}
      />
    </span>
  )
}

/* ─── Arrow icon ───────────────────────────────── */
function ArrowUpRight({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="1.2" aria-hidden="true">
      <path d="M1.5 10.5L10.5 1.5M10.5 1.5H4.5M10.5 1.5V7.5" />
    </svg>
  )
}

/* ─── Social Row ───────────────────────────────── */
function SocialRow({
  social,
  index,
  inView,
}: {
  social: (typeof socials)[0]
  index: number
  inView: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const [ctxIndex, setCtxIndex] = useState(0)

  const handleTouch = () => {
    setHovered((v) => !v)
    setCtxIndex((p) => (p + 1) % social.contexts.length)
  }

  const handleMouseEnter = () => {
    setHovered(true)
    setCtxIndex((p) => (p + 1) % social.contexts.length)
  }

  return (
    <motion.a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block', position: 'relative', overflow: 'hidden' }}
      initial={{ opacity: 0, y: 5 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12 + 0.1, duration: 0.65, ease: EASE }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Signal sweep */}
      <motion.span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(240,237,230,0.03) 40%, rgba(240,237,230,0.055) 50%, rgba(240,237,230,0.03) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
        initial={{ x: '-110%' }}
        animate={hovered ? { x: '110%' } : { x: '-110%' }}
        transition={hovered ? { duration: 0.75, ease: EASE } : { duration: 0 }}
      />

      {/* Left accent thread */}
      <motion.span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: 1,
          background: social.accent,
          translateY: '-50%',
          transformOrigin: 'center',
          pointerEvents: 'none',
        }}
        animate={{ height: hovered ? '42%' : '0%', opacity: hovered ? 0.9 : 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      />

      {/* Row content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2rem 1fr auto',
          alignItems: 'center',
          columnGap: 'clamp(0.6rem, 2vw, 1rem)',
          padding: '1.25rem 0 1.25rem 0.25rem',
          borderTop: '1px solid rgba(255,255,255,0.055)',
          minHeight: '56px',
        }}
      >
        {/* Icon */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: hovered ? social.accent : 'rgba(240,237,230,0.28)',
            transition: 'color 0.3s ease',
          }}
        >
          {social.icon}
        </span>

        {/* Name + handle */}
        <span style={{ minWidth: 0 }}>
          <span
            style={{
              display: 'block',
              fontSize: '0.68rem',
              fontWeight: 300,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: hovered ? 'rgba(240,237,230,0.9)' : 'rgba(240,237,230,0.5)',
              lineHeight: 1,
              marginBottom: '0.28rem',
              transition: 'color 0.25s ease',
            }}
          >
            {social.name}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'rgba(240,237,230,0.32)',
              transition: 'color 0.25s ease',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {social.handle}
          </span>
        </span>

        {/* Right cluster */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.4rem, 1.5vw, 0.8rem)', flexShrink: 0 }}>
          {/* Context label — hide on very small screens */}
          <motion.span
            style={{
              fontSize: '0.58rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(240,237,230,0.35)',
              whiteSpace: 'nowrap',
              display: 'var(--ctx-display, inline)',
            }}
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -6 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {social.contexts[ctxIndex % social.contexts.length]}
          </motion.span>

          {/* Follower count */}
          <span
            style={{
              fontSize: '0.63rem',
              fontWeight: 300,
              letterSpacing: '0.04em',
              color: hovered ? 'rgba(240,237,230,0.38)' : 'rgba(240,237,230,0.14)',
              minWidth: '2.5rem',
              textAlign: 'right',
              transition: 'color 0.25s ease',
            }}
          >
            {social.count}
          </span>

          {/* Pulse */}
          <PulseDot active={hovered} accent={social.accent} />

          {/* Arrow */}
          <motion.span
            animate={hovered ? { x: 2, y: -2 } : { x: 0, y: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ArrowUpRight color={hovered ? 'rgba(240,237,230,0.45)' : 'rgba(240,237,230,0.14)'} />
          </motion.span>
        </span>
      </div>
    </motion.a>
  )
}

/* ─── Section ─────────────────────────────────── */
export function SocialSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      id="social"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(3.5rem,8vw,7rem) 0' }}
      aria-label="Community — social channels"
    >
      <style>{`
        @media (min-width: 640px) {
          .social-left-col {
            position: sticky !important;
            top: 5rem !important;
          }
        }
      `}</style>
      <div className="section-shell">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: 'clamp(2rem, 6vw, 7rem)',
            alignItems: 'start',
          }}
        >
          {/* ── Left ── */}
          <div className="social-left-col">
            <p
              className="label-caps"
              style={{ marginBottom: '1.5rem' }}
            >
              Community
            </p>

            <h2
              style={{
                fontSize: 'clamp(1.8rem, 5vw, 3.4rem)',
                fontWeight: 200,
                letterSpacing: '-0.03em',
                color: '#f0ede8',
                lineHeight: 1.07,
                marginBottom: '1.5rem',
              }}
            >
              Stay in<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(240,237,230,0.45)' }}>the loop.</em>
            </h2>

            <p
              style={{
                fontSize: '0.82rem',
                fontWeight: 300,
                lineHeight: 1.82,
                color: 'rgba(240,237,230,0.36)',
                maxWidth: '24ch',
              }}
            >
              Every channel is a live frequency. Releases, sessions, and dispatches
              from the studio — we are always transmitting.
            </p>

            <div
              style={{ marginTop: '2.25rem', height: 1, width: '2.5rem', background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* ── Right ── */}
          <div>
            {socials.map((social, i) => (
              <SocialRow key={social.name} social={social} index={i} inView={inView} />
            ))}

            {/* Last border + footer */}
            <motion.div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.055)',
                marginTop: 0,
                paddingTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
            >
              <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
              <span
                style={{
                  fontSize: '0.58rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(240,237,230,0.14)',
                  whiteSpace: 'nowrap',
                }}
              >
                All channels active
              </span>
              <span style={{ width: '1.5rem', height: 1, background: 'rgba(255,255,255,0.05)' }} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
