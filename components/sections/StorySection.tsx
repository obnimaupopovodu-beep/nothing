'use client'

import dynamic from 'next/dynamic'
import type { MotionValue } from 'framer-motion'
import type { ComponentType } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
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
  { ssr: false, loading: () => <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-black" /> }
)

// ─── Data ────────────────────────────────────────────────────────────────────

const actions = [
  { label: 'Distribution only',    href: '#explore', description: '10% royalties. Worldwide release.',         Icon: UploadSimple },
  { label: 'Distribution + promo', href: '#explore', description: 'Social campaigns and playlist pitching.',   Icon: Sparkle },
  { label: 'Re-release',           href: '#explore', description: 'Give an existing track a stronger launch.', Icon: Repeat },
]

const releaseModes = [
  { eyebrow: '01', title: 'Direct release management.',       body: 'We distribute your track for 10% of royalties, keep the workflow simple, and show every number in one place.',                              Icon: VinylRecord },
  { eyebrow: '02', title: 'Release support with momentum.',   body: 'We handle the release and pair it with social media campaigns and playlist outreach on digital platforms when your track needs extra reach.', Icon: Sparkle },
  { eyebrow: '03', title: 'A second life for the right record.', body: 'If a track is already out but still has room to grow, we reframe it as a stronger release and give it the push it deserves.',           Icon: WaveSine },
]

const advantages = [
  { title: 'Royalty access',     body: 'Always access your royalties through a private dashboard.',                       Icon: Timer },
  { title: 'Promo transparency', body: 'Always know which promotional actions were invested in your track.',             Icon: CheckCircle },
  { title: 'Straight feedback',  body: 'If a track does not meet our standards, we say it clearly. No ghosting.',        Icon: ShieldCheck },
]

// ─── Animation timing ────────────────────────────────────────────────────────

const T = {
  headerIn:      [0.00, 0.14] as const,
  headerToTop:   [0.54, 0.70] as const,
  card01In:      [0.18, 0.30] as const,
  card02In:      [0.26, 0.38] as const,
  card03In:      [0.36, 0.48] as const,
  card01Conv:    [0.42, 0.68] as const,
  card02Conv:    [0.46, 0.70] as const,
  card03Conv:    [0.38, 0.50] as const,
  cardsY:        [0.54, 0.72] as const,
  commitIn:      [0.78, 0.86] as const,
  commitRow:     (i: number) => [0.82 + i * 0.05, 0.88 + i * 0.05] as const,
} as const

const EASE_OUT  = [0.16, 1, 0.3, 1] as const
const EASE_IO   = [0.45, 0, 0.55, 1] as const

// ─── ActionRow ───────────────────────────────────────────────────────────────

function ActionRow({ label, href, description, Icon, index }: {
  label: string; href: string; description: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>; index: number
}) {
  return (
    <motion.a
      href={href}
      aria-label={`${label} — ${description}`}
      className="group flex items-center gap-3.5 rounded-[10px] border border-white/[0.07] bg-white/[0.03] px-4 py-[14px] no-underline transition-[background,border-color] duration-200 hover:border-[rgba(127,176,255,0.16)] hover:bg-[rgba(127,176,255,0.05)]"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0 + index * 0.08, duration: 0.6, ease: EASE_OUT }}
    >
      <Icon size={16} weight="regular" aria-hidden="true" className="shrink-0 text-white/35" />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium leading-none tracking-[-0.01em] text-white/[0.88]">{label}</span>
        <span className="mt-[1px] block text-[11px] text-white/30">{description}</span>
      </span>
      <ArrowRight size={13} weight="regular" aria-hidden="true" className="shrink-0 text-[rgba(127,176,255,0.4)]" />
    </motion.a>
  )
}

// ─── ReleaseCard ─────────────────────────────────────────────────────────────

type CardSlot = 'left' | 'right' | 'center'

function ReleaseCard({
  progress, eyebrow, title, body, Icon, slot, reducedMotion, mobile,
}: {
  progress: MotionValue<number>
  eyebrow: string
  title: string
  body: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>
  slot: CardSlot
  reducedMotion: boolean
  mobile?: boolean
}) {
  const inRange   = slot === 'left' ? T.card01In  : slot === 'right' ? T.card02In  : T.card03In
  const convRange = slot === 'left' ? T.card01Conv : slot === 'right' ? T.card02Conv : T.card03Conv
  const [inStart, inEnd]     = inRange
  const [convStart, convEnd] = convRange
  const [stackStart, stackEnd] = T.cardsY

  const opacity = useTransform(progress, [inStart, inEnd], [0, 1])

  const OFFSET_X = mobile ? 160 : 280
  const initX = slot === 'left' ? -OFFSET_X : slot === 'right' ? OFFSET_X : 0
  const x = useTransform(progress, [convStart, convEnd], reducedMotion ? [0, 0] : [initX, 0])

  // Vertical appear offset
  const appearY = slot === 'center' ? 24 : 0
  const yAppear = useTransform(progress, [inStart, inEnd], [appearY, 0])

  // Vertical stack offset after convergence
  const slotIndex = slot === 'left' ? 0 : slot === 'right' ? 1 : 2
  const CARD_H = mobile ? 110 : 130
  const targetY = (slotIndex - 1) * CARD_H
  const yStack = useTransform(progress, [stackStart, stackEnd], [0, reducedMotion ? 0 : targetY])

  // Sum the two y MotionValues safely
  const y = useTransform(
    [yAppear, yStack] as MotionValue<number>[],
    ([a, b]: number[]) => a + b
  )

  const blur   = useTransform(progress, [inStart, inEnd], reducedMotion ? [0, 0] : [10, 0])
  const filter = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div
      style={{
        opacity,
        x,
        y,
        filter,
        willChange: 'opacity, transform, filter',
        position: 'absolute',
        width: mobile ? 'min(88vw, 400px)' : 'min(36vw, 380px)',
        zIndex: 10,
      }}
      className={`flex items-start rounded-2xl border border-white/[0.06] bg-white/[0.03] cursor-default
                  transition-[background,border-color,box-shadow] duration-200
                  hover:border-[rgba(127,176,255,0.2)] hover:bg-white/[0.06] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]
                  ${mobile ? 'gap-4 p-[14px_16px]' : 'gap-5 p-[18px_22px]'}`}
    >
      <div className="mt-0.5 shrink-0">
        <Icon size={mobile ? 16 : 20} weight="regular" aria-hidden="true" className="text-[rgba(127,176,255,0.6)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-3">
          <span className="text-[11px] font-medium tracking-[0.08em] text-[rgba(127,176,255,0.5)]">{eyebrow}</span>
          <span className={`font-medium text-white/[0.85] ${mobile ? 'text-[13px]' : 'text-[14px]'}`}>{title}</span>
        </div>
        <p className={`m-0 leading-relaxed text-white/40 ${mobile ? 'text-[12px]' : 'text-[13px]'}`}>{body}</p>
      </div>
    </motion.div>
  )
}

// ─── CommitmentRevealRow ──────────────────────────────────────────────────────

function CommitmentRevealRow({ progress, index, title, body, Icon, mobile = false, reducedMotion }: {
  progress: MotionValue<number>; index: number; title: string; body: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>; mobile?: boolean; reducedMotion: boolean
}) {
  const [start, end] = T.commitRow(index)
  const opacity = useTransform(progress, [start, end], [0, 1])
  const y       = useTransform(progress, [start, end], reducedMotion ? [0, 0] : [28, 0])
  const blur    = useTransform(progress, [start, end], reducedMotion ? [0, 0] : [14, 0])
  const filter  = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div
      style={{ opacity, y, filter }}
      className={`flex items-start ${mobile ? 'gap-[14px] py-[16px]' : 'gap-4 py-[20px]'} ${index < advantages.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
    >
      <Icon size={mobile ? 15 : 17} weight="regular" aria-hidden="true" className="mt-[3px] shrink-0 text-[rgba(127,176,255,0.55)]" />
      <div>
        <h3 className={`mb-1.5 font-semibold tracking-[-0.02em] text-white/90 ${mobile ? 'text-[15px]' : 'text-[17px]'}`}>{title}</h3>
        <p className={`max-w-[44ch] leading-[1.72] text-white/[0.38] ${mobile ? 'text-[12px]' : 'text-[14px]'}`}>{body}</p>
      </div>
    </motion.div>
  )
}

// ─── SystemPresentation ──────────────────────────────────────────────────────

function SystemPresentation({ progress, mobile = false, reducedMotion }: {
  progress: MotionValue<number>; mobile?: boolean; reducedMotion: boolean
}) {
  const [hStart, hEnd]   = T.headerIn
  const [htStart, htEnd] = T.headerToTop
  const [cStart, cEnd]   = T.commitIn

  const headerOpacity = useTransform(progress, [hStart, hEnd], [0, 1])

  const HEADER_TRAVEL = mobile ? -200 : -240
  const headerY = useTransform(
    progress, [htStart, htEnd],
    reducedMotion ? [0, 0] : [0, HEADER_TRAVEL],
    { ease: EASE_IO }
  )
  const headerScale = useTransform(progress, [htStart, htEnd], reducedMotion ? [1, 1] : [1, 0.78])

  const commitOpacity = useTransform(progress, [cStart, cEnd], [0, 1])
  const commitY       = useTransform(progress, [cStart, cEnd], reducedMotion ? [0, 0] : [40, 0])

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">

      {/* Header */}
      <motion.div
        style={{
          opacity: headerOpacity,
          y: headerY,
          scale: headerScale,
          zIndex: 0,
          position: 'absolute',
          textAlign: 'center',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
        }}
      >
        <p className="label-caps mb-2 text-[rgba(127,176,255,0.55)]" style={{ fontSize: mobile ? '9px' : '10px' }}>
          One clear system
        </p>
        <h2
          style={{ fontSize: mobile ? 'clamp(1.6rem, 7vw, 2.4rem)' : 'clamp(2.4rem, 4vw, 3.8rem)' }}
          className="font-extralight leading-[1.05] tracking-[-0.04em] text-[#f0f0f0]"
        >
          Choose your<br />release path.
        </h2>
      </motion.div>

      {/* Release cards */}
      {releaseModes.map((mode, i) => {
        const slot: CardSlot = i === 0 ? 'left' : i === 1 ? 'right' : 'center'
        return (
          <ReleaseCard
            key={mode.eyebrow}
            progress={progress}
            eyebrow={mode.eyebrow}
            title={mode.title}
            body={mode.body}
            Icon={mode.Icon}
            slot={slot}
            reducedMotion={reducedMotion}
            mobile={mobile}
          />
        )
      })}

      {/* Commitments */}
      <motion.div
        style={{
          opacity: commitOpacity,
          y: commitY,
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', maxWidth: mobile ? 'min(92vw, 560px)' : 'min(60vw, 680px)', padding: mobile ? '0 20px' : '0 32px' }}>
          <p className={`label-caps mb-${mobile ? '5' : '7'} text-left`}>Our commitments</p>
          {advantages.map((item, i) => (
            <CommitmentRevealRow
              key={item.title}
              progress={progress}
              index={i}
              title={item.title}
              body={item.body}
              Icon={item.Icon}
              mobile={mobile}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </motion.div>

    </div>
  )
}

// ─── MobileStory ─────────────────────────────────────────────────────────────

function MobileStory() {
  const presentationRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: presentationRef, offset: ['start start', 'end end'] })
  const reducedMotion = useReducedMotion() ?? false

  return (
    <section className="relative overflow-hidden md:hidden" aria-label="Nothing Records story">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
           style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(127,176,255,0.09), transparent 70%)' }} />
      <div className="relative min-h-[100dvh] px-5 pb-10 pt-20">
        <div className="flex min-h-[calc(100dvh-110px)] flex-col justify-center">
          <motion.p className="mb-4 text-[9px] tracking-[0.42em] uppercase text-white/25"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
            Independent Electronic Music Label
          </motion.p>
          <motion.h1
            style={{ fontSize: 'clamp(3rem, 15vw, 4.5rem)' }}
            className="font-extralight leading-[0.92] tracking-[-0.04em] text-[#f0f0f0]"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: EASE_OUT }}
          >
            NOTHING<br /><span className="text-white/30">RECORDS</span>
          </motion.h1>
          <motion.p className="mt-5 max-w-[32ch] text-[14px] font-light leading-[1.75] text-white/[0.44]"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: EASE_OUT }}>
            Premium distribution, optional promotion, and direct answers for electronic artists.
          </motion.p>
          <motion.div className="mt-8 flex flex-col gap-2"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1, ease: EASE_OUT }}>
            {actions.map(({ label, description, Icon }, i) => (
              <ActionRow key={label} label={label} href="#mobile-presentation" description={description} Icon={Icon} index={i} />
            ))}
          </motion.div>
        </div>
      </div>
      <div id="mobile-presentation" ref={presentationRef}
           style={{ height: '500dvh', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="sticky top-0 h-[100dvh] overflow-hidden"
             style={{ background: 'linear-gradient(to bottom, rgba(5,5,5,0.95), rgba(5,5,5,0.99))' }}>
          <SystemPresentation progress={scrollYProgress} mobile reducedMotion={reducedMotion} />
        </div>
      </div>
    </section>
  )
}

// ─── DesktopStory ─────────────────────────────────────────────────────────────

function DesktopStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const spacerRef    = useRef<HTMLDivElement>(null)
  const h1Ref        = useRef<HTMLHeadingElement>(null)

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const reducedMotion = useReducedMotion() ?? false

  const [centerDeltaX, setCenterDeltaX] = useState(0)
  const measure = () => {
    if (!spacerRef.current || !h1Ref.current) return
    const spacerRect  = spacerRef.current.getBoundingClientRect()
    const h1Width     = h1Ref.current.offsetWidth
    const vpCenter    = window.innerWidth / 2
    setCenterDeltaX(vpCenter - spacerRect.left - h1Width / 2)
  }
  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  })

  const sceneOpacity    = useTransform(scrollYProgress, [0, 0.1, 0.88, 1], [1, 1, 1, 0])
  const h1X             = useTransform(scrollYProgress, [0.08, 0.26, 0.34, 0.46], reducedMotion ? [0,0,0,0] : [0, centerDeltaX, centerDeltaX, centerDeltaX])
  const h1Y             = useTransform(scrollYProgress, [0.26, 0.34, 0.46],        reducedMotion ? [0,0,0] : [0, 0, -110])
  const h1Opacity       = useTransform(scrollYProgress, [0, 0.10, 0.36, 0.46], [1, 1, 1, 0])
  const eyebrowOpacity  = useTransform(scrollYProgress, [0, 0.08, 0.28], [1, 1, 0])
  const rightColOpacity = useTransform(scrollYProgress, [0, 0.10, 0.30], [1, 1, 0])
  const contentOpacity  = useTransform(scrollYProgress, [0.40, 0.50], [0, 1])
  const contentY        = useTransform(scrollYProgress, [0.40, 0.50], reducedMotion ? [0,0] : [20, 0])
  const presentationProgress = useTransform(scrollYProgress, [0.44, 0.97], [0, 1])

  return (
    <div ref={containerRef} className="relative hidden md:block" style={{ height: '640vh' }}>
      <div className="sticky top-0 h-dvh overflow-hidden">

        <motion.div className="absolute inset-0 z-0" style={{ opacity: sceneOpacity }}>
          <Scene mouseX={0} mouseY={0} />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 z-10"
             style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, rgba(5,5,5,0.6) 65%, #050505 100%)' }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
             style={{ height: '32%', background: 'linear-gradient(to bottom, transparent, rgba(5,5,5,0.92) 80%, #050505)' }} />

        {/* Hero layout */}
        <div className="relative z-20 flex h-full items-center">
          <div className="section-shell w-full">
            <div className="flex items-center justify-between gap-16">
              <div className="min-w-0 flex-1">
                <motion.p
                  style={{ opacity: eyebrowOpacity }}
                  className="mb-[22px] text-[9px] tracking-[0.46em] uppercase text-white/25"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.9 }}
                >
                  Independent Electronic Music Label
                </motion.p>
                <div ref={spacerRef} aria-hidden="true"
                     className="invisible select-none pointer-events-none font-extralight leading-[0.92] tracking-[-0.04em]"
                     style={{ fontSize: 'clamp(4.5rem, 9vw, 8rem)' }}>
                  NOTHING<br />RECORDS
                </div>
                <motion.p
                  style={{ opacity: eyebrowOpacity }}
                  className="mt-7 max-w-[38ch] text-[14px] font-light leading-[1.75] text-white/[0.46]"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 1.0, ease: EASE_OUT }}
                >
                  Premium distribution, optional promotion, and direct answers for electronic artists.
                </motion.p>
              </div>
              <motion.div style={{ opacity: rightColOpacity }} className="w-[300px] shrink-0">
                <motion.div className="flex flex-col gap-[7px]"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, delay: 1.05, ease: EASE_OUT }}>
                  {actions.map((card, i) => <ActionRow key={card.label} {...card} index={i} />)}
                </motion.div>
                <motion.div className="mt-5 flex items-center gap-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}>
                  <motion.span
                    className="text-[9px] tracking-[0.38em] uppercase text-white/[0.16]"
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

        {/* Flying h1 */}
        <motion.h1
          ref={h1Ref}
          aria-hidden="true"
          style={{
            position: 'absolute', top: '50%',
            left: spacerRef.current ? spacerRef.current.getBoundingClientRect().left : undefined,
            translateY: '-50%',
            x: h1X, y: h1Y, opacity: h1Opacity,
            zIndex: 25,
            fontSize: 'clamp(4.5rem, 9vw, 8rem)',
            willChange: 'transform, opacity',
          }}
          className="font-extralight leading-[0.92] tracking-[-0.04em] text-[#f0f0f0] select-none pointer-events-none"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: EASE_OUT }}
        >
          NOTHING<br /><span className="text-white/[0.28]">RECORDS</span>
        </motion.h1>

        {/* System Presentation */}
        <motion.div className="absolute inset-0 z-20" style={{ opacity: contentOpacity, y: contentY }}>
          <SystemPresentation progress={presentationProgress} reducedMotion={reducedMotion} />
        </motion.div>

        {/* Scroll arrow */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-8 z-20 flex justify-center"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]) }}
        >
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDown size={16} weight="light" className="text-white/[0.18]" />
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function StorySection() {
  return (
    <div id="explore">
      <MobileStory />
      <DesktopStory />
    </div>
  )
}
