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
import { useRef } from 'react'

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
  { eyebrow: '01', title: 'Direct release management.', body: 'We distribute your track for 10% of royalties, keep the workflow simple, and show every number in one place.', Icon: VinylRecord },
  { eyebrow: '02', title: 'Release support with momentum.', body: 'We handle the release and pair it with social media campaigns and playlist outreach on digital platforms when your track needs extra reach.', Icon: Sparkle },
  { eyebrow: '03', title: 'A second life for the right record.', body: 'If a track is already out but still has room to grow, we reframe it as a stronger release and give it the push it deserves.', Icon: WaveSine },
]

const advantages = [
  { title: 'Royalty access', body: 'Always access your royalties through a private dashboard.', Icon: Timer },
  { title: 'Promo transparency', body: 'Always know which promotional actions were invested in your track.', Icon: CheckCircle },
  { title: 'Straight feedback', body: 'If a track does not meet our standards, we say it clearly. No ghosting.', Icon: ShieldCheck },
]

const SLIDES_END = 0.72
const SLIDE_SLOT = SLIDES_END / 4
const FADE_IN_END  = 0.25
const HOLD_END     = 0.75
const FADE_OUT_END = 0.95

const COMMIT_START        = 0.72
const COMMIT_ROWS_START   = 0.76
const COMMIT_ROW_STAGGER  = 0.07
const COMMIT_ROW_DURATION = 0.08

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

function ProgressBar({ progress, visible }: { progress: MotionValue<number>; visible: MotionValue<number> }) {
  const stepRanges = [
    [0, SLIDE_SLOT],
    [SLIDE_SLOT, SLIDE_SLOT * 2],
    [SLIDE_SLOT * 2, SLIDE_SLOT * 3],
    [SLIDE_SLOT * 3, SLIDES_END],
    [COMMIT_START, 1.0],
  ]
  return (
    <motion.div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', alignItems: 'center', gap: '6px', opacity: visible }}>
      {stepRanges.map(([start, end], i) => <ProgressSegment key={i} progress={progress} start={start} end={end} />)}
    </motion.div>
  )
}

function ProgressSegment({ progress, start, end }: { progress: MotionValue<number>; start: number; end: number }) {
  const fill = useTransform(progress, [start, end], [0, 1])
  const width = useTransform(fill, (v) => `${Math.min(100, Math.max(0, v * 100))}%`)
  const segOpacity = useTransform(progress, [start - 0.02, start, end, end + 0.02], [0.25, 1, 1, 0.25])
  return (
    <motion.div style={{ width: '28px', height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', opacity: segOpacity, flexShrink: 0 }}>
      <motion.div style={{ height: '100%', width, background: 'rgba(127,176,255,0.7)', borderRadius: '2px', boxShadow: '0 0 4px rgba(127,176,255,0.4)' }} />
    </motion.div>
  )
}

function SystemSlide({ progress, index, eyebrow, title, body, mobile = false }: {
  progress: MotionValue<number>; index: number; eyebrow?: string; title: string; body: string; mobile?: boolean
}) {
  const start      = index * SLIDE_SLOT
  const fadeInEnd  = start + SLIDE_SLOT * FADE_IN_END
  const holdEnd    = start + SLIDE_SLOT * HOLD_END
  const fadeOutEnd = start + SLIDE_SLOT * FADE_OUT_END

  const opacity = useTransform(progress, [start, fadeInEnd, holdEnd, fadeOutEnd], [0, 1, 1, 0])
  const y       = useTransform(progress, [start, fadeInEnd, holdEnd, fadeOutEnd], [40, 0, 0, -32])
  const blur    = useTransform(progress, [start, fadeInEnd, holdEnd, fadeOutEnd], [20, 0, 0, 16])
  const filter  = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity, y, filter, pointerEvents: 'none' }}>
      <div style={{ width: '100%', maxWidth: mobile ? 'min(92vw, 560px)' : 'min(68vw, 820px)', margin: '0 auto', textAlign: 'center', padding: mobile ? '0 20px' : '0 32px' }}>
        {eyebrow ? <p className="label-caps" style={{ marginBottom: mobile ? '14px' : '20px', color: 'rgba(127,176,255,0.55)' }}>{eyebrow}</p> : null}
        <h2 style={{ fontSize: mobile ? 'clamp(2rem, 10vw, 3rem)' : 'clamp(2.8rem, 5vw, 5.2rem)', fontWeight: 200, letterSpacing: '-0.05em', color: '#f0f0f0', lineHeight: 0.94, marginBottom: mobile ? '18px' : '24px', whiteSpace: 'pre-line' }}>
          {title}
        </h2>
        <p style={{ margin: '0 auto', maxWidth: mobile ? '30ch' : '44ch', fontSize: mobile ? '13px' : '15px', lineHeight: mobile ? 1.72 : 1.82, color: 'rgba(240,240,240,0.38)', fontWeight: 300 }}>
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
  const start = COMMIT_ROWS_START + index * COMMIT_ROW_STAGGER
  const end   = start + COMMIT_ROW_DURATION

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

function SystemPresentation({ progress, mobile = false }: { progress: MotionValue<number>; mobile?: boolean }) {
  const commitmentsOpacity = useTransform(progress, [COMMIT_START, COMMIT_START + 0.06], [0, 1])
  const commitmentsY       = useTransform(progress, [COMMIT_START, COMMIT_START + 0.06], [48, 0])
  const commitmentsScale   = useTransform(progress, [COMMIT_START, COMMIT_START + 0.06], [0.96, 1])
  const commitmentsBlur    = useTransform(progress, [COMMIT_START, COMMIT_START + 0.06], [18, 0])
  const commitmentsFilter  = useMotionTemplate`blur(${commitmentsBlur}px)`
  const barVisible = useTransform(progress, [0.02, 0.08, 0.92, 0.98], [0, 1, 1, 0])

  return (
    <div className="absolute inset-0">
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SystemSlide progress={progress} index={0} title={'One clear\nsystem.'} body="Every artist gets the same honest framework — choose how much support you need." mobile={mobile} />
        {releaseModes.map((mode, i) => (
          <SystemSlide key={mode.eyebrow} progress={progress} index={i + 1} eyebrow={mode.eyebrow} title={mode.title} body={mode.body} mobile={mobile} />
        ))}
        <motion.div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: commitmentsOpacity, y: commitmentsY, scale: commitmentsScale, filter: commitmentsFilter, pointerEvents: 'none' }}>
          <div style={{ width: '100%', maxWidth: mobile ? 'min(92vw, 560px)' : 'min(60vw, 720px)', margin: '0 auto', padding: mobile ? '0 20px' : '0 32px' }}>
            <p className="label-caps" style={{ marginBottom: mobile ? '20px' : '28px', textAlign: 'center' }}>Our commitments</p>
            <div style={{ margin: '0 auto', maxWidth: mobile ? '100%' : '660px' }}>
              {advantages.map((item, i) => (
                <CommitmentRevealRow key={item.title} progress={progress} index={i} title={item.title} body={item.body} Icon={item.Icon} mobile={mobile} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <ProgressBar progress={progress} visible={barVisible} />
    </div>
  )
}

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
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const reducedMotion = useReducedMotion()

  const sceneOpacity = useTransform(scrollYProgress, [0, 0.1, 0.88, 1], [1, 1, 1, 0])

  // Phase 1 [0 → 0.10]: everything static, user just landed
  // Phase 2 [0.10 → 0.22]: eyebrow + subtitle + right col fade+blur out, h1 slides to center
  // Phase 3 [0.22 → 0.26]: h1 itself fades out with blur
  // Phase 4 [0.26+]: presentation fades in

  // eyebrow "Independent..." + subtitle paragraph fade out early
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.08, 0.14, 0.20], [1, 1, 0, 0])
  const eyebrowBlurVal = useTransform(scrollYProgress, [0.08, 0.20], [0, reducedMotion ? 0 : 10])
  const eyebrowFilter  = useMotionTemplate`blur(${eyebrowBlurVal}px)`

  // right column (action buttons) fades out same window as eyebrow
  const rightColOpacity = useTransform(scrollYProgress, [0, 0.08, 0.18, 0.24], [1, 1, 0, 0])
  const rightColBlurVal = useTransform(scrollYProgress, [0.08, 0.22], [0, reducedMotion ? 0 : 14])
  const rightColFilter  = useMotionTemplate`blur(${rightColBlurVal}px)`

  // h1 slides from left-aligned to horizontal center of viewport [0.08 → 0.22]
  // then fades out [0.20 → 0.26]
  const h1X       = useTransform(scrollYProgress, [0.08, 0.22], ['0%', '22%'])
  const h1Opacity = useTransform(scrollYProgress, [0, 0.10, 0.20, 0.26], [1, 1, 1, 0])
  const h1BlurVal = useTransform(scrollYProgress, [0.20, 0.26], [0, reducedMotion ? 0 : 10])
  const h1Filter  = useMotionTemplate`blur(${h1BlurVal}px)`

  const contentOpacity = useTransform(scrollYProgress, [0.22, 0.30], [0, 1])
  const contentY       = useTransform(scrollYProgress, [0.22, 0.30], [24, 0])
  const presentationProgress = useTransform(scrollYProgress, [0.26, 0.96], [0, 1])

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

              {/* Left column — eyebrow + h1 + subtitle, each animated independently */}
              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>

                {/* eyebrow fades out first */}
                <motion.p
                  style={{ fontSize: '9px', letterSpacing: '0.46em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.25)', marginBottom: '22px', opacity: eyebrowOpacity, filter: eyebrowFilter }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.9 }}
                >
                  Independent Electronic Music Label
                </motion.p>

                {/* h1 slides to center then fades */}
                <motion.h1
                  style={{
                    fontSize: 'clamp(4.5rem, 9vw, 8rem)',
                    fontWeight: 200,
                    lineHeight: 0.92,
                    letterSpacing: '-0.04em',
                    color: '#f0f0f0',
                    userSelect: 'none',
                    x: h1X,
                    opacity: h1Opacity,
                    filter: h1Filter,
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  NOTHING<br />
                  <span style={{ color: 'rgba(240,240,240,0.28)' }}>RECORDS</span>
                </motion.h1>

                {/* subtitle fades out with eyebrow */}
                <motion.p
                  style={{ fontSize: '14px', lineHeight: 1.75, color: 'rgba(240,240,240,0.46)', marginTop: '28px', maxWidth: '38ch', fontWeight: 300, opacity: eyebrowOpacity, filter: eyebrowFilter }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                >
                  Premium distribution, optional promotion, and direct answers for electronic artists.
                </motion.p>
              </div>

              {/* Right column — action buttons, fades out independently */}
              <motion.div style={{ opacity: rightColOpacity, filter: rightColFilter, width: '300px', flexShrink: 0 }}>
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
