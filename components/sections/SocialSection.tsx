'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  InstagramLogo,
  TiktokLogo,
  TelegramLogo,
  XLogo,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const EASE = [0.16, 1, 0.3, 1] as const

type Social = {
  name: string
  handle: string
  href: string
  contexts: string[]
  Icon: Icon
}

const SOCIALS: Social[] = [
  {
    name: 'Instagram',
    handle: '@nothingrecords',
    href: 'https://instagram.com/nothingrecords',
    contexts: ['artist update', 'new story', 'photo drop', 'session out'],
    Icon: InstagramLogo,
  },
  {
    name: 'TikTok',
    handle: '@nothingrecords',
    href: 'https://tiktok.com/@nothingrecords',
    contexts: ['studio clip', 'behind the scenes', 'live take', 'new track'],
    Icon: TiktokLogo,
  },
  {
    name: 'Telegram',
    handle: 't.me/nothingrecords',
    href: 'https://t.me/nothingrecords',
    contexts: ['new release', 'pre-save now', 'tour update', 'announcement'],
    Icon: TelegramLogo,
  },
  {
    name: 'X',
    handle: '@nothingrecords',
    href: 'https://x.com/nothingrecords',
    contexts: ['community post', 'reply thread', 'listening party', 'label news'],
    Icon: XLogo,
  },
]

function SocialRow({ social, index }: { social: Social; index: number }) {
  const [ctxIndex, setCtxIndex] = useState(0)
  const [active, setActive] = useState(false)

  const cycleContext = () => setCtxIndex((p) => (p + 1) % social.contexts.length)

  return (
    <motion.a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="row"
      aria-label={`${social.name} — ${social.handle}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => { setActive(true); cycleContext() }}
      onMouseLeave={() => setActive(false)}
      onFocus={() => { setActive(true); cycleContext() }}
      onBlur={() => setActive(false)}
    >
      <span className="icon-wrap" aria-hidden="true">
        <social.Icon size={20} weight="regular" className={active ? 'icon active' : 'icon'} />
      </span>

      <span className="copy">
        <span className="name">{social.name}</span>
        <span className="handle">{social.handle}</span>
        <span className="ctx-mobile">{social.contexts[ctxIndex]}</span>
      </span>

      <span className="meta">
        <motion.span
          className="ctx"
          animate={{ opacity: active ? 1 : 0, x: active ? 0 : -6 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {social.contexts[ctxIndex]}
        </motion.span>
        <motion.span
          className="arrow"
          animate={{ x: active ? 2 : 0, y: active ? -2 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          aria-hidden="true"
        >
          <ArrowUpRight size={14} weight="regular" />
        </motion.span>
      </span>
    </motion.a>
  )
}

export function SocialSection() {
  return (
    <section id="social" aria-label="Community and social channels" className="band sec">
      <div className="shell">
        <div className="wrap">
          <div className="head-col">
            <motion.div
              className="head"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <p className="kicker"><i aria-hidden="true" />Community</p>
              <h2 className="h2">
                Stay in
                <br />
                <span className="accent">the loop.</span>
              </h2>
              <p className="lede">
                Every channel is a live frequency. Releases, sessions, and dispatches
                from the studio, always transmitting.
              </p>
            </motion.div>
          </div>

          <div className="list">
            {SOCIALS.map((social, i) => (
              <SocialRow key={social.name} social={social} index={i} />
            ))}

            <motion.div
              className="foot"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            >
              <span className="line" aria-hidden="true" />
              <span className="label">All channels active</span>
              <span className="line short" aria-hidden="true" />
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .wrap {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: clamp(30px, 5vw, 80px);
          align-items: start;
        }
        .head-col {
          position: relative;
        }
        :global(.head .kicker) { margin-bottom: 20px; }
        .accent { color: var(--blue-soft); }
        :global(.head .lede) { margin-top: clamp(18px, 2.5vw, 28px); max-width: 34ch; }

        .list { border-top: 1px solid var(--line-soft); }

        :global(a.row) {
          display: grid;
          grid-template-columns: 2.5rem 1fr auto;
          align-items: center;
          gap: clamp(12px, 2vw, 20px);
          padding: 22px 0;
          min-height: 56px;
          border-bottom: 1px solid var(--line-soft);
          text-decoration: none;
          color: inherit;
          transition: background 0.25s ease;
        }
        :global(a.row:hover),
        :global(a.row:focus-visible) {
          background: var(--glass);
        }

        :global(.icon-wrap) {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        :global(.icon) {
          color: var(--ink-3);
          transition: color 0.25s ease;
        }
        :global(.icon.active) { color: var(--blue-soft); }

        :global(.copy) { min-width: 0; }
        :global(.name) {
          display: block;
          font-size: clamp(14px, 1.6vw, 15px);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--ink);
          line-height: 1.2;
        }
        :global(.handle) {
          display: block;
          margin-top: 4px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-3);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        :global(.ctx-mobile) {
          display: none;
          margin-top: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-3);
        }

        :global(.meta) {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        :global(.ctx) {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-3);
          white-space: nowrap;
        }
        :global(.arrow) {
          display: flex;
          align-items: center;
          color: var(--ink-3);
          transition: color 0.25s ease;
        }
        :global(a.row:hover .arrow),
        :global(a.row:focus-visible .arrow) { color: var(--blue-soft); }

        .foot {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: 22px;
        }
        .line {
          flex: 1;
          height: 1px;
          background: var(--line-soft);
        }
        .line.short { flex: 0 0 1.5rem; }
        .label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-3);
          white-space: nowrap;
        }

        @media (min-width: 901px) {
          .head-col {
            position: sticky;
            top: 5.5rem;
          }
        }
        @media (max-width: 900px) {
          .wrap { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          :global(.ctx) { display: none; }
          :global(.ctx-mobile) { display: block; }
          :global(a.row) {
            grid-template-columns: 2rem 1fr auto;
            padding: 18px 0;
          }
        }
      `}</style>
    </section>
  )
}
