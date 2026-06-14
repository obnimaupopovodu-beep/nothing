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
      className="group relative flex flex-col items-center rounded-[22px] px-5 py-6 text-center"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.12), 0 16px 48px rgba(0,0,0,0.28)',
        textDecoration: 'none',
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 + index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
          boxShadow: `0 8px 24px ${accent.replace('0.55', '0.14').replace('0.5', '0.12').replace('0.35', '0.1')}`,
        }}
      >
        <Icon size={22} weight="regular" className="text-white" />
      </span>
      <span className="text-[13px] font-medium tracking-[-0.01em] text-white">{label}</span>
      <p className="mt-2 text-[12px] leading-[1.6] text-white/45">{description}</p>
      <ArrowRight
        size={14}
        weight="regular"
        className="mt-4 text-white/25 transition-all duration-300 group-hover:translate-y-0.5 group-hover:text-white/55"
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
  const y = useTransform(progress, [start, start + 0.14], [48, 0])
  const scale = useTransform(progress, [start, start + 0.14], [0.96, 1])

  return (
    <motion.article
      style={{ opacity, y, scale }}
      className="glass rounded-[24px] border border-white/8 p-7 md:p-8"
    >
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
          style={{ boxShadow: `0 0 0 1px ${accent}22` }}
        >
          <Icon size={22} weight="regular" className="text-white" />
        </div>
        <div>
          <p className="label-caps">{eyebrow}</p>
          <h3 className="mt-4 text-[1.25rem] font-light tracking-[-0.03em] text-white md:text-[1.5rem]">
            {title}
          </h3>
          <p className="mx-auto mt-4 max-w-[42ch] text-[15px] leading-7 text-white/55">{body}</p>
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
  const start = 0.78 + index * 0.04
  const opacity = useTransform(progress, [start, start + 0.08], [0, 1])
  const y = useTransform(progress, [start, start + 0.08], [28, 0])

  return (
    <motion.div style={{ opacity, y }} className="flex flex-col items-center px-4 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <Icon size={20} weight="regular" className="text-white/80" />
      </div>
      <h3 className="text-[14px] font-medium text-white">{title}</h3>
      <p className="mt-3 max-w-[24ch] text-[13px] leading-6 text-white/48">{body}</p>
    </motion.div>
  )
}

function AdvantagesBlock({ progress }: { progress: MotionValue<number> }) {
  const headerOpacity = useTransform(progress, [0.7, 0.8], [0, 1])
  const headerY = useTransform(progress, [0.7, 0.8], [32, 0])

  return (
    <motion.div style={{ opacity: headerOpacity, y: headerY }} className="mt-28 md:mt-36">
      <p className="label-caps">Why work with us</p>
      <div className="content-column-wide mt-14 grid grid-cols-1 gap-14 sm:grid-cols-3 sm:gap-8 md:mt-16 md:gap-10">
        {advantages.map((item, index) => (
          <AdvantageItem key={item.title} progress={progress} index={index} {...item} />
        ))}
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
        <div className="mx-auto flex min-h-[calc(100dvh-120px)] max-w-[25rem] flex-col items-center justify-center text-center">
          <p className="label-caps">Independent electronic music label</p>

          <h1 className="mt-6 select-none text-[3.7rem] font-extralight leading-[0.9] text-white">
            NOTHING
            <br />
            <span className="text-white/38">RECORDS</span>
          </h1>

          <p className="mt-7 max-w-[20rem] text-[15px] font-light leading-7 text-white/52">
            Premium distribution, optional promotion, and direct answers for electronic artists.
          </p>

          <div className="mt-9 grid w-full grid-cols-1 gap-3">
            {actions.map(({ label, description, Icon, accent }, index) => (
              <motion.a
                key={label}
                href="#mobile-model"
                className="group flex items-center gap-4 rounded-[18px] border border-white/10 bg-white/[0.045] px-4 py-4 text-left"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 14px 34px rgba(0,0,0,0.24)',
                  textDecoration: 'none',
                }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]"
                  style={{ boxShadow: `0 8px 22px ${accent.replace('0.55', '0.12').replace('0.5', '0.1').replace('0.35', '0.08')}` }}
                >
                  <Icon size={20} weight="regular" className="text-white" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-white">{label}</span>
                  <span className="mt-1 block text-[12px] leading-5 text-white/48">{description}</span>
                </span>
                <ArrowRight size={15} weight="regular" className="shrink-0 text-white/30" />
              </motion.a>
            ))}
          </div>

          <a
            href="#mobile-model"
            className="mt-8 flex flex-col items-center gap-2 p-2 text-white/42"
            aria-label="Scroll to explore"
          >
            <span className="label-caps !text-white/34">Explore</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <ArrowDown size={14} weight="regular" />
            </span>
          </a>
        </div>
      </div>

      <div id="mobile-model" className="relative px-5 pb-24 pt-12">
        <div className="mx-auto max-w-[25rem] text-center">
          <p className="label-caps">Explore the model</p>
          <h2 className="mt-5 text-[2.55rem] font-extralight leading-[1.04] text-white">
            Three release paths.
            <br />
            One clear system.
          </h2>
          <p className="mx-auto mt-6 max-w-[20rem] text-[15px] font-light leading-7 text-white/52">
            We keep distribution, promo support, and relaunch strategy separate, so every artist understands the path.
          </p>

          <div className="mt-10 grid gap-4">
            {releaseModes.map(({ eyebrow, title, body, accent, Icon }) => (
              <article key={eyebrow} className="glass rounded-[20px] p-5 text-center">
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
                  style={{ boxShadow: `0 0 0 1px ${accent}22` }}
                >
                  <Icon size={20} weight="regular" className="text-white" />
                </div>
                <p className="label-caps mt-5">{eyebrow}</p>
                <h3 className="mt-3 text-[1.18rem] font-light leading-7 text-white">{title}</h3>
                <p className="mx-auto mt-3 max-w-[21rem] text-[13px] leading-6 text-white/54">{body}</p>
              </article>
            ))}
          </div>

          <div className="mt-20">
            <p className="label-caps">Why work with us</p>
            <div className="mt-9 grid gap-8">
              {advantages.map(({ title, body, Icon }) => (
                <div key={title} className="mx-auto max-w-[18rem] text-center">
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                    <Icon size={20} weight="regular" className="text-white/82" />
                  </div>
                  <h3 className="text-[14px] font-medium text-white">{title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-white/50">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function StorySection() {
  const ref = useRef<HTMLElement>(null)
  const presentationRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.12, 0.28], [1, 1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.28], [0, -56])
  const heroScale = useTransform(scrollYProgress, [0, 0.28], [1, 0.97])
  const heroBlur = useTransform(scrollYProgress, [0.1, 0.28], [0, 8])
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.2], [0.55, 0])

  const exploreOpacity = useTransform(scrollYProgress, [0, 0.08, 0.22], [1, 1, 0])

  const storyOpacity = useTransform(scrollYProgress, [0.18, 0.34], [0, 1])
  const introOpacity = useTransform(scrollYProgress, [0.22, 0.38], [0, 1])
  const heroFilter = useTransform(heroBlur, (v) => `blur(${v}px)`)

  const scrollToPresentation = useCallback(() => {
    const section = ref.current
    if (!section) return
    const target = section.offsetTop + section.offsetHeight * 0.22
    window.scrollTo({ top: target, behavior: 'smooth' })
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const panel = presentationRef.current
    if (!panel) return

    if (progress < 0.3) {
      panel.scrollTop = 0
      return
    }

    const maxScroll = Math.max(0, panel.scrollHeight - panel.clientHeight)
    const scrollProgress = Math.min(1, (progress - 0.3) / 0.58)
    panel.scrollTop = maxScroll * scrollProgress
  })

  return (
    <div id="explore">
    <MobileStory />
    <section
      ref={ref}
      className="relative hidden min-h-[380dvh] md:block"
      aria-label="Nothing Records story"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 22%, rgba(127, 176, 255, 0.08), transparent 32%), linear-gradient(180deg, #07080d 0%, #050505 100%)',
          }}
        />

        <motion.div className="absolute inset-0 z-0" style={{ opacity: sceneOpacity }}>
          <Scene mouseX={0} mouseY={0} />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 65% at 50% 38%, transparent 8%, rgba(5,5,5,0.72) 58%, #050505 100%)',
            }}
          />
        </motion.div>

        {/* Hero */}
        <motion.div
          className="absolute inset-0 z-10 flex flex-col pt-[76px] pb-24"
          style={{
            opacity: heroOpacity,
            y: reducedMotion ? 0 : heroY,
            scale: reducedMotion ? 1 : heroScale,
            filter: reducedMotion ? 'none' : heroFilter,
          }}
        >
          <div className="section-shell flex flex-1 flex-col items-center justify-center text-center">
            <motion.p
              className="label-caps"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Independent electronic music label
            </motion.p>

            <motion.h1
              className="mt-6 select-none font-extralight leading-[0.88] tracking-[-0.05em] text-white"
              style={{ fontSize: 'clamp(3.8rem, 13vw, 9rem)' }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              NOTHING
              <br />
              <span className="text-white/38">RECORDS</span>
            </motion.h1>

            <motion.p
              className="mt-8 max-w-[40ch] text-[15px] font-light leading-8 text-white/46 md:text-[17px]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Premium distribution. Optional promotion. Direct answers.
            </motion.p>

            <div className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {actions.map((action, index) => (
                <ActionCard key={action.label} {...action} index={index} />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.button
          type="button"
          onClick={scrollToPresentation}
          className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 border-0 bg-transparent p-2 text-white/40 transition-colors hover:text-white/75"
          style={{ opacity: exploreOpacity }}
          aria-label="Scroll to explore"
        >
          <span className="label-caps !text-white/32">Explore</span>
          <motion.span
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={14} weight="regular" />
          </motion.span>
        </motion.button>

        {/* Presentation */}
        <motion.div
          ref={presentationRef}
          className="absolute inset-0 z-10 overflow-y-auto overscroll-contain scroll-pt-40"
          style={{ opacity: storyOpacity }}
        >
          <div className="w-full px-5 pb-32 pt-[calc(72px+6.5rem)] md:px-8 md:pb-36 md:pt-[calc(72px+8rem)]">
            <motion.div
              className="section-shell section-center w-full"
              style={{ opacity: introOpacity }}
            >
              <div className="content-column w-full text-center">
                <p className="label-caps">Explore the model</p>
                <h2
                  className="mx-auto mt-5 max-w-[16ch] font-extralight leading-[1.06] tracking-[-0.05em] text-white"
                  style={{ fontSize: 'clamp(2.4rem, 6vw, 4.8rem)' }}
                >
                  Three release paths.
                  <br />
                  One clear system.
                </h2>
                <p
                  className="mx-auto mt-8 w-full max-w-[36rem] px-1 text-center text-[15px] font-light leading-[1.8] text-white/50 md:text-[16px] md:leading-8"
                  style={{ textWrap: 'pretty' }}
                >
                  Distribution only. Distribution with promo.
                  <br className="hidden sm:inline" />
                  {' '}
                  A stronger relaunch for an existing track.
                  <br />
                  We keep each path separate and explain it plainly.
                </p>

                <div className="mt-14 flex flex-col gap-6 md:mt-16 md:gap-7">
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

                <AdvantagesBlock progress={scrollYProgress} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
    </div>
  )
}
