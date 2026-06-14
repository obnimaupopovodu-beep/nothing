'use client'

import dynamic from 'next/dynamic'
import type { MotionValue } from 'framer-motion'
import type { ComponentType } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  CheckCircle,
  Repeat,
  Sparkle,
  UploadSimple,
  VinylRecord,
  WaveSine,
  ShieldCheck,
  Timer,
} from '@phosphor-icons/react'
import { useRef } from 'react'

const Scene = dynamic(
  () => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })),
  { ssr: false, loading: () => null }
)

const actions = [
  {
    label: 'Distribution only',
    href: '#explore',
    description: '10% royalties. Worldwide release.',
    Icon: UploadSimple,
  },
  {
    label: 'Distribution + promo',
    href: '#explore',
    description: 'Social campaigns and playlist pitching.',
    Icon: Sparkle,
  },
  {
    label: 'Re-release',
    href: '#explore',
    description: 'Give an existing track a stronger launch.',
    Icon: Repeat,
  },
]

const releaseModes = [
  {
    eyebrow: '01',
    title: 'Direct release management.',
    body: 'We distribute your track for 10% of royalties, keep the workflow simple, and show every number in one place.',
    Icon: VinylRecord,
  },
  {
    eyebrow: '02',
    title: 'Release support with momentum.',
    body: 'We handle the release and pair it with social media campaigns and playlist outreach on digital platforms when your track needs extra reach.',
    Icon: Sparkle,
  },
  {
    eyebrow: '03',
    title: 'A second life for the right record.',
    body: 'If a track is already out but still has room to grow, we reframe it as a stronger release and give it the push it deserves.',
    Icon: WaveSine,
  },
]

const advantages = [
  {
    title: 'Royalty access',
    body: 'Always access your royalties through a private dashboard.',
    Icon: Timer,
  },
  {
    title: 'Promo transparency',
    body: 'Always know which promotional actions were invested in your track.',
    Icon: CheckCircle,
  },
  {
    title: 'Straight feedback',
    body: 'If a track does not meet our standards, we say it clearly. No ghosting.',
    Icon: ShieldCheck,
  },
]

// Compact action row for hero right column
function ActionRow({
  label,
  href,
  description,
  Icon,
  index,
}: {
  label: string
  href: string
  description: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>
  index: number
}) {
  return (
    <motion.a
      href={href}
      className="group flex items-center gap-3.5"
      style={{
        padding: '14px 16px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        textDecoration: 'none',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'rgba(127,176,255,0.05)'
        el.style.borderColor = 'rgba(127,176,255,0.16)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'rgba(255,255,255,0.03)'
        el.style.borderColor = 'rgba(255,255,255,0.07)'
      }}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0 + index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Icon size={16} weight="regular" style={{ color: 'rgba(240,240,240,0.35)', flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(240,240,240,0.88)', letterSpacing: '-0.01em' }}>
          {label}
        </span>
        <span style={{ display: 'block', fontSize: '11px', color: 'rgba(240,240,240,0.32)', marginTop: '1px' }}>
          {description}
        </span>
      </span>
      <ArrowRight size={13} weight="regular" style={{ color: 'rgba(127,176,255,0.4)', flexShrink: 0 }} />
    </motion.a>
  )
}

// Release mode row — clean, no over-decoration
function ReleaseModeRow({
  progress,
  index,
  eyebrow,
  title,
  body,
  Icon,
}: {
  progress: MotionValue<number>
  index: number
  eyebrow: string
  title: string
  body: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>
}) {
  const start = 0.36 + index * 0.11
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1])
  const y = useTransform(progress, [start, start + 0.1], [24, 0])

  return (
    <motion.article
      style={{ opacity, y }}
      // no border-bottom on last item
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px',
          padding: '28px 0',
          borderBottom: index < releaseModes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        {/* Number */}
        <span
          style={{
            flexShrink: 0,
            width: '28px',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'rgba(127,176,255,0.45)',
            paddingTop: '3px',
          }}
        >
          {eyebrow}
        </span>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'rgba(240,240,240,0.92)',
              marginBottom: '8px',
              lineHeight: 1.35,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '13px',
              lineHeight: 1.75,
              color: 'rgba(240,240,240,0.42)',
              maxWidth: '52ch',
            }}
          >
            {body}
          </p>
        </div>
      </div>
    </motion.article>
  )
}

function AdvantageRow({
  progress,
  index,
  title,
  body,
  Icon,
}: {
  progress: MotionValue<number>
  index: number
  title: string
  body: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>
}) {
  const start = 0.76 + index * 0.04
  const opacity = useTransform(progress, [start, start + 0.07], [0, 1])
  const y = useTransform(progress, [start, start + 0.07], [16, 0])

  return (
    <motion.div
      style={{
        opacity,
        y,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '20px 0',
        borderBottom: index < advantages.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}
    >
      <Icon size={15} weight="regular" style={{ color: 'rgba(127,176,255,0.55)', flexShrink: 0, marginTop: '2px' }} />
      <div>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,240,240,0.88)', marginBottom: '4px', letterSpacing: '-0.01em' }}>
          {title}
        </h3>
        <p style={{ fontSize: '12px', lineHeight: 1.7, color: 'rgba(240,240,240,0.38)' }}>
          {body}
        </p>
      </div>
    </motion.div>
  )
}

function AdvantagesBlock({ progress }: { progress: MotionValue<number> }) {
  const headerOpacity = useTransform(progress, [0.7, 0.78], [0, 1])
  const headerY = useTransform(progress, [0.7, 0.78], [20, 0])

  return (
    <motion.div style={{ opacity: headerOpacity, y: headerY }} className="mt-20">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '48px' }}>
        <div style={{ width: '180px', flexShrink: 0, paddingTop: '4px' }}>
          <p className="label-caps" style={{ marginBottom: '10px' }}>Our commitments</p>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {advantages.map((item, index) => (
            <AdvantageRow key={item.title} progress={progress} index={index} {...item} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Mobile version — stays as clean rows
function MobileStory() {
  return (
    <section className="relative overflow-hidden md:hidden" aria-label="Nothing Records story">
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: '50%',
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(127,176,255,0.09), transparent 70%)',
        }}
      />
      <div className="relative min-h-[100dvh] px-5 pb-10 pt-[80px]">
        <div className="flex min-h-[calc(100dvh-110px)] flex-col justify-center">
          <motion.p
            style={{ fontSize: '9px', letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.25)', marginBottom: '16px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Independent Electronic Music Label
          </motion.p>
          <motion.h1
            style={{ fontSize: 'clamp(3rem, 15vw, 4.5rem)', fontWeight: 200, lineHeight: 0.92, letterSpacing: '-0.04em', color: '#f0f0f0' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            NOTHING<br />
            <span style={{ color: 'rgba(240,240,240,0.32)' }}>RECORDS</span>
          </motion.h1>
          <motion.p
            style={{ fontSize: '14px', lineHeight: 1.75, color: 'rgba(240,240,240,0.44)', marginTop: '20px', maxWidth: '32ch', fontWeight: 300 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            Premium distribution, optional promotion, and direct answers for electronic artists.
          </motion.p>
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '32px' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {actions.map(({ label, description, Icon }, index) => (
              <ActionRow key={label} label={label} href="#mobile-model" description={description} Icon={Icon} index={index} />
            ))}
          </motion.div>
        </div>
      </div>

      <div id="mobile-model" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '64px 20px' }}>
        <p className="label-caps" style={{ marginBottom: '12px' }}>Three release paths</p>
        <h2 style={{ fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', fontWeight: 200, letterSpacing: '-0.035em', color: '#f0f0f0', lineHeight: 1.15, marginBottom: '40px' }}>
          One clear system.
        </h2>
        <div>
          {releaseModes.map((mode, i) => (
            <div
              key={mode.eyebrow}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                padding: '24px 0',
                borderBottom: i < releaseModes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <span style={{ flexShrink: 0, width: '24px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(127,176,255,0.45)', paddingTop: '3px' }}>{mode.eyebrow}</span>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(240,240,240,0.9)', marginBottom: '6px', letterSpacing: '-0.01em' }}>{mode.title}</h3>
                <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(240,240,240,0.4)' }}>{mode.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '48px' }}>
          <p className="label-caps" style={{ marginBottom: '16px' }}>Our commitments</p>
          {advantages.map((item, i) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '18px 0',
                borderBottom: i < advantages.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <item.Icon size={14} weight="regular" style={{ color: 'rgba(127,176,255,0.5)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,240,240,0.88)', marginBottom: '3px' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', lineHeight: 1.65, color: 'rgba(240,240,240,0.36)' }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DesktopStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  const reducedMotion = useReducedMotion()

  const sceneOpacity = useTransform(scrollYProgress, [0, 0.1, 0.88, 1], [1, 1, 1, 0])

  const titleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.2, 0.3], [1, 1, 1, 0])
  const titleY = useTransform(scrollYProgress, [0.2, 0.3], ['0%', '-6%'])

  const contentOpacity = useTransform(scrollYProgress, [0.24, 0.34], [0, 1])
  const contentY = useTransform(scrollYProgress, [0.24, 0.34], [28, 0])

  const releaseHeaderOpacity = useTransform(scrollYProgress, [0.26, 0.36], [0, 1])
  const releaseHeaderY = useTransform(scrollYProgress, [0.26, 0.36], [20, 0])

  return (
    <div ref={containerRef} className="relative hidden md:block" style={{ height: '580vh' }}>
      <div className="sticky top-0 h-dvh overflow-hidden">

        {/* 3D scene */}
        <motion.div className="absolute inset-0 z-0" style={{ opacity: sceneOpacity }}>
          <Scene mouseX={0} mouseY={0} />
        </motion.div>

        {/* Vignette */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, rgba(5,5,5,0.6) 65%, #050505 100%)' }}
        />
        <div
          className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
          style={{ height: '32%', background: 'linear-gradient(to bottom, transparent, rgba(5,5,5,0.92) 80%, #050505)' }}
        />

        {/* ─── PHASE 1: Hero ─────────────────────────────────── */}
        <div className="relative z-20 flex h-full items-center">
          <div className="section-shell w-full">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '64px' }}>

              {/* Left: title block */}
              <motion.div style={{ opacity: titleOpacity, y: titleY, flex: 1, minWidth: 0 }}>
                <motion.p
                  style={{ fontSize: '9px', letterSpacing: '0.46em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.25)', marginBottom: '22px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.9 }}
                >
                  Independent Electronic Music Label
                </motion.p>

                <motion.h1
                  style={{
                    fontSize: 'clamp(4.5rem, 9vw, 8rem)',
                    fontWeight: 200,
                    lineHeight: 0.92,
                    letterSpacing: '-0.04em',
                    color: '#f0f0f0',
                    userSelect: 'none',
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  NOTHING<br />
                  <span style={{ color: 'rgba(240,240,240,0.28)' }}>RECORDS</span>
                </motion.h1>

                <motion.p
                  style={{ fontSize: '14px', lineHeight: 1.75, color: 'rgba(240,240,240,0.46)', marginTop: '28px', maxWidth: '38ch', fontWeight: 300 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                >
                  Premium distribution, optional promotion,
                  and direct answers for electronic artists.
                </motion.p>
              </motion.div>

              {/* Right: action cards */}
              <motion.div
                style={{ opacity: titleOpacity, width: '300px', flexShrink: 0 }}
              >
                <motion.div
                  style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  {actions.map((card, i) => (
                    <ActionRow key={card.label} {...card} index={i} />
                  ))}
                </motion.div>

                <motion.div
                  style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.0 }}
                >
                  <motion.span
                    style={{ fontSize: '9px', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.16)' }}
                    animate={{ opacity: [0.16, 0.3, 0.16] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ↓ Scroll to explore
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ─── PHASE 2: Release modes ─────────────────────────── */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center"
          style={{ opacity: contentOpacity, y: contentY }}
        >
          <div className="section-shell w-full">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '56px' }}>

              {/* Left: sticky section label + heading */}
              <div style={{ width: '220px', flexShrink: 0 }}>
                <motion.div style={{ opacity: releaseHeaderOpacity, y: releaseHeaderY }}>
                  <p className="label-caps" style={{ marginBottom: '14px' }}>Three release paths</p>
                  <h2
                    style={{
                      fontSize: 'clamp(1.7rem, 2.8vw, 2.5rem)',
                      fontWeight: 200,
                      letterSpacing: '-0.04em',
                      color: '#f0f0f0',
                      lineHeight: 1.12,
                    }}
                  >
                    One clear<br />system.
                  </h2>
                  <p style={{ marginTop: '14px', fontSize: '13px', lineHeight: 1.7, color: 'rgba(240,240,240,0.36)' }}>
                    Every artist gets the same honest framework — choose how much support you need.
                  </p>
                </motion.div>
              </div>

              {/* Right: rows */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {releaseModes.map((mode, i) => (
                  <ReleaseModeRow
                    key={mode.eyebrow}
                    progress={scrollYProgress}
                    index={i}
                    {...mode}
                  />
                ))}
                <AdvantagesBlock progress={scrollYProgress} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll arrow */}
        <motion.div
          className="absolute bottom-8 inset-x-0 z-20 flex justify-center"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]) }}
        >
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDown size={16} weight="light" style={{ color: 'rgba(240,240,240,0.18)' }} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export function StorySection() {
  return (
    <div id="explore">
      <MobileStory />
      <DesktopStory />
    </div>
  )
}
