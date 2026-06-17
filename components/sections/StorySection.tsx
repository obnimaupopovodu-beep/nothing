'use client'

import dynamic from 'next/dynamic'
import type { MotionValue } from 'framer-motion'
import type { ComponentType } from 'react'
import {
  MotionConfig,
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
import { useEffect, useRef, useState } from 'react'

// ─── 3D Scene ────────────────────────────────────────────────────────────────

const SceneFallback = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-black" />
)

const Scene = dynamic(
  () => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })),
  { ssr: false, loading: () => <SceneFallback /> }
)

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActionItem {
  label: string
  href: string
  description: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold'; 'aria-hidden'?: boolean | 'true' | 'false' }>
}

interface ReleaseMode {
  eyebrow: string
  title: string
  body: string
  Icon: ActionItem['Icon']
}

interface Advantage {
  title: string
  body: string
  Icon: ActionItem['Icon']
}

interface ActionRowProps extends ActionItem {
  index: number
}

interface ModeCardProps {
  progress: MotionValue<number>
  index: number
  eyebrow: string
  title: string
  body: string
  Icon: ActionItem['Icon']
  mobile?: boolean
  reducedMotion: boolean
}

interface CommitmentRowProps {
  progress: MotionValue<number>
  index: number
  title: string
  body: string
  Icon: ActionItem['Icon']
  mobile?: boolean
  reducedMotion: boolean
  isLast: boolean
}

interface SystemPresentationProps {
  progress: MotionValue<number>
  mobile?: boolean
  reducedMotion: boolean
}

// ─── Data ────────────────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const

const actions: ActionItem[] = [
  { label: 'Distribution only',    href: '#explore', description: '10% royalties. Worldwide release.',      Icon: UploadSimple },
  { label: 'Distribution + promo', href: '#explore', description: 'Social campaigns and playlist pitching.', Icon: Sparkle },
  { label: 'Re-release',           href: '#explore', description: 'Give an existing track a stronger launch.', Icon: Repeat },
]

const releaseModes: ReleaseMode[] = [
  { eyebrow: '01', title: 'Direct release management',          body: 'We distribute your track for 10% of royalties, keep the workflow simple, and show every number in one place.',                              Icon: VinylRecord },
  { eyebrow: '02', title: 'Release support with momentum',      body: 'We handle the release and pair it with social media campaigns and playlist outreach on digital platforms when your track needs extra reach.', Icon: Sparkle },
  { eyebrow: '03', title: 'A second life for the right record', body: 'If a track is already out but still has room to grow, we reframe it as a stronger release and give it the push it deserves.',               Icon: WaveSine },
]

const advantages: Advantage[] = [
  { title: 'Royalty access',    body: 'Always access your royalties through a private dashboard.',                       Icon: Timer },
  { title: 'Promo transparency', body: 'Always know which promotional actions were invested in your track.',             Icon: CheckCircle },
  { title: 'Straight feedback', body: 'If a track does not meet our standards, we say it clearly. No ghosting.',        Icon: ShieldCheck },
]

// ─── Animation timing config ─────────────────────────────────────────────────

const T = {
  card:        (i: number) => ({ start: 0.50 + i * 0.10, end: 0.50 + i * 0.10 + 0.12 }),
  commitment:  (i: number) => ({ start: 0.86 + i * 0.04, end: 0.86 + i * 0.04 + 0.06 }),
  titleIn:     { start: 0.44, end: 0.50 },
  commitBlock: { start: 0.86, end: 0.94 },
  // Desktop h1 travel
  h1Move:      [0.08, 0.26, 0.34, 0.46] as const,
  h1Fade:      [0, 0.10, 0.36, 0.46]    as const,
  eyebrow:     [0, 0.08, 0.28]          as const,
  rightCol:    [0, 0.10, 0.30]          as const,
  content:     { start: 0.40, end: 0.50 },
  presentation:{ start: 0.44, end: 0.96 },
  scene:       [0, 0.1, 0.88, 1]        as const,
  arrow:       [0, 0.06]                as const,
}

// ─── ActionRow ───────────────────────────────────────────────────────────────

function ActionRow({ label, href, description, Icon, index }: ActionRowProps) {
  return (
    <motion.a
      href={href}
      aria-label={`${label} — ${description}`}
      className="group flex items-center gap-3.5 rounded-[10px] border border-white/[0.07] bg-white/[0.03] px-4 py-[14px] no-underline
                 transition-[background,border-color] duration-200
                 hover:border-[rgba(127,176,255,0.16)] hover:bg-[rgba(127,176,255,0.05)]"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0 + index * 0.08, duration: 0.6, ease: EASE }}
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

// ─── ModeCard ────────────────────────────────────────────────────────────────

function ModeCard({ progress, index, eyebrow, title, body, Icon, mobile = false, reducedMotion }: ModeCardProps) {
  const { start, end } = T.card(index)

  const opacity = useTransform(progress, [start, end], [0, 1])
  const y       = useTransform(progress, [start, end], reducedMotion ? [0, 0] : [40, 0])
  const scale   = useTransform(progress, [start, end], reducedMotion ? [1, 1] : [0.95, 1])
  const blur    = useTransform(progress, [start, end], reducedMotion ? [0, 0] : [8, 0])
  const filter  = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div
      style={{ opacity, y, scale, filter, willChange: 'opacity, transform, filter' }}
      className={`flex items-start rounded-2xl border border-white/[0.06] bg-white/[0.03] cursor-default
                  transition-[background,border-color,box-shadow] duration-200
                  hover:border-[rgba(127,176,255,0.2)] hover:bg-white/[0.06] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]
                  ${mobile ? 'gap-4 p-[16px_18px]' : 'gap-5 p-[20px_24px]'}`}
    >
      <div className="mt-0.5 shrink-0">
        <Icon size={mobile ? 18 : 22} weight="regular" aria-hidden="true" className="text-[rgba(127,176,255,0.6)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-3">
          <span className="text-[11px] font-medium tracking-[0.08em] text-[rgba(127,176,255,0.5)]">{eyebrow}</span>
          <span className="text-[15px] font-medium text-white/[0.85]">{title}</span>
        </div>
        <p className={`m-0 leading-relaxed text-white/40 ${mobile ? 'text-[13px]' : 'text-[14px]'}`}>{body}</p>
      </div>
    </motion.div>
  )
}

// ─── CommitmentRevealRow ─────────────────────────────────────────────────────

function CommitmentRevealRow({ progress, index, title, body, Icon, mobile = false, reducedMotion, isLast }: CommitmentRowProps) {
  const { start, end } = T.commitment(index)

  const opacity = useTransform(progress, [start, end], [0, 1])
  const y       = useTransform(progress, [start, end], reducedMotion ? [0, 0] : [28, 0])
  const blur    = useTransform(progress, [start, end], reducedMotion ? [0, 0] : [14, 0])
  const filter  = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div
      style={{ opacity, y, filter, willChange: 'opacity, transform, filter' }}
      className={`flex items-start ${mobile ? 'gap-[14px] py-[18px]' : 'gap-4 py-[22px]'} ${!isLast ? 'border-b border-white/[0.05]' : ''}`}
    >
      <Icon size={mobile ? 15 : 17} weight="regular" aria-hidden="true" className="mt-[3px] shrink-0 text-[rgba(127,176,255,0.55)]" />
      <div>
        <h3 className={`mb-1.5 font-semibold tracking-[-0.02em] text-white/90 ${mobile ? 'text-[15px]' : 'text-[18px]'}`}>{title}</h3>
        <p className={`max-w-[44ch] leading-[1.72] text-white/[0.38] ${mobile ? 'text-[13px]' : 'text-[15px]'}`}>{body}</p>
      </div>
    </motion.div>
  )
}

// ─── SystemPresentation ──────────────────────────────────────────────────────

function SystemPresentation({ progress, mobile = false, reducedMotion }: SystemPresentationProps) {
  const { start: tS, end: tE }  = T.titleIn
  const { start: cS, end: cE }  = T.commitBlock

  const titleOpacity = useTransform(progress, [tS, tE], [0, 1])
  const titleY       = useTransform(progress, [tS, tE], reducedMotion ? [0, 0] : [20, 0])

  const commitOpacity = useTransform(progress, [cS, cE], [0, 1])
  const commitY       = useTransform(progress, [cS, cE], reducedMotion ? [0, 0] : [30, 0])

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        style={{ maxWidth: mobile ? 'min(92vw, 560px)' : 'min(68vw, 820px)' }}
        className={`w-full mx-auto ${mobile ? 'px-5' : 'px-8'}`}
      >
        {/* Title */}
        <motion.div style={{ opacity: titleOpacity, y: titleY }} className={`text-center ${mobile ? 'mb-8' : 'mb-12'}`}>
          <p className="label-caps mb-2 text-[rgba(127,176,255,0.55)]">One clear system</p>
          <h2
            style={{ fontSize: mobile ? 'clamp(2rem, 8vw, 2.8rem)' : 'clamp(2.8rem, 4vw, 4rem)' }}
            className="font-extralight leading-[1.1] tracking-[-0.04em] text-[#f0f0f0]"
          >
            Choose your release path.
          </h2>
        </motion.div>

        {/* Mode cards */}
        <div className={`flex flex-col ${mobile ? 'gap-3 mb-10' : 'gap-4 mb-[60px]'}`}>
          {releaseModes.map((mode, i) => (
            <ModeCard
              key={mode.eyebrow}
              progress={progress}
              index={i}
              eyebrow={mode.eyebrow}
              title={mode.title}
              body={mode.body}
              Icon={mode.Icon}
              mobile={mobile}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        {/* Commitments */}
        <motion.div style={{ opacity: commitOpacity, y: commitY }}>
          <p className={`label-caps text-left ${mobile ? 'mb-5' : 'mb-7'}`}>Our commitments</p>
          <div style={{ maxWidth: mobile ? '100%' : '660px' }} className="mx-auto">
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
                isLast={i === advantages.length - 1}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── AnimatedTitle ───────────────────────────────────────────────────────────

interface AnimatedTitleProps {
  h1Ref: React.RefObject<HTMLHeadingElement>
  scrollYProgress: MotionValue<number>
  offsetLeft?: number
  reducedMotion: boolean
}

function AnimatedTitle({ h1Ref, scrollYProgress, offsetLeft, reducedMotion }: AnimatedTitleProps) {
  const [centerDeltaX, setCenterDeltaX] = useState(0)

  useEffect(() => {
    const measure = () => {
      if (!h1Ref.current) return
      const rect      = h1Ref.current.getBoundingClientRect()
      const vpCenter  = window.innerWidth / 2
      setCenterDeltaX(vpCenter - rect.left - rect.width / 2)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [h1Ref])

  const h1X       = useTransform(scrollYProgress, [...T.h1Move], reducedMotion ? [0, 0, 0, 0] : [0, centerDeltaX, centerDeltaX, centerDeltaX])
  const h1Y       = useTransform(scrollYProgress, [T.h1Move[1], T.h1Move[2], T.h1Move[3]], reducedMotion ? [0, 0, 0] : [0, 0, -110])
  const h1Opacity = useTransform(scrollYProgress, [...T.h1Fade], [1, 1, 1, 0])

  return (
    <motion.h1
      ref={h1Ref}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: offsetLeft,
        translateY: '-50%',
        x: h1X,
        y: h1Y,
        opacity: h1Opacity,
        zIndex: 25,
        fontSize: 'clamp(4.5rem, 9vw, 8rem)',
        willChange: 'transform, opacity',
      }}
      className="font-extralight leading-[0.92] tracking-[-0.04em] text-[#f0f0f0] select-none pointer-events-none"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
    >
      NOTHING<br />
      <span className="text-white/[0.28]">RECORDS</span>
    </motion.h1>
  )
}

// ─── HeroContent (left column desktop) ───────────────────────────────────────

interface HeroContentProps {
  eyebrowOpacity: MotionValue<number>
  spacerRef: React.RefObject<HTMLDivElement>
}

function HeroContent({ eyebrowOpacity, spacerRef }: HeroContentProps) {
  return (
    <div className="min-w-0 flex-1">
      <motion.p
        style={{ opacity: eyebrowOpacity }}
        className="mb-[22px] text-[9px] tracking-[0.46em] uppercase text-white/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.9 }}
      >
        Independent Electronic Music Label
      </motion.p>

      {/* Invisible spacer matching h1 size — keeps layout stable */}
      <div
        ref={spacerRef}
        aria-hidden="true"
        className="font-extralight leading-[0.92] tracking-[-0.04em] invisible select-none pointer-events-none"
        style={{ fontSize: 'clamp(4.5rem, 9vw, 8rem)' }}
      >
        NOTHING<br />RECORDS
      </div>

      <motion.p
        style={{ opacity: eyebrowOpacity }}
        className="mt-7 max-w-[38ch] text-[14px] font-light leading-[1.75] text-white/[0.46]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.0, ease: EASE }}
      >
        Premium distribution, optional promotion, and direct answers for electronic artists.
      </motion.p>
    </div>
  )
}

// ─── StorySection (single adaptive component) ────────────────────────────────

export function StorySection() {
  const reducedMotion = useReducedMotion() ?? false

  // Desktop refs
  const containerRef = useRef<HTMLDivElement>(null)
  const spacerRef    = useRef<HTMLDivElement>(null)
  const h1Ref        = useRef<HTMLHeadingElement>(null)

  // Mobile refs
  const mobileRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress: desktopProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: mobileProgress  } = useScroll({ target: mobileRef,    offset: ['start start', 'end end'] })

  // Desktop derived values
  const sceneOpacity    = useTransform(desktopProgress, [...T.scene],   [1, 1, 1, 0])
  const eyebrowOpacity  = useTransform(desktopProgress, [...T.eyebrow], [1, 1, 0])
  const rightColOpacity = useTransform(desktopProgress, [...T.rightCol],[1, 1, 0])
  const contentOpacity  = useTransform(desktopProgress, [T.content.start, T.content.end], [0, 1])
  const contentY        = useTransform(desktopProgress, [T.content.start, T.content.end], reducedMotion ? [0, 0] : [20, 0])
  const presentationProgress = useTransform(desktopProgress, [T.presentation.start, T.presentation.end], [0, 1])

  const [spacerLeft, setSpacerLeft] = useState<number | undefined>(undefined)
  useEffect(() => {
    const update = () => setSpacerLeft(spacerRef.current?.getBoundingClientRect().left)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div id="explore">

        {/* ── MOBILE (< md) ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden md:hidden" aria-label="Nothing Records story">
          {/* Ambient gradient */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
               style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(127,176,255,0.09), transparent 70%)' }} />

          {/* Hero */}
          <div className="relative min-h-[100dvh] px-5 pb-10 pt-20">
            <div className="flex min-h-[calc(100dvh-110px)] flex-col justify-center">
              <motion.p
                className="mb-4 text-[9px] tracking-[0.42em] uppercase text-white/25"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Independent Electronic Music Label
              </motion.p>

              {/* Semantic h1 — lives only here on mobile */}
              <motion.h1
                style={{ fontSize: 'clamp(3rem, 15vw, 4.5rem)' }}
                className="font-extralight leading-[0.92] tracking-[-0.04em] text-[#f0f0f0]"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
              >
                NOTHING<br /><span className="text-white/30">RECORDS</span>
              </motion.h1>

              <motion.p
                className="mt-5 max-w-[32ch] text-[14px] font-light leading-[1.75] text-white/[0.44]"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
              >
                Premium distribution, optional promotion, and direct answers for electronic artists.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-col gap-2"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.1, ease: EASE }}
              >
                {actions.map(({ label, description, Icon }, i) => (
                  <ActionRow key={label} label={label} href="#mobile-presentation" description={description} Icon={Icon} index={i} />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Sticky presentation scroll */}
          <div
            id="mobile-presentation"
            ref={mobileRef}
            style={{ height: '400dvh', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="sticky top-0 h-[100dvh] overflow-hidden"
                 style={{ background: 'linear-gradient(to bottom, rgba(5,5,5,0.95), rgba(5,5,5,0.99))' }}>
              <SystemPresentation progress={mobileProgress} mobile reducedMotion={reducedMotion} />
            </div>
          </div>
        </section>

        {/* ── DESKTOP (≥ md) ────────────────────────────────────────── */}
        <div ref={containerRef} className="relative hidden md:block" style={{ height: '580vh' }}>
          <div className="sticky top-0 h-dvh overflow-hidden">

            {/* 3D scene */}
            <motion.div className="absolute inset-0 z-0" style={{ opacity: sceneOpacity }}>
              <Scene mouseX={0} mouseY={0} />
            </motion.div>

            {/* Vignette overlays */}
            <div className="pointer-events-none absolute inset-0 z-10"
                 style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, rgba(5,5,5,0.6) 65%, #050505 100%)' }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
                 style={{ height: '32%', background: 'linear-gradient(to bottom, transparent, rgba(5,5,5,0.92) 80%, #050505)' }} />

            {/* Hero layout */}
            <div className="relative z-20 flex h-full items-center">
              <div className="section-shell w-full">
                <div className="flex items-center justify-between gap-16">

                  <HeroContent eyebrowOpacity={eyebrowOpacity} spacerRef={spacerRef} />

                  {/* Right column — action cards */}
                  <motion.div style={{ opacity: rightColOpacity }} className="w-[300px] shrink-0">
                    <motion.div
                      className="flex flex-col gap-[7px]"
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
                    >
                      {actions.map((card, i) => <ActionRow key={card.label} {...card} index={i} />)}
                    </motion.div>

                    <motion.div
                      className="mt-5 flex items-center gap-2"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 2.0 }}
                    >
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

            {/* Flying h1 — visually matches spacer, aria-hidden */}
            <AnimatedTitle
              h1Ref={h1Ref}
              scrollYProgress={desktopProgress}
              offsetLeft={spacerLeft}
              reducedMotion={reducedMotion}
            />

            {/* System presentation overlay */}
            <motion.div className="absolute inset-0 z-20" style={{ opacity: contentOpacity, y: contentY }}>
              <SystemPresentation progress={presentationProgress} reducedMotion={reducedMotion} />
            </motion.div>

            {/* Scroll arrow */}
            <motion.div
              className="absolute inset-x-0 bottom-8 z-20 flex justify-center"
              style={{ opacity: useTransform(desktopProgress, [...T.arrow], [1, 0]) }}
              aria-hidden="true"
            >
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
                <ArrowDown size={16} weight="light" className="text-white/[0.18]" />
              </motion.div>
            </motion.div>

          </div>
        </div>

      </div>
    </MotionConfig>
  )
}
