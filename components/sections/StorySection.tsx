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
import { useCallback, useRef } from 'react'

const Scene = dynamic(
  () => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })),
  { ssr: false, loading: () => null }
)

const actions = [
  {
    label: 'Distribution only',
    href: '#explore',
    description: 'Release your track worldwide. We take 10% of royalties.',
    Icon: UploadSimple,
    accent: 'rgba(127, 176, 255, 0.55)',
  },
  {
    label: 'Distribution + promo',
    href: '#explore',
    description: 'Social campaigns and playlist pitching on digital platforms.',
    Icon: Sparkle,
    accent: 'rgba(149, 214, 255, 0.5)',
  },
  {
    label: 'Re-release with potential',
    href: '#explore',
    description: 'Already released? We can give it the push it deserves.',
    Icon: Repeat,
    accent: 'rgba(255, 255, 255, 0.35)',
  },
]

const releaseModes = [
  {
    eyebrow: '01 / Distribution only',
    title: 'Direct release management.',
    body:
      'We distribute your track for 10% of royalties, keep the workflow simple, and show every number in one place.',
    accent: 'rgba(127, 176, 255, 0.95)',
    Icon: VinylRecord,
  },
  {
    eyebrow: '02 / Distribution plus promo',
    title: 'Release support with momentum.',
    body:
      'We handle the release and pair it with social media campaigns and playlist outreach on digital platforms when your track needs extra reach.',
    accent: 'rgba(149, 214, 255, 0.92)',
    Icon: Sparkle,
  },
  {
    eyebrow: '03 / Existing track, bigger potential',
    title: 'A second life for the right record.',
    body:
      'If a track is already out but still has room to grow, we reframe it as a stronger release and give it the push it deserves.',
    accent: 'rgba(255, 255, 255, 0.82)',
    Icon: WaveSine,
  },
]

const advantages = [
  {
    title: 'Royalty access',
    body: 'You always have access to your royalties through a private dashboard.',
    Icon: Timer,
  },
  {
    title: 'Promo transparency',
    body: 'You always know exactly which promotional actions were invested in your track.',
    Icon: CheckCircle,
  },
  {
    title: 'Straight feedback',
    body: 'If a track does not meet our standards, we say it clearly — no ghosting, no silence.',
    Icon: ShieldCheck,
  },
]

function ActionCard({
  label,
  href,
  description,
  Icon,
  accent,
  index,
}: {
  label: string
  href: string
  description: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold'; className?: string }>
  accent: string
  index: number
}) {
  return (
    <motion.a
      href={href}
      className="group relative flex min-h-[168px] flex-col rounded-[26px] p-5 text-left md:min-h-[188px] md:p-6"
      style={{
        background:
          'linear-gradient(165deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 42%, rgba(255,255,255,0.015) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -18px 32px rgba(0,0,0,0.22), 0 22px 56px rgba(0,0,0,0.38)',
        textDecoration: 'none',
      }}
      whileHover={{
        y: -5,
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -18px 32px rgba(0,0,0,0.18), 0 30px 70px rgba(0,0,0,0.45)',
      }}
      whileTap={{ scale: 0.985 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="absolute inset-0 rounded-[26px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 30% 0%, ${accent}, transparent 58%)`,
        }}
        aria-hidden="true"
      />

      <span
        className="relative mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[18px] border border-white/12"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 10px 28px ${accent.replace('0.55', '0.18').replace('0.5', '0.16').replace('0.35', '0.12')}`,
        }}
      >
        <Icon size={24} weight="regular" className="text-white" />
      </span>

      <div className="relative mt-auto">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] font-light tracking-[-0.01em] text-white md:text-[15px]">{label}</span>
          <ArrowRight
            size={15}
            weight="regular"
            className="shrink-0 text-white/35 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/70"
          />
        </div>
        <p className="mt-2 text-[12px] leading-[1.65] text-white/48 md:text-[13px]">{description}</p>
      </div>
    </motion.a>
  )
}

function RevealCard({
  progress,
  index,
  eyebrow,
  title,
  body,
  accent,
  Icon,
}: {
  progress: MotionValue<number>
  index: number
  eyebrow: string
  title: string
  body: string
  accent: string
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold'; className?: string }>
}) {
  const start = 0.38 + index * 0.12
  const opacity = useTransform(progress, [start, start + 0.06, start + 0.14], [0, 1, 1])
  const y = useTransform(progress, [start, start + 0.14], [56, 0])
  const scale = useTransform(progress, [start, start + 0.14], [0.94, 1])
  const blur = useTransform(progress, [start, start + 0.1], [6, 0])
  const filter = useTransform(blur, (v) => `blur(${v}px)`)

  return (
    <motion.article
      style={{ opacity, y, scale, filter }}
      className="glass relative overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-6"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.1), transparent 32%, rgba(255,255,255,0.04) 68%, transparent)',
        }}
      />
      <div className="relative flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6"
          style={{ boxShadow: `0 0 0 1px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.08)` }}
        >
          <Icon size={22} weight="regular" className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.36em] uppercase text-white/36">{eyebrow}</p>
          <h3 className="mt-3 text-[1.15rem] font-light tracking-[-0.03em] text-white md:text-[1.35rem]">
            {title}
          </h3>
          <p className="mt-3 max-w-[36ch] text-sm leading-7 text-white/60">{body}</p>
        </div>
      </div>
    </motion.article>
  )
}

function AdvantageItem({
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
  Icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold'; className?: string }>
}) {
  const start = 0.72 + index * 0.06
  const opacity = useTransform(progress, [start, start + 0.05], [0, 1])
  const x = useTransform(progress, [start, start + 0.05], [-24, 0])

  return (
    <motion.div style={{ opacity, x }} className="glass rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
          <Icon size={18} weight="regular" className="text-white" />
        </div>
        <div>
          <h3 className="text-[14px] font-light tracking-[-0.01em] text-white">{title}</h3>
          <p className="mt-1.5 max-w-[34ch] text-[13px] leading-6 text-white/56">{body}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function StorySection() {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.12, 0.28], [1, 1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.28], [0, -72])
  const heroScale = useTransform(scrollYProgress, [0, 0.28], [1, 0.96])
  const heroBlur = useTransform(scrollYProgress, [0.1, 0.28], [0, 10])
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0])

  const exploreOpacity = useTransform(scrollYProgress, [0, 0.08, 0.22], [1, 1, 0])

  const storyOpacity = useTransform(scrollYProgress, [0.18, 0.34], [0, 1])
  const storyY = useTransform(scrollYProgress, [0.18, 0.38], [80, 0])
  const introOpacity = useTransform(scrollYProgress, [0.22, 0.36], [0, 1])
  const introY = useTransform(scrollYProgress, [0.22, 0.36], [40, 0])
  const panelGlow = useTransform(scrollYProgress, [0.3, 0.65], [0.12, 0.5])
  const heroFilter = useTransform(heroBlur, (v) => `blur(${v}px)`)

  const scrollToPresentation = useCallback(() => {
    const section = ref.current
    if (!section) return
    const target = section.offsetTop + section.offsetHeight * 0.22
    window.scrollTo({ top: target, behavior: 'smooth' })
  }, [])

  return (
    <section
      id="explore"
      ref={ref}
      className="relative min-h-[320dvh]"
      aria-label="Nothing Records story"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* Ambient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 18%, rgba(127, 176, 255, 0.1), transparent 28%), linear-gradient(180deg, #07080d 0%, #050505 100%)',
          }}
        />

        {/* 3D scene — fades with hero */}
        <motion.div className="absolute inset-0 z-0" style={{ opacity: sceneOpacity }}>
          <Scene mouseX={0} mouseY={0} />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 90% 70% at 50% 42%, transparent 10%, rgba(5,5,5,0.55) 55%, #050505 100%)',
            }}
          />
        </motion.div>

        {/* ── Hero layer ── */}
        <motion.div
          className="absolute inset-0 z-10 flex flex-col px-5 pt-[88px] pb-28 md:px-8"
          style={{
            opacity: heroOpacity,
            y: reducedMotion ? 0 : heroY,
            scale: reducedMotion ? 1 : heroScale,
            filter: reducedMotion ? 'none' : heroFilter,
          }}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center text-center">
            <motion.p
              className="font-mono text-[10px] tracking-[0.52em] uppercase text-white/34"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Independent electronic music label
            </motion.p>

            <motion.h1
              className="mt-5 select-none font-extralight leading-[0.9] tracking-[-0.06em] text-white"
              style={{ fontSize: 'clamp(3.2rem, 11vw, 7.5rem)' }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              NOTHING
              <br />
              <span className="text-white/42">RECORDS</span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-[48ch] text-[15px] leading-8 text-white/52 md:text-[16px]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              Premium distribution, optional promotion, and direct answers — built for artists who want clarity.
            </motion.p>

            <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
              {actions.map((action, index) => (
                <ActionCard key={action.label} {...action} index={index} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Explore scroll cue */}
        <motion.button
          type="button"
          onClick={scrollToPresentation}
          className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 border-0 bg-transparent p-2 text-white/50 transition-colors hover:text-white/80"
          style={{ opacity: exploreOpacity }}
          aria-label="Scroll to explore"
        >
          <span className="font-mono text-[10px] tracking-[0.38em] uppercase">Explore</span>
          <motion.span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={16} weight="regular" />
          </motion.span>
        </motion.button>

        {/* ── Apple-style presentation layer ── */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center px-5 py-[88px] md:px-8 md:py-[80px]"
          style={{
            opacity: storyOpacity,
            y: reducedMotion ? 0 : storyY,
          }}
        >
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-10">
            {/* Left column — intro + advantages */}
            <motion.div style={{ opacity: introOpacity, y: reducedMotion ? 0 : introY }}>
              <p className="font-mono text-[10px] tracking-[0.52em] uppercase text-white/34">Explore the model</p>
              <h2 className="mt-5 text-[clamp(2.2rem,5.5vw,4.4rem)] font-extralight leading-[0.96] tracking-[-0.06em] text-white">
                Three release paths.
                <br />
                One clear system.
              </h2>
              <p className="mt-5 max-w-[40ch] text-[14px] leading-7 text-white/56 md:text-[15px]">
                Some artists only need distribution. Some need release support and promo. Some already have a track
                out and just need a stronger launch. We keep those paths separate and explain them plainly.
              </p>

              <div className="mt-8 space-y-3">
                <p className="font-mono text-[10px] tracking-[0.38em] uppercase text-white/30">
                  Why work with us
                </p>
                {advantages.map((item, index) => (
                  <AdvantageItem key={item.title} progress={scrollYProgress} index={index} {...item} />
                ))}
              </div>
            </motion.div>

            {/* Right column — scroll-revealed cards */}
            <div className="relative">
              <motion.div
                className="pointer-events-none absolute -inset-8 rounded-[40px] bg-[radial-gradient(circle_at_top,rgba(127,176,255,0.2),transparent_55%)]"
                style={{ opacity: panelGlow }}
              />
              <div className="relative grid gap-3">
                {releaseModes.map((item, index) => (
                  <RevealCard
                    key={item.eyebrow}
                    progress={scrollYProgress}
                    index={index}
                    eyebrow={item.eyebrow}
                    title={item.title}
                    body={item.body}
                    accent={item.accent}
                    Icon={item.Icon}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
