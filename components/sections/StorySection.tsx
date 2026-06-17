'use client'

import dynamic from 'next/dynamic'
import type { MotionValue } from 'framer-motion'
import type { ComponentType } from 'react'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion'
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
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

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
  { eyebrow: '01', title: 'Direct release management', body: 'We distribute your track for 10% of royalties, keep the workflow simple, and show every number in one place.', Icon: VinylRecord },
  { eyebrow: '02', title: 'Release support with momentum', body: 'We handle the release and pair it with social media campaigns and playlist outreach on digital platforms when your track needs extra reach.', Icon: Sparkle },
  { eyebrow: '03', title: 'A second life for the right record', body: 'If a track is already out but still has room to grow, we reframe it as a stronger release and give it the push it deserves.', Icon: WaveSine },
]

const advantages = [
  { title: 'Royalty access', body: 'Always access your royalties through a private dashboard.', Icon: Timer },
  { title: 'Promo transparency', body: 'Always know which promotional actions were invested in your track.', Icon: CheckCircle },
  { title: 'Straight feedback', body: 'If a track does not meet our standards, we say it clearly. No ghosting.', Icon: ShieldCheck },
]

// ============================================================
//  ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ============================================================

function ActionRow({ label, href, description, Icon, index }: {
  label: string; href: string; description: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>; index: number
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

// ============================================================
//  НОВЫЙ БЛОК "ONE CLEAR SYSTEM" – КАРТОЧКИ
// ============================================================

function ModeCard({
  progress,
  index,
  eyebrow,
  title,
  body,
  Icon,
  mobile = false,
}: {
  progress: MotionValue<number>
  index: number
  eyebrow: string
  title: string
  body: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>
  mobile?: boolean
}) {
  // Каждая карточка появляется с задержкой
  const start = 0.50 + index * 0.10
  const end = start + 0.12

  const opacity = useTransform(progress, [start, end], [0, 1])
  const y = useTransform(progress, [start, end], [40, 0])
  const scale = useTransform(progress, [start, end], [0.95, 1])
  const blur = useTransform(progress, [start, end], [8, 0])
  const filter = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div
      style={{
        opacity,
        y,
        scale,
        filter,
        display: 'flex',
        alignItems: 'flex-start',
        gap: mobile ? '16px' : '20px',
        padding: mobile ? '16px 18px' : '20px 24px',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        cursor: 'default',
      }}
      whileHover={{
        background: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(127,176,255,0.2)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        <Icon size={mobile ? 18 : 22} weight="regular" style={{ color: 'rgba(127,176,255,0.6)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', color: 'rgba(127,176,255,0.5)' }}>
            {eyebrow}
          </span>
          <span style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(240,240,240,0.85)' }}>
            {title}
          </span>
        </div>
        <p style={{ fontSize: mobile ? '13px' : '14px', lineHeight: 1.6, color: 'rgba(240,240,240,0.4)', margin: 0 }}>
          {body}
        </p>
      </div>
    </motion.div>
  )
}

function CommitmentRevealRow({ progress, index, title, body, Icon, mobile = false }: {
  progress: MotionValue<number>; index: number; title: string; body: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>; mobile?: boolean
}) {
  const start = 0.86 + index * 0.04
  const end   = start + 0.06

  const opacity = useTransform(progress, [start, end], [0, 1])
  const y       = useTransform(progress, [start, end], [28, 0])
  const blur    = useTransform(progress, [start, end], [14, 0])
  const filter  = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div style={{ opacity, y, filter, display: 'flex', alignItems: 'flex-start', gap: mobile ? '14px' : '16px', padding: mobile ? '18px 0' : '22px 0', borderBottom: index < advantages.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
      <Icon size={mobile ? 15 : 17} weight="regular" style={{ color: 'rgba(127,176,255,0.55)', flexShrink: 0, marginTop: '3px' }} />
      <div>
        <h3 style={{ fontSize: mobile ? '15px' : '18px', fontWeight: 600, color: 'rgba(240,240,240,0.9)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
          {title}
        </h3>
        <p style={{ fontSize: mobile ? '13px' : '15px', lineHeight: 1.72, color: 'rgba(240,240,240,0.38)', maxWidth: '44ch' }}>
          {body}
        </p>
      </div>
    </motion.div>
  )
}

// ============================================================
//  ГЛАВНЫЙ КОМПОНЕНТ ПРЕЗЕНТАЦИИ (НОВАЯ ВЕРСИЯ)
// ============================================================

function SystemPresentation({ progress, mobile = false }: { progress: MotionValue<number>; mobile?: boolean }) {
  const titleOpacity = useTransform(progress, [0.44, 0.50], [0, 1])
  const titleY = useTransform(progress, [0.44, 0.50], [20, 0])

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        style={{
          width: '100%',
          maxWidth: mobile ? 'min(92vw, 560px)' : 'min(68vw, 820px)',
          margin: '0 auto',
          padding: mobile ? '0 20px' : '0 32px',
        }}
      >
        {/* Заголовок */}
        <motion.div style={{ opacity: titleOpacity, y: titleY, marginBottom: mobile ? '32px' : '48px', textAlign: 'center' }}>
          <p className="label-caps" style={{ color: 'rgba(127,176,255,0.55)', marginBottom: '8px' }}>
            One clear system
          </p>
          <h2
            style={{
              fontSize: mobile ? 'clamp(2rem, 8vw, 2.8rem)' : 'clamp(2.8rem, 4vw, 4rem)',
              fontWeight: 200,
              letterSpacing: '-0.04em',
              color: '#f0f0f0',
              lineHeight: 1.1,
            }}
          >
            Choose your release path.
          </h2>
        </motion.div>

        {/* Карточки режимов */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '12px' : '16px', marginBottom: mobile ? '40px' : '60px' }}>
          {releaseModes.map((mode, index) => (
            <ModeCard
              key={mode.eyebrow}
              progress={progress}
              index={index}
              eyebrow={mode.eyebrow}
              title={mode.title}
              body={mode.body}
              Icon={mode.Icon}
              mobile={mobile}
            />
          ))}
        </div>

        {/* Блок "Our commitments" – появляется после карточек */}
        <motion.div style={{ opacity: useTransform(progress, [0.86, 0.94], [0, 1]), y: useTransform(progress, [0.86, 0.94], [30, 0]) }}>
          <p className="label-caps" style={{ marginBottom: mobile ? '20px' : '28px', textAlign: 'left' }}>
            Our commitments
          </p>
          <div style={{ margin: '0 auto', maxWidth: mobile ? '100%' : '660px' }}>
            {advantages.map((item, i) => (
              <CommitmentRevealRow
                key={item.title}
                progress={progress}
                index={i}
                title={item.title}
                body={item.body}
                Icon={item.Icon}
                mobile={mobile}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================
//  MOBILE И DESKTOP ВЕРСИИ
// ============================================================

function MobileStory() {
  const presentationRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: presentationRef, offset: ['start start', 'end end'] })

  return (
    <section className="relative overflow-hidden md:hidden" aria-label="Nothing Records story">
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
        <div style={{ position: 'sticky', top: 0, height: '100dvh', overflow: 'hidden', background: 'linear-gradient(to bottom, rgba(5,5,5,0.95), rgba(5,5,5,0.99))' }}>
          <SystemPresentation progress={scrollYProgress} mobile />
        </div>
      </div>
    </section>
  )
}

function DesktopStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const spacerRef    = useRef<HTMLDivElement>(null)
  const h1Ref        = useRef<HTMLHeadingElement>(null)

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const reducedMotion = useReducedMotion()

  const [centerDeltaX, setCenterDeltaX] = useState(0)

  const measure = () => {
    if (!spacerRef.current || !h1Ref.current) return
    const spacerRect = spacerRef.current.getBoundingClientRect()
    const h1Width    = h1Ref.current.offsetWidth
    const vpCenter   = window.innerWidth / 2
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

  const h1X = useTransform(
    scrollYProgress,
    [0.08, 0.26, 0.34, 0.46],
    reducedMotion ? [0, 0, 0, 0] : [0, centerDeltaX, centerDeltaX, centerDeltaX]
  )
  const h1Y = useTransform(
    scrollYProgress,
    [0.26, 0.34, 0.46],
    reducedMotion ? [0, 0, 0] : [0, 0, -110]
  )
  const h1Opacity = useTransform(scrollYProgress, [0, 0.10, 0.36, 0.46], [1, 1, 1, 0])

  const eyebrowOpacity  = useTransform(scrollYProgress, [0, 0.08, 0.28], [1, 1, 0])
  const rightColOpacity = useTransform(scrollYProgress, [0, 0.10, 0.30], [1, 1, 0])

  const contentOpacity = useTransform(scrollYProgress, [0.40, 0.50], [0, 1])
  const contentY       = useTransform(scrollYProgress, [0.40, 0.50], [20, 0])
  const presentationProgress = useTransform(scrollYProgress, [0.44, 0.96], [0, 1])

  return (
    <div ref={containerRef} className="relative hidden md:block" style={{ height: '580vh' }}>
      <div className="sticky top-0 h-dvh overflow-hidden">

        <motion.div className="absolute inset-0 z-0" style={{ opacity: sceneOpacity }}>
          <Scene mouseX={0} mouseY={0} />
        </motion.div>

        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, rgba(5,5,5,0.6) 65%, #050505 100%)' }} />
        <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none" style={{ height: '32%', background: 'linear-gradient(to bottom, transparent, rgba(5,5,5,0.92) 80%, #050505)' }} />

        <div className="relative z-20 flex h-full items-center">
          <div className="section-shell w-full">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '64px' }}>

              {/* Left column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <motion.p
                  style={{
                    fontSize: '9px', letterSpacing: '0.46em', textTransform: 'uppercase',
                    color: 'rgba(240,240,240,0.25)', marginBottom: '22px',
                    opacity: eyebrowOpacity,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.9 }}
                >
                  Independent Electronic Music Label
                </motion.p>

                <div
                  ref={spacerRef}
                  aria-hidden
                  style={{
                    fontSize: 'clamp(4.5rem, 9vw, 8rem)',
                    fontWeight: 200,
                    lineHeight: 0.92,
                    letterSpacing: '-0.04em',
                    visibility: 'hidden',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  NOTHING<br />RECORDS
                </div>

                <motion.p
                  style={{
                    fontSize: '14px', lineHeight: 1.75, color: 'rgba(240,240,240,0.46)',
                    marginTop: '28px', maxWidth: '38ch', fontWeight: 300,
                    opacity: eyebrowOpacity,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                >
                  Premium distribution, optional promotion, and direct answers for electronic artists.
                </motion.p>
              </div>

              {/* Right column */}
              <motion.div style={{ opacity: rightColOpacity, width: '300px', flexShrink: 0 }}>
                <motion.div
                  style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  {actions.map((card, i) => <ActionRow key={card.label} {...card} index={i} />)}
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

        <motion.h1
          ref={h1Ref}
          style={{
            position: 'absolute',
            top: '50%',
            left: spacerRef.current ? spacerRef.current.getBoundingClientRect().left : undefined,
            translateY: '-50%',
            x: h1X,
            y: h1Y,
            opacity: h1Opacity,
            zIndex: 25,
            fontSize: 'clamp(4.5rem, 9vw, 8rem)',
            fontWeight: 200,
            lineHeight: 0.92,
            letterSpacing: '-0.04em',
            color: '#f0f0f0',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
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