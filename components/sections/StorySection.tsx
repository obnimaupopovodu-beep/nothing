'use client'

import dynamic from 'next/dynamic'
import type { MotionValue } from 'framer-motion'
import type { ComponentType, CSSProperties } from 'react'
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from 'framer-motion'
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
import { useLayoutEffect, useRef, useState } from 'react'

const Scene = dynamic(
  () => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })),
  { ssr: false, loading: () => null }
)

const actions = [
  { label: 'Distribution only', href: '#explore', description: '10% royalties. Worldwide release.', Icon: UploadSimple },
  { label: 'Distribution + promo', href: '#explore', description: 'Social campaigns and playlist pitching.', Icon: Sparkle },
  { label: 'Re-release', href: '#explore', description: 'Give an existing track a stronger launch.', Icon: Repeat },
]

const releaseModes = [
  { eyebrow: 'Release', title: 'Direct release management.', body: 'We distribute your track for 10% of royalties, keep the workflow simple, and show every number in one place.', Icon: VinylRecord },
  { eyebrow: 'Promotion', title: 'Release support with momentum.', body: 'We handle the release and pair it with social media campaigns and playlist outreach on digital platforms when your track needs extra reach.', Icon: Sparkle },
  { eyebrow: 'Re-release', title: 'A second life for the right record.', body: 'If a track is already out but still has room to grow, we reframe it as a stronger release and give it the push it deserves.', Icon: WaveSine },
]

const advantages = [
  { title: 'Royalty access', body: 'Always access your royalties through a private dashboard.', Icon: Timer },
  { title: 'Promo transparency', body: 'Always know which promotional actions were invested in your track.', Icon: CheckCircle },
  { title: 'Straight feedback', body: 'If a track does not meet our standards, we say it clearly. No ghosting.', Icon: ShieldCheck },
]

function ActionRow({ label, href, description, Icon, index }: {
  label: string; href: string; description: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: CSSProperties }>; index: number
}) {
  return (
    <motion.a
      href={href}
      className="group flex items-center gap-3.5"
      style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', transition: 'background 0.2s ease, border-color 0.2s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(127,176,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(127,176,255,0.16)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0 + index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Icon size={16} weight="regular" style={{ color: 'rgba(240,240,240,0.35)', flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(240,240,240,0.88)', letterSpacing: '-0.01em' }}>{label}</span>
        <span style={{ display: 'block', fontSize: '11px', color: 'rgba(240,240,240,0.32)', marginTop: '1px' }}>{description}</span>
      </span>
      <ArrowRight size={13} weight="regular" style={{ color: 'rgba(127,176,255,0.4)', flexShrink: 0 }} />
    </motion.a>
  )
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function mapRange(v: number, inStart: number, inEnd: number, outStart = 0, outEnd = 1) {
  const t = clamp01((v - inStart) / (inEnd - inStart))
  return outStart + (outEnd - outStart) * t
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

type ReleaseCardItem = (typeof releaseModes)[number]

function ReleaseCard({
  item,
  style,
}: {
  item: ReleaseCardItem
  style: {
    x: MotionValue<number>
    y: MotionValue<number>
    opacity: MotionValue<number>
    scale: MotionValue<number>
    width: MotionValue<number | string>
    filter: MotionValue<string>
  }
}) {
  const { eyebrow, title, body, Icon } = item

  return (
    <motion.article
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        x: style.x,
        y: style.y,
        opacity: style.opacity,
        scale: style.scale,
        width: style.width,
        filter: style.filter,
        translateX: '-50%',
        translateY: '-50%',
        borderRadius: 28,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.28)',
        backdropFilter: 'blur(18px)',
        padding: '24px 24px 22px',
        overflow: 'hidden',
        willChange: 'transform, opacity, width, filter',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
        <span style={{ fontSize: 12, lineHeight: 1, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
          {eyebrow}
        </span>
        <div style={{ width: 42, height: 42, borderRadius: '999px', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.9)', flex: '0 0 auto' }}>
          <Icon size={20} weight="regular" />
        </div>
      </div>

      <h3 style={{ margin: 0, fontSize: 'clamp(24px, 2vw, 34px)', lineHeight: 1.02, letterSpacing: '-0.04em', color: '#fff', maxWidth: '12ch' }}>
        {title}
      </h3>

      <p style={{ marginTop: 14, marginBottom: 0, fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,0.64)', maxWidth: '42ch' }}>
        {body}
      </p>
    </motion.article>
  )
}

function CommitmentLine({ item, index, progress }: { item: (typeof advantages)[number]; index: number; progress: MotionValue<number> }) {
  const start = 0.84 + index * 0.045
  const end = start + 0.065
  const opacity = useTransform(progress, [start, end], [0, 1])
  const y = useTransform(progress, [start, end], [42, 0])
  const blur = useTransform(progress, [start, end], [16, 0])
  const filter = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div
      style={{
        opacity,
        y,
        filter,
        display: 'grid',
        gridTemplateColumns: 'minmax(160px, 220px) 1fr',
        alignItems: 'center',
        gap: 24,
        width: 'min(860px, calc(100vw - 96px))',
        padding: '22px 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: '999px', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', flex: '0 0 auto' }}>
          <item.Icon size={18} weight="regular" />
        </div>
        <div style={{ fontSize: 18, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff' }}>
          {item.title}
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.62)', maxWidth: '52ch' }}>
        {item.body}
      </p>
    </motion.div>
  )
}

function MobileCard({ item, progress, cardStart, cardEnd, cardOutStart, cardOutEnd }: {
  item: (typeof releaseModes)[number]
  progress: MotionValue<number>
  cardStart: number
  cardEnd: number
  cardOutStart: number
  cardOutEnd: number
}) {
  const opacity = useTransform(progress, (v) => {
    if (v < cardStart) return 0
    if (v <= cardEnd) return easeInOut(mapRange(v, cardStart, cardEnd))
    if (v <= cardOutStart) return 1
    if (v <= cardOutEnd) return 1 - easeInOut(mapRange(v, cardOutStart, cardOutEnd))
    return 0
  })
  const y = useTransform(progress, (v) => {
    if (v < cardStart) return 40
    if (v <= cardEnd) return 40 - 40 * easeInOut(mapRange(v, cardStart, cardEnd))
    if (v <= cardOutStart) return 0
    if (v <= cardOutEnd) return -50 * easeInOut(mapRange(v, cardOutStart, cardOutEnd))
    return -50
  })
  const blurRaw = useTransform(progress, (v) => {
    if (v < cardStart) return 12
    if (v <= cardEnd) return 12 - 12 * easeInOut(mapRange(v, cardStart, cardEnd))
    if (v <= cardOutStart) return 0
    if (v <= cardOutEnd) return 8 * easeInOut(mapRange(v, cardOutStart, cardOutEnd))
    return 8
  })
  const filter = useMotionTemplate`blur(${blurRaw}px)`

  return (
    <motion.div style={{ opacity, y, filter, borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: '18px 20px', backdropFilter: 'blur(12px)' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 10 }}>{item.eyebrow}</div>
      <div style={{ fontSize: 20, lineHeight: 1.08, letterSpacing: '-0.04em', color: '#fff', marginBottom: 10 }}>{item.title}</div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.58)' }}>{item.body}</p>
    </motion.div>
  )
}

function MobileCommitRow({ item, progress, rowStart, rowEnd }: {
  item: (typeof advantages)[number]
  progress: MotionValue<number>
  rowStart: number
  rowEnd: number
}) {
  const opacity = useTransform(progress, [rowStart, rowEnd], [0, 1])
  const y = useTransform(progress, [rowStart, rowEnd], [20, 0])
  return (
    <motion.div style={{ opacity, y, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize: 17, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', marginBottom: 6 }}>{item.title}</div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.54)' }}>{item.body}</p>
    </motion.div>
  )
}

function MobileSystemPresentation({ progress }: { progress: MotionValue<number> }) {
  const cardStarts = [0.08, 0.20, 0.32]
  const cardEnds = [0.18, 0.30, 0.42]
  const cardOutStart = 0.58
  const cardOutEnd = 0.70

  const introLabelOpacity = useTransform(progress, [0, 0.08, 0.50, 0.60], [0, 1, 1, 0])
  const introLabelY = useTransform(progress, [0, 0.08], [16, 0])
  const introLabelBlurRaw = useTransform(progress, [0, 0.08], [10, 0])
  const introLabelFilter = useMotionTemplate`blur(${introLabelBlurRaw}px)`

  const commitOpacity = useTransform(progress, [0.68, 0.80], [0, 1])
  const commitY = useTransform(progress, [0.68, 0.80], [30, 0])
  const commitBlurRaw = useTransform(progress, [0.68, 0.80], [12, 0])
  const commitFilter = useMotionTemplate`blur(${commitBlurRaw}px)`

  const cardsOpacity = useTransform(progress, [0.62, 0.70], [1, 0])
  const cardsPointer = useTransform(progress, (v) => v > 0.68 ? 'none' : 'auto')

  return (
    <div style={{ width: '100%', height: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px', position: 'relative' }}>
      <motion.div style={{ opacity: cardsOpacity, pointerEvents: cardsPointer, position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px' }}>
        <motion.div style={{ opacity: introLabelOpacity, y: introLabelY, filter: introLabelFilter, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 28 }}>
          How it works
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {releaseModes.map((item, i) => (
            <MobileCard key={item.eyebrow} item={item} progress={progress} cardStart={cardStarts[i]} cardEnd={cardEnds[i]} cardOutStart={cardOutStart} cardOutEnd={cardOutEnd} />
          ))}
        </div>
      </motion.div>

      <motion.div style={{ opacity: commitOpacity, y: commitY, filter: commitFilter, position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px', pointerEvents: 'none' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 16 }}>Our commitments</div>
        <div style={{ display: 'grid', gap: 0 }}>
          {advantages.map((item, i) => (
            <MobileCommitRow key={item.title} item={item} progress={progress} rowStart={0.72 + i * 0.06} rowEnd={0.80 + i * 0.06} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function SystemPresentation({ progress, mobile = false }: { progress: MotionValue<number>; mobile?: boolean }) {
  if (mobile) return <MobileSystemPresentation progress={progress} />

  const introOpacity = useTransform(progress, (v) => {
    if (v <= 0.08) return mapRange(v, 0, 0.08, 0, 1)
    if (v <= 0.40) return 1
    if (v <= 0.52) return mapRange(v, 0.40, 0.52, 1, 0)
    return 0
  })

  const introY = useTransform(progress, (v) => {
    if (v <= 0.08) return 26 - 26 * easeInOut(mapRange(v, 0, 0.08))
    if (v <= 0.40) return 0
    if (v <= 0.52) return -90 * easeInOut(mapRange(v, 0.40, 0.52))
    return -90
  })

  const introScale = useTransform(progress, (v) => {
    if (v <= 0.40) return 1
    if (v <= 0.52) return 1 - 0.08 * easeInOut(mapRange(v, 0.40, 0.52))
    return 0.92
  })

  const introBlur = useTransform(progress, (v) => {
    if (v <= 0.08) return 18 - 18 * easeInOut(mapRange(v, 0, 0.08))
    if (v <= 0.40) return 0
    if (v <= 0.52) return 6 * easeInOut(mapRange(v, 0.40, 0.52))
    return 6
  })

  const introFilter = useMotionTemplate`blur(${introBlur}px)`

  const cardLayout = [
    { x: -530, beforeY: -140, afterY: -280 },
    { x: 590, beforeY: 60, afterY: 0 },
    { x: 30, beforeY: 285, afterY: 280 },
  ]

  const revealStarts = [0.16, 0.22, 0.28]
  const revealEnds = [0.24, 0.30, 0.36]
  const enterOffsetY = 160
  const exitOffsetY = -180

  const yScale = useTransform(progress, () => {
    if (typeof window === 'undefined') return 1
    return Math.max(0.72, Math.min(1, window.innerHeight / 980))
  })

  const cardStyles = releaseModes.map((_, i) => {
    const opacity = useTransform(progress, (v) => {
      if (v < revealStarts[i]) return 0
      if (v <= revealEnds[i]) return easeInOut(mapRange(v, revealStarts[i], revealEnds[i]))
      if (v <= 0.67) return 1
      if (v <= 0.80) return mapRange(v, 0.67, 0.80, 1, 0)
      return 0
    })

    const x = useTransform(progress, (v) => {
      const fromX = cardLayout[i].x
      if (v <= 0.40) return fromX
      if (v <= 0.52) {
        const t = easeInOut(mapRange(v, 0.40, 0.52))
        return fromX + (0 - fromX) * t
      }
      return 0
    })

    const y = useTransform([progress, yScale], (input: number[]) => {
      const v = input[0]
      const scale = input[1]
      const beforeY = cardLayout[i].beforeY * scale
      const afterY = cardLayout[i].afterY * scale
      const enterFromY = beforeY + enterOffsetY * scale
      if (v < revealStarts[i]) return enterFromY
      if (v <= revealEnds[i]) {
        const t = easeInOut(mapRange(v, revealStarts[i], revealEnds[i]))
        return enterFromY + (beforeY - enterFromY) * t
      }
      if (v <= 0.52) return beforeY
      if (v <= 0.67) {
        const t = easeInOut(mapRange(v, 0.52, 0.67))
        return beforeY + (afterY - beforeY) * t
      }
      if (v <= 0.80) {
        const t = easeInOut(mapRange(v, 0.67, 0.80))
        return afterY + exitOffsetY * scale * t
      }
      return afterY + exitOffsetY * scale
    })

    const scale = useTransform(progress, (v) => {
      if (v < revealStarts[i]) return 0.96
      if (v <= revealEnds[i]) return 0.96 + 0.04 * easeInOut(mapRange(v, revealStarts[i], revealEnds[i]))
      if (v <= 0.67) return 1
      if (v <= 0.80) return 1 - 0.04 * easeInOut(mapRange(v, 0.67, 0.80))
      return 0.96
    })

    const width = useTransform<number, number | string>(progress, (v) => {
      if (v <= 0.52) return 320
      if (v <= 0.67) {
        const t = easeInOut(mapRange(v, 0.52, 0.67))
        return 320 + (540 - 320) * t
      }
      return 540
    })

    const blur = useTransform(progress, (v) => {
      if (v < revealStarts[i]) return 18
      if (v <= revealEnds[i]) return 18 - 18 * easeInOut(mapRange(v, revealStarts[i], revealEnds[i]))
      if (v <= 0.67) return 0
      if (v <= 0.80) return 10 * easeInOut(mapRange(v, 0.67, 0.80))
      return 10
    })

    const filter = useMotionTemplate`blur(${blur}px)`
    return { opacity, x, y, scale, width, filter }
  })

  const commitmentsTitleOpacity = useTransform(progress, [0.80, 0.87], [0, 1])
  const commitmentsTitleY = useTransform(progress, [0.80, 0.87], [40, 0])
  const commitmentsTitleBlur = useTransform(progress, [0.80, 0.87], [18, 0])
  const commitmentsTitleFilter = useMotionTemplate`blur(${commitmentsTitleBlur}px)`

  return (
    <section style={{ position: 'relative', width: '100%', height: '180vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'visible' }}>
        <motion.div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: introOpacity, y: introY, scale: introScale, filter: introFilter, pointerEvents: 'none', zIndex: 3, textAlign: 'center', padding: '0 32px' }}>
          <div>
            <div style={{ fontSize: 12, lineHeight: 1, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.44)', marginBottom: 22 }}>One clear system</div>
            <h2 style={{ margin: 0, fontSize: 'clamp(56px, 6.3vw, 108px)', lineHeight: 0.94, letterSpacing: '-0.065em', color: '#fff', maxWidth: '10ch' }}>
              Choose your release path.
            </h2>
          </div>
        </motion.div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'auto', overflow: 'visible' }}>
          {releaseModes.map((item, i) => (
            <ReleaseCard key={item.eyebrow} item={item} style={cardStyles[i]} />
          ))}
        </div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'grid', placeItems: 'center', pointerEvents: 'none', padding: '0 32px' }}>
          <div style={{ width: '100%', display: 'grid', justifyItems: 'center', marginTop: 40 }}>
            <motion.div style={{ opacity: commitmentsTitleOpacity, y: commitmentsTitleY, filter: commitmentsTitleFilter, width: 'min(860px, calc(100vw - 96px))', marginBottom: 18 }}>
              <div style={{ fontSize: 12, lineHeight: 1, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', marginBottom: 18 }}>Our commitments</div>
            </motion.div>
            <div style={{ width: 'min(860px, calc(100vw - 96px))', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {advantages.map((item, i) => (
                <CommitmentLine key={item.title} item={item} index={i} progress={progress} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MobileStory() {
  const presentationRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: presentationRef, offset: ['start start', 'end end'] })

  return (
    <section className="relative lg:hidden" style={{ overflowX: 'clip' }} aria-label="Nothing Records story">
      <div className="absolute inset-x-0 top-0" style={{ height: '50%', background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(127,176,255,0.09), transparent 70%)' }} />
      <div className="relative min-h-[100dvh] px-5 pb-10 pt-[80px]">
        <div className="flex min-h-[calc(100dvh-110px)] flex-col justify-center">
          <motion.p style={{ fontSize: '9px', letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.25)', marginBottom: '16px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
            Independent Electronic Music Label
          </motion.p>
          <motion.h1 style={{ fontSize: 'clamp(3rem, 15vw, 4.5rem)', fontWeight: 200, lineHeight: 0.92, letterSpacing: '-0.04em', color: '#f0f0f0' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            NOTHING<br /><span style={{ color: 'rgba(240,240,240,0.32)' }}>RECORDS</span>
          </motion.h1>
          <motion.p style={{ fontSize: '14px', lineHeight: 1.75, color: 'rgba(240,240,240,0.44)', marginTop: '20px', maxWidth: '32ch', fontWeight: 300 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            Premium distribution, optional promotion, and direct answers for electronic artists.
          </motion.p>
          <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '32px' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}>
            {actions.map(({ label, description, Icon }, index) => (
              <ActionRow key={label} label={label} href="#mobile-presentation" description={description} Icon={Icon} index={index} />
            ))}
          </motion.div>
        </div>
      </div>
      <div id="mobile-presentation" ref={presentationRef} style={{ height: '400dvh', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'sticky', top: 0, height: '100dvh', overflow: 'clip', background: 'linear-gradient(to bottom, rgba(5,5,5,0.95), rgba(5,5,5,0.99))' }}>
          <SystemPresentation progress={scrollYProgress} mobile />
        </div>
      </div>
    </section>
  )
}

function DesktopStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const reducedMotion = useReducedMotion()
  const [centerDeltaX, setCenterDeltaX] = useState(0)

  const measure = () => {
    if (!spacerRef.current || !h1Ref.current) return
    const spacerRect = spacerRef.current.getBoundingClientRect()
    const h1Width = h1Ref.current.offsetWidth
    const vpCenter = window.innerWidth / 2
    const naturalLeft = spacerRect.left
    const delta = vpCenter - naturalLeft - h1Width / 2
    setCenterDeltaX(delta)
  }

  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  })

  const sceneOpacity = useTransform(scrollYProgress, [0, 0.1, 0.88, 1], [1, 1, 1, 0])
  const h1X = useTransform(scrollYProgress, [0.08, 0.26, 0.34, 0.46], reducedMotion ? [0, 0, 0, 0] : [0, centerDeltaX, centerDeltaX, centerDeltaX])
  const h1Y = useTransform(scrollYProgress, [0.26, 0.34, 0.46], reducedMotion ? [0, 0, 0] : [0, 0, -110])
  const h1Opacity = useTransform(scrollYProgress, [0, 0.10, 0.36, 0.46], [1, 1, 1, 0])
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.08, 0.28], [1, 1, 0])
  const rightColOpacity = useTransform(scrollYProgress, [0, 0.10, 0.30], [1, 1, 0])
  const contentOpacity = useTransform(scrollYProgress, [0.40, 0.50], [0, 1])
  const contentY = useTransform(scrollYProgress, [0.40, 0.50], [20, 0])
  const presentationProgress = useTransform(scrollYProgress, [0.44, 0.96], [0, 1])

  return (
    <div ref={containerRef} className="relative hidden lg:block" style={{ height: '580vh' }}>
      <div className="sticky top-0 h-dvh overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ opacity: sceneOpacity }}>
          <Scene mouseX={0} mouseY={0} />
        </motion.div>

        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, rgba(5,5,5,0.6) 65%, #050505 100%)' }} />
        <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none" style={{ height: '32%', background: 'linear-gradient(to bottom, transparent, rgba(5,5,5,0.92) 80%, #050505)' }} />

        <div className="relative z-20 flex h-full items-center">
          <div className="section-shell w-full">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '64px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <motion.p style={{ fontSize: '9px', letterSpacing: '0.46em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.25)', marginBottom: '22px', opacity: eyebrowOpacity }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.9 }}>
                  Independent Electronic Music Label
                </motion.p>

                <div ref={spacerRef} aria-hidden style={{ fontSize: 'clamp(4.5rem, 9vw, 8rem)', fontWeight: 200, lineHeight: 0.92, letterSpacing: '-0.04em', visibility: 'hidden', userSelect: 'none', pointerEvents: 'none' }}>
                  NOTHING<br />RECORDS
                </div>

                <motion.p style={{ fontSize: '14px', lineHeight: 1.75, color: 'rgba(240,240,240,0.46)', marginTop: '28px', maxWidth: '38ch', fontWeight: 300, opacity: eyebrowOpacity }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}>
                  Premium distribution, optional promotion, and direct answers for electronic artists.
                </motion.p>
              </div>

              <motion.div style={{ opacity: rightColOpacity, width: '300px', flexShrink: 0 }}>
                <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}>
                  {actions.map((card, i) => <ActionRow key={card.label} {...card} index={i} />)}
                </motion.div>
                <motion.div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}>
                  <motion.span style={{ fontSize: '9px', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.16)' }} animate={{ opacity: [0.16, 0.3, 0.16] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                    Scroll to explore
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.h1
          ref={h1Ref}
          style={{ position: 'absolute', top: '50%', left: spacerRef.current ? spacerRef.current.getBoundingClientRect().left : undefined, translateY: '-50%', x: h1X, y: h1Y, opacity: h1Opacity, zIndex: 25, fontSize: 'clamp(4.5rem, 9vw, 8rem)', fontWeight: 200, lineHeight: 0.92, letterSpacing: '-0.04em', color: '#f0f0f0', userSelect: 'none', pointerEvents: 'none' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          NOTHING<br />
          <span style={{ color: 'rgba(240,240,240,0.28)' }}>RECORDS</span>
        </motion.h1>

        <motion.div className="absolute inset-0 z-20" style={{ opacity: contentOpacity, y: contentY }}>
          <SystemPresentation progress={presentationProgress} />
        </motion.div>

        <motion.div className="absolute bottom-8 inset-x-0 z-20 flex justify-center" style={{ opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]) }}>
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

