'use client'

import dynamic from 'next/dynamic'
import type { MotionValue } from 'framer-motion'
import type { ComponentType } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
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
    description: '10% royalties. Worldwide release.',
    Icon: UploadSimple,
    accent: 'rgba(127, 176, 255, 0.55)',
  },
  {
    label: 'Distribution + promo',
    href: '#explore',
    description: 'Social campaigns and playlist pitching.',
    Icon: Sparkle,
    accent: 'rgba(149, 214, 255, 0.5)',
  },
  {
    label: 'Re-release',
    href: '#explore',
    description: 'Give an existing track a stronger launch.',
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
      className="group relative flex items-center gap-4 rounded-2xl px-5 py-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        textDecoration: 'none',
      }}
      whileHover={{ backgroundColor: 'rgba(127,176,255,0.06)', borderColor: 'rgba(127,176,255,0.18)' }}
      whileTap={{ scale: 0.985 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 + index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <Icon size={20} weight="regular" className="text-white/70" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-white">{label}</span>
        <span className="mt-0.5 block text-[11px] text-white/40">{description}</span>
      </span>
      <ArrowRight
        size={14}
        weight="regular"
        className="shrink-0 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#7fb0ff]/60"
      />
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
  const y = useTransform(progress, [start, start + 0.14], [32, 0])

  return (
    <motion.article
      style={{ opacity, y }}
      className="flex items-start gap-5 border-b border-white/[0.06] py-7"
    >
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <Icon size={18} weight="regular" className="text-white/60" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-white/30 mb-2">{eyebrow}</p>
        <h3 className="text-[1rem] font-light tracking-[-0.025em] text-white mb-2">{title}</h3>
        <p className="text-[13px] leading-6 text-white/45">{body}</p>
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
  const start = 0.78 + index * 0.04
  const opacity = useTransform(progress, [start, start + 0.08], [0, 1])
  const y = useTransform(progress, [start, start + 0.08], [20, 0])

  return (
    <motion.div
      style={{ opacity, y }}
      className="flex items-start gap-4 border-b border-white/[0.05] py-5"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
        <Icon size={16} weight="regular" className="text-[#7fb0ff]/70" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-medium text-white mb-1">{title}</h3>
        <p className="text-[12px] leading-5 text-white/40">{body}</p>
      </div>
    </motion.div>
  )
}

function AdvantagesBlock({ progress }: { progress: MotionValue<number> }) {
  const headerOpacity = useTransform(progress, [0.7, 0.8], [0, 1])
  const headerY = useTransform(progress, [0.7, 0.8], [24, 0])

  return (
    <motion.div style={{ opacity: headerOpacity, y: headerY }} className="mt-24 md:mt-32">
      <div className="flex flex-col md:flex-row md:items-start md:gap-16">
        {/* Left: header */}
        <div className="mb-8 md:mb-0 md:w-48 md:shrink-0 md:pt-1">
          <p className="label-caps mb-3">Why work with us</p>
          <p className="text-[13px] text-white/35 leading-5">What you can always count on.</p>
        </div>
        {/* Right: list */}
        <div className="flex-1 min-w-0">
          {advantages.map((item, index) => (
            <AdvantageItem key={item.title} progress={progress} index={index} {...item} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function MobileStory() {
  return (
    <section className="relative overflow-hidden md:hidden" aria-label="Nothing Records story">
      <div
        className="absolute inset-x-0 top-0 h-[42rem]"
        style={{
          background:
            'radial-gradient(circle at 50% 18%, rgba(127,176,255,0.16), transparent 36%), linear-gradient(180deg, #07080d 0%, #050505 84%)',
        }}
      />

      <div className="relative min-h-[100dvh] px-5 pb-8 pt-[88px]">
        <div className="mx-auto flex min-h-[calc(100dvh-120px)] max-w-[25rem] flex-col justify-center">
          <p className="label-caps mb-6">Independent electronic music label</p>

          <h1 className="select-none text-[3.2rem] font-extralight leading-[0.9] tracking-[-0.04em] text-white">
            NOTHING
            <br />
            <span className="text-white/38">RECORDS</span>
          </h1>

          <p className="mt-6 text-[14px] font-light leading-7 text-white/45 max-w-[22rem]">
            Premium distribution, optional promotion, and direct answers for electronic artists.
          </p>

          <div className="mt-9 flex flex-col gap-2.5">
            {actions.map(({ label, description, Icon, accent }, index) => (
              <ActionCard
                key={label}
                label={label}
                href="#mobile-model"
                description={description}
                Icon={Icon}
                accent={accent}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile release modes */}
      <div
        id="mobile-model"
        className="relative border-t border-white/[0.06] px-5 py-16"
      >
        <div className="mx-auto max-w-[25rem]">
          <p className="label-caps mb-2">Three release paths</p>
          <h2 className="mt-3 text-[1.6rem] font-extralight tracking-[-0.035em] text-white">
            One clear system.
          </h2>
          <p className="mt-4 text-[14px] leading-7 text-white/45">
            Every artist gets the same honest framework — choose how much support you need.
          </p>

          <div className="mt-10 flex flex-col">
            {releaseModes.map((mode, i) => (
              <div
                key={mode.eyebrow}
                className="flex items-start gap-4 border-b border-white/[0.06] py-6"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <mode.Icon size={18} weight="regular" className="text-white/60" />
                </div>
                <div>
                  <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-white/28 mb-1.5">{mode.eyebrow}</p>
                  <h3 className="text-[15px] font-light tracking-[-0.02em] text-white mb-1.5">{mode.title}</h3>
                  <p className="text-[13px] leading-6 text-white/42">{mode.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <p className="label-caps mb-2">Why work with us</p>
            <div className="mt-6 flex flex-col">
              {advantages.map((item) => (
                <div key={item.title} className="flex items-start gap-4 border-b border-white/[0.05] py-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                    <item.Icon size={16} weight="regular" className="text-[#7fb0ff]/70" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-white mb-1">{item.title}</h3>
                    <p className="text-[12px] leading-5 text-white/40">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

  const sceneOpacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [1, 1, 1, 0])
  const sceneScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.96])

  const titleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.22, 0.32], [1, 1, 1, 0])
  const titleY = useTransform(scrollYProgress, [0.22, 0.32], ['0%', '-8%'])

  const cardsOpacity = useTransform(scrollYProgress, [0.24, 0.34], [0, 1])
  const cardsY = useTransform(scrollYProgress, [0.24, 0.34], [32, 0])

  const releaseHeaderOpacity = useTransform(scrollYProgress, [0.28, 0.38], [0, 1])
  const releaseHeaderY = useTransform(scrollYProgress, [0.28, 0.38], [24, 0])

  return (
    <div ref={containerRef} className="relative hidden md:block" style={{ height: '580vh' }}>
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* 3D scene */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ opacity: sceneOpacity, scale: sceneScale }}
        >
          <Scene mouseX={0} mouseY={0} />
        </motion.div>

        {/* Radial vignette */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 20%, rgba(5,5,5,0.55) 60%, #050505 100%)',
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
          style={{
            height: '35%',
            background: 'linear-gradient(to bottom, transparent, rgba(5,5,5,0.9) 80%, #050505)',
          }}
        />

        {/* Phase 1 — Hero title + action cards */}
        <div className="relative z-20 flex h-full flex-col justify-center">
          <div className="section-shell">
            {/* Two-column hero layout */}
            <div className="flex items-center justify-between gap-12">
              {/* Left: title */}
              <motion.div
                style={{ opacity: titleOpacity, y: titleY }}
                className="flex-1 min-w-0"
              >
                <motion.p
                  style={{ fontSize: '9px', letterSpacing: '0.48em', textTransform: 'uppercase', color: 'rgba(245,245,245,0.28)', marginBottom: '20px' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  Independent Electronic Music Label
                </motion.p>
                <motion.h1
                  className="font-extralight leading-none select-none"
                  style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', letterSpacing: '-0.04em', color: '#F5F5F5' }}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  NOTHING<br />
                  <span style={{ color: 'rgba(245,245,245,0.38)', fontWeight: 100 }}>RECORDS</span>
                </motion.h1>
                <motion.p
                  className="font-light"
                  style={{ fontSize: '15px', lineHeight: 1.7, color: 'rgba(245,245,245,0.4)', marginTop: '24px', maxWidth: '36ch' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                >
                  Premium distribution, optional promotion, and direct answers for electronic artists.
                </motion.p>
              </motion.div>

              {/* Right: action cards */}
              <motion.div
                style={{ opacity: titleOpacity }}
                className="w-[320px] shrink-0"
              >
                <motion.div
                  className="flex flex-col gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {actions.map((card, i) => (
                    <ActionCard key={card.label} {...card} index={i} />
                  ))}
                </motion.div>
                <motion.div
                  className="mt-6 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.0 }}
                >
                  <motion.span
                    style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(245,245,245,0.18)' }}
                    animate={{ opacity: [0.18, 0.35, 0.18] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ↓ Scroll to explore
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Phase 2 — Release modes */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center"
          style={{ opacity: cardsOpacity, y: cardsY }}
        >
          <div className="section-shell w-full">
            <div className="flex items-start gap-16">
              {/* Left: sticky heading */}
              <div className="w-56 shrink-0 pt-2">
                <motion.div style={{ opacity: releaseHeaderOpacity, y: releaseHeaderY }}>
                  <p className="label-caps mb-3">Three release paths</p>
                  <h2
                    className="font-extralight tracking-[-0.04em] text-white"
                    style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.15 }}
                  >
                    One clear<br />system.
                  </h2>
                  <p className="mt-4 text-[13px] leading-6 text-white/38">
                    Every artist gets the same honest framework.
                  </p>
                </motion.div>
              </div>

              {/* Right: list */}
              <div className="flex-1 min-w-0">
                {releaseModes.map((mode, i) => (
                  <RevealCard
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

        {/* Bottom scroll indicator */}
        <motion.div
          className="absolute bottom-8 inset-x-0 z-20 flex justify-center"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]),
          }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={18} weight="light" className="text-white/20" />
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
