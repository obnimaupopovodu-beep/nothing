'use client'

import dynamic from 'next/dynamic'
import type { MotionValue } from 'framer-motion'
import type { ComponentType } from 'react'
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

// Slides 0-3 occupy [0, 0.72]. Commitments start at 0.72.
// Each slide slot = 0.72 / 4 = 0.18. All slides fade OUT before 0.72.
const SLIDES_END = 0.72
const SLIDE_SLOT = SLIDES_END / 4

function SystemSlide({
  progress,
  index,
  eyebrow,
  title,
  body,
  mobile = false,
}: {
  progress: MotionValue<number>
  index: number
  eyebrow?: string
  title: string
  body: string
  mobile?: boolean
}) {
  const start = index * SLIDE_SLOT
  const mid = start + SLIDE_SLOT * 0.35
  const hold = start + SLIDE_SLOT * 0.60
  const end = start + SLIDE_SLOT * 0.88

  const opacity = useTransform(progress, [start, mid, hold, end], [0, 1, 1, 0])
  const y = useTransform(progress, [start, mid, hold, end], [40, 0, 0, -32])
  const blur = useTransform(progress, [start, mid, hold, end], [20, 0, 0, 16])
  const filter = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        y,
        filter,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: mobile ? 'min(92vw, 560px)' : 'min(68vw, 820px)',
          margin: '0 auto',
          textAlign: 'center',
          padding: mobile ? '0 20px' : '0 32px',
        }}
      >
        {eyebrow ? (
          <p
            className="label-caps"
            style={{
              marginBottom: mobile ? '14px' : '20px',
              color: 'rgba(127,176,255,0.55)',
            }}
          >
            {eyebrow}
          </p>
        ) : null}

        <h2
          style={{
            fontSize: mobile ? 'clamp(2rem, 10vw, 3rem)' : 'clamp(2.8rem, 5vw, 5.2rem)',
            fontWeight: 200,
            letterSpacing: '-0.05em',
            color: '#f0f0f0',
            lineHeight: 0.94,
            marginBottom: mobile ? '18px' : '24px',
            whiteSpace: 'pre-line',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: '0 auto',
            maxWidth: mobile ? '30ch' : '44ch',
            fontSize: mobile ? '13px' : '15px',
            lineHeight: mobile ? 1.72 : 1.82,
            color: 'rgba(240,240,240,0.38)',
            fontWeight: 300,
          }}
        >
          {body}
        </p>
      </div>
    </motion.div>
  )
}

// Commitments: block fades in at 0.72, rows stagger within [0.76, 0.97]
// 3 rows, stagger = 0.07 each → last row ends at 0.76 + 2*0.07 + 0.08 = 0.97 ✓
const COMMIT_START = 0.72
const COMMIT_ROWS_START = 0.76
const COMMIT_ROW_STAGGER = 0.07
const COMMIT_ROW_DURATION = 0.08

function CommitmentRevealRow({
  progress,
  index,
  title,
  body,
  Icon,
  mobile = false,
}: {
  progress: MotionValue<number>
  index: number
  title: string
  body: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>
  mobile?: boolean
}) {
  const start = COMMIT_ROWS_START + index * COMMIT_ROW_STAGGER
  const end = start + COMMIT_ROW_DURATION

  const opacity = useTransform(progress, [start, end], [0, 1])
  const y = useTransform(progress, [start, end], [28, 0])
  const blur = useTransform(progress, [start, end], [14, 0])
  const filter = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div
      style={{
        opacity,
        y,
        filter,
        display: 'flex',
        alignItems: 'flex-start',
        gap: mobile ? '14px' : '16px',
        padding: mobile ? '18px 0' : '20px 0',
        borderBottom: index < advantages.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}
    >
      <Icon
        size={mobile ? 14 : 15}
        weight="regular"
        style={{ color: 'rgba(127,176,255,0.55)', flexShrink: 0, marginTop: '2px' }}
      />
      <div>
        <h3
          style={{
            fontSize: mobile ? '13px' : '14px',
            fontWeight: 600,
            color: 'rgba(240,240,240,0.9)',
            marginBottom: '4px',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: mobile ? '12px' : '13px',
            lineHeight: 1.72,
            color: 'rgba(240,240,240,0.38)',
            maxWidth: '44ch',
          }}
        >
          {body}
        </p>
      </div>
    </motion.div>
  )
}

function SystemPresentation({
  progress,
  mobile = false,
}: {
  progress: MotionValue<number>
  mobile?: boolean
}) {
  const commitmentsOpacity = useTransform(progress, [COMMIT_START, COMMIT_START + 0.06], [0, 1])
  const commitmentsY = useTransform(progress, [COMMIT_START, COMMIT_START + 0.06], [48, 0])
  const commitmentsScale = useTransform(progress, [COMMIT_START, COMMIT_START + 0.06], [0.96, 1])
  const commitmentsBlur = useTransform(progress, [COMMIT_START, COMMIT_START + 0.06], [18, 0])
  const commitmentsFilter = useMotionTemplate`blur(${commitmentsBlur}px)`

  return (
    <div className="absolute inset-0">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SystemSlide
          progress={progress}
          index={0}
          title={'One clear\nsystem.'}
          body="Every artist gets the same honest framework — choose how much support you need."
          mobile={mobile}
        />

        {releaseModes.map((mode, i) => (
          <SystemSlide
            key={mode.eyebrow}
            progress={progress}
            index={i + 1}
            eyebrow={mode.eyebrow}
            title={mode.title}
            body={mode.body}
            mobile={mobile}
          />
        ))}

        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: commitmentsOpacity,
            y: commitmentsY,
            scale: commitmentsScale,
            filter: commitmentsFilter,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: mobile ? 'min(92vw, 560px)' : 'min(60vw, 720px)',
              margin: '0 auto',
              padding: mobile ? '0 20px' : '0 32px',
            }}
          >
            <p
              className="label-caps"
              style={{
                marginBottom: mobile ? '20px' : '28px',
                textAlign: 'center',
              }}
            >
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
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function MobileStory() {
  const presentationRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: presentationRef,
    offset: ['start start', 'end end'],
  })

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
              <ActionRow key={label} label={label} href="#mobile-presentation" description={description} Icon={Icon} index={index} />
            ))}
          </motion.div>
        </div>
      </div>

      <div
        id="mobile-presentation"
        ref={presentationRef}
        style={{
          height: '400dvh',
          position: 'relative',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100dvh',
            overflow: 'hidden',
            background: 'linear-gradient(to bottom, rgba(5,5,5,0.95), rgba(5,5,5,0.99))',
          }}
        >
          <SystemPresentation progress={scrollYProgress} mobile />
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

  const titleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.18, 0.26], [1, 1, 1, 0])
  const titleY = useTransform(scrollYProgress, [0.18, 0.26], ['0%', '-6%'])
  const titleBlurVal = useTransform(scrollYProgress, [0.18, 0.26], [0, reducedMotion ? 0 : 10])
  const titleFilter = useMotionTemplate`blur(${titleBlurVal}px)`

  const contentOpacity = useTransform(scrollYProgress, [0.22, 0.3], [0, 1])
  const contentY = useTransform(scrollYProgress, [0.22, 0.3], [24, 0])

  const presentationProgress = useTransform(scrollYProgress, [0.26, 0.96], [0, 1])

  return (
    <div ref={containerRef} className="relative hidden md:block" style={{ height: '580vh' }}>
      <div className="sticky top-0 h-dvh overflow-hidden">

        <motion.div className="absolute inset-0 z-0" style={{ opacity: sceneOpacity }}>
          <Scene mouseX={0} mouseY={0} />
        </motion.div>

        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, rgba(5,5,5,0.6) 65%, #050505 100%)' }}
        />
        <div
          className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
          style={{ height: '32%', background: 'linear-gradient(to bottom, transparent, rgba(5,5,5,0.92) 80%, #050505)' }}
        />

        <div className="relative z-20 flex h-full items-center">
          <div className="section-shell w-full">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '64px' }}>

              <motion.div style={{ opacity: titleOpacity, y: titleY, filter: titleFilter, flex: 1, minWidth: 0 }}>
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

              <motion.div style={{ opacity: titleOpacity, filter: titleFilter, width: '300px', flexShrink: 0 }}>
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

        <motion.div
          className="absolute inset-0 z-20"
          style={{ opacity: contentOpacity, y: contentY }}
        >
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
