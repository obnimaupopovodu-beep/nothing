'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowUpRight,
  InstagramLogo,
  TiktokLogo,
  TelegramLogo,
  GlobeIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const EASE = [0.16, 1, 0.3, 1] as const

type Social = {
  name: string
  handle: string
  href: string
  Icon: Icon
}

const SOCIALS: Social[] = [
  {
    name: 'Instagram',
    handle: '@uwbelieve_records',
    href: 'https://instagram.com/uwbelieve_records',
    Icon: InstagramLogo,
  },
  {
    name: 'TikTok',
    handle: '@uwbelieve',
    href: 'https://tiktok.com/@uwbelieve',
    Icon: TiktokLogo,
  },
  {
    name: 'TikTok',
    handle: '@nothing.bass',
    href: 'https://tiktok.com/@nothing.bass',
    Icon: TiktokLogo,
  },
  {
    name: 'Telegram',
    handle: 't.me/nothing_records',
    href: 'https://t.me/nothing_records',
    Icon: TelegramLogo,
  },
  {
    name: 'All links',
    handle: 'linktr.ee/nothing.bass',
    href: 'https://linktr.ee/nothing.bass',
    Icon: GlobeIcon,
  },
]

function SocialRow({ social, index, reduced }: { social: Social; index: number; reduced: boolean }) {
  return (
    <motion.a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="social-row"
      aria-label={`${social.name} — ${social.handle}`}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: EASE }}
    >
      <span className="row-number">{String(index + 1).padStart(2, '0')}</span>
      <span className="row-name"><social.Icon size={24} weight="light" aria-hidden="true" />{social.name}</span>
      <span className="row-handle">{social.handle}</span>
      <ArrowUpRight className="row-arrow" size={22} weight="light" aria-hidden="true" />
    </motion.a>
  )
}

export function SocialSection() {
  const reduced = Boolean(useReducedMotion())

  return (
    <section id="social" aria-label="Community and social channels" className="band sec social-section">
      <div className="shell">
        <div className="social-heading">
          <p className="kicker"><i aria-hidden="true" />Community / 005</p>
          <h2 className="social-title">
            {['Stay in', 'the loop.'].map((line, index) => (
              <motion.span
                className="title-mask"
                key={line}
                initial={reduced ? 'visible' : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
              >
                <motion.span
                  className="title-line"
                  variants={{ hidden: { y: '110%' }, visible: { y: '0%' } }}
                  transition={{ duration: 1, delay: index * 0.16, ease: EASE }}
                >
                  {line}
                </motion.span>
              </motion.span>
            ))}
          </h2>
          <div className="heading-bottom">
            <span className="heading-rule" aria-hidden="true" />
            <p className="lede">Releases, sessions, and dispatches from the studio. Follow the signal.</p>
          </div>
        </div>

        <div className="directory">
          <div className="directory-labels" aria-hidden="true"><span>Channel directory</span><span>Find us elsewhere ↗</span></div>
          <div className="list">
            {SOCIALS.map((social, i) => (
              <SocialRow key={social.href} social={social} index={i} reduced={reduced} />
            ))}

            <motion.div
              className="foot"
              initial={reduced ? false : { opacity: 0 }}
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
        .social-section { overflow: hidden; }
        .social-heading { margin-bottom: clamp(72px, 10vw, 144px); }
        .social-heading .kicker { margin-bottom: clamp(30px, 5vw, 72px); }
        .social-title {
          margin: 0;
          font-size: clamp(66px, 10.8vw, 154px);
          font-weight: 900;
          line-height: 0.88;
          letter-spacing: -0.075em;
          text-transform: uppercase;
          color: var(--ink);
        }
        :global(.title-mask) { display: block; overflow: hidden; padding-bottom: 0.1em; margin-bottom: -0.1em; }
        :global(.title-mask:nth-child(2)) { padding-left: clamp(40px, 14vw, 210px); }
        :global(.title-line) { display: block; width: max-content; }
        .heading-bottom { display: flex; align-items: start; gap: clamp(24px, 5vw, 80px); margin-top: clamp(34px, 5vw, 64px); }
        .heading-rule { flex: 1; height: 1px; margin-top: 0.8em; background: var(--line); }
        .heading-bottom .lede { max-width: 31ch; flex: 0 1 31ch; }
        .directory-labels {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 20px;
          color: var(--ink-3);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .list { border-top: 1px solid var(--line); }
        :global(.social-row) {
          display: grid;
          grid-template-columns: clamp(56px, 7vw, 100px) minmax(0, 1fr) minmax(180px, 0.48fr) 28px;
          gap: 16px;
          align-items: center;
          min-height: clamp(98px, 9vw, 130px);
          padding: 22px 10px;
          border-bottom: 1px solid var(--line);
          color: var(--ink);
          text-decoration: none;
          transition: background 0.3s ease, padding 0.3s ease;
        }
        :global(.social-row:hover), :global(.social-row:focus-visible) { background: rgba(255, 255, 255, 0.035); padding-inline: 20px; }
        :global(.row-number) { align-self: start; padding-top: 0.35em; color: var(--blue-soft); font-size: 12px; font-weight: 700; letter-spacing: 0.16em; }
        :global(.row-name) {
          display: flex;
          align-items: center;
          gap: clamp(16px, 2vw, 28px);
          min-width: 0;
          font-size: clamp(30px, 4.3vw, 62px);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.055em;
          text-transform: uppercase;
        }
        :global(.row-name svg) { flex: 0 0 auto; color: var(--ink-3); }
        :global(.row-handle) { overflow: hidden; color: var(--ink-3); font-size: clamp(12px, 1.15vw, 15px); text-overflow: ellipsis; white-space: nowrap; }
        :global(.row-arrow) { color: var(--ink-3); transition: transform 0.3s ease, color 0.3s ease; }
        :global(.social-row:hover .row-arrow), :global(.social-row:focus-visible .row-arrow) { color: var(--ink); transform: translate(3px, -3px); }
        :global(.foot) { display: flex; align-items: center; gap: 14px; padding-top: 24px; }
        .line { width: 6px; height: 6px; border-radius: 50%; background: var(--blue-soft); }
        .line.short { display: none; }
        .label { font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-3); }
        @media (max-width: 700px) {
          .social-heading { margin-bottom: 72px; }
          .social-heading .kicker { margin-bottom: 38px; }
          .social-title { font-size: clamp(40px, 12vw, 88px); }
          :global(.title-mask:nth-child(2)) { padding-left: clamp(16px, 5vw, 40px); }
          .heading-bottom { margin-top: 42px; }
          .heading-rule { display: none; }
          .heading-bottom .lede { max-width: 32ch; }
          .directory-labels { font-size: 9px; letter-spacing: 0.15em; }
          :global(.social-row) { grid-template-columns: 36px minmax(0, 1fr) 24px; gap: 8px; min-height: 96px; padding: 18px 0; }
          :global(.social-row:hover), :global(.social-row:focus-visible) { padding-inline: 8px; }
          :global(.row-number) { grid-row: 1 / 3; }
          :global(.row-name) { gap: 12px; font-size: clamp(27px, 7vw, 42px); }
          :global(.row-name svg) { width: 18px; height: 18px; }
          :global(.row-handle) { grid-column: 2; font-size: 12px; }
          :global(.row-arrow) { grid-column: 3; grid-row: 1 / 3; }
        }
        @media (prefers-reduced-motion: reduce) { :global(.social-row), :global(.row-arrow) { transition: none; } }
      `}</style>
    </section>
  )
}
