'use client'

import { useScroll } from 'framer-motion'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { VinylRecord, Sparkle, WaveSine } from '@phosphor-icons/react/dist/ssr'
import { ReleasePathBead, ReleasePathCard, ReleasePathWord, type PathGeometry } from '@/components/animations/ReleasePathMotion'

const MODES = [
  {
    tag: 'Release',
    title: 'Direct release management.',
    body: 'We distribute your track for 10% of royalties, keep the workflow simple, and show every number in one place.',
    Icon: VinylRecord,
    wide: true,
  },
  {
    tag: 'Promotion',
    title: 'Release support with momentum.',
    body: 'We pair the release with social campaigns and playlist outreach when your track needs extra reach.',
    Icon: Sparkle,
    wide: false,
  },
  {
    tag: 'Re-release',
    title: 'A second life for the right record.',
    body: 'If a track is already out but still has room to grow, we reframe it as a stronger release and push it again.',
    Icon: WaveSine,
    wide: false,
  },
]

function moveCardLight(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const bounds = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`)
  event.currentTarget.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`)
}

export function ReleasePathsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const sourceRef = useRef<HTMLSpanElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [animated, setAnimated] = useState(false)
  const [geometry, setGeometry] = useState<PathGeometry | null>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)')
    const update = () => setAnimated(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!animated) return
    const shell = shellRef.current
    const source = sourceRef.current
    if (!shell || !source) return
    let pending = 0
    let disposed = false
    const measure = () => {
      const bounds = shell.getBoundingClientRect()
      const origin = source.getBoundingClientRect()
      const word = source.firstElementChild as HTMLElement | null
      if (!word) return
      setGeometry({
        sourceX: origin.left - bounds.left,
        sourceY: origin.top - bounds.top + origin.height / 2,
        wordWidth: word.offsetWidth,
        rightEdge: bounds.width - parseFloat(getComputedStyle(shell).paddingRight),
        cards: cardRefs.current.flatMap((card) => {
          if (!card) return []
          const rect = card.getBoundingClientRect()
          return [{ x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2, width: rect.width, height: rect.height }]
        }),
      })
    }
    const schedule = () => {
      window.cancelAnimationFrame(pending)
      pending = window.requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(shell)
    observer.observe(source)
    cardRefs.current.forEach((card) => { if (card) observer.observe(card) })
    schedule()
    // Recompute launch and landing positions after the heading font loads.
    document.fonts.ready.then(() => { if (!disposed) schedule() })
    return () => {
      disposed = true
      window.cancelAnimationFrame(pending)
      observer.disconnect()
    }
  }, [animated])

  return (
    <section id="releases" ref={sectionRef} aria-label="Ways to release with us" className={`band paths-section ${animated ? 'paths-animated' : 'sec'}`}>
      <div className="paths-stage">
        <div className="shell paths-shell" ref={shellRef}>
        <div className="paths-head">
          <p className="kicker"><i aria-hidden="true" />Three ways in</p>
          <h2 className="h2">Pick the{' '}<span ref={sourceRef} className="release-path-source"><ReleasePathWord progress={scrollYProgress} animated={animated} /></span><br />your record needs.</h2>
        </div>

        <div className="paths-grid">
          {MODES.map((m, i) => (
            <div
              className="path-card-slot"
              key={m.tag}
              ref={(element) => { cardRefs.current[i] = element }}
              onPointerMove={moveCardLight}
            >
              <ReleasePathCard index={i} progress={scrollYProgress} animated={animated} wide={m.wide}>
                <m.Icon size={22} weight="light" className="ic" aria-hidden="true" />
                <span className="tag">{m.tag}</span>
                <h3 className="h3 t">{m.title}</h3>
                <p className="b">{m.body}</p>
              </ReleasePathCard>
            </div>
          ))}
        </div>
        {animated && MODES.map((mode, index) => (
          <ReleasePathBead key={mode.tag} index={index} geometry={geometry} progress={scrollYProgress} />
        ))}
      </div>
      </div>

      <style jsx>{`
        .paths-section { scroll-margin-top: 0; }
        .paths-head { max-width: min(100%, 820px); margin-bottom: clamp(40px, 5vw, 68px); }
        .paths-head .kicker { margin-bottom: 20px; }
        .release-path-source { display: inline-block; }
        :global(.release-path-word) { display: inline-block; }
        .paths-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: clamp(14px, 1.6vw, 22px);
          align-items: stretch;
        }
        .path-card-slot { position: relative; }
        :global(.release-path-card) { position: relative; height: 100%; overflow: hidden; isolation: isolate; }
        :global(.release-path-content) { position: relative; z-index: 1; display: flex; flex-direction: column; }
        :global(.release-path-bead) {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 2;
          pointer-events: none;
          border: 1px solid;
          background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.015));
          will-change: transform, width, height;
        }
        .paths-animated { height: 320svh; }
        .paths-animated .paths-stage { position: sticky; top: 0; height: 100svh; }
        .paths-animated .paths-shell {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: 96px;
          padding-bottom: 40px;
        }
        .paths-animated .paths-head { max-width: 100%; margin-bottom: clamp(36px, 5vh, 56px); }
        .paths-animated .h2 { font-size: clamp(44px, 4.6vw, 64px); }
        .paths-animated .release-path-source { width: 4.1em; }
        .paths-animated :global(.release-path-card) { transition: border-color 0.3s ease, background 0.3s ease; }
        @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
          :global(.release-path-card::before) {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: radial-gradient(190px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(75, 111, 255, 0.17), transparent 75%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          :global(.release-path-card:hover::before) { opacity: 1; }
          :global(.release-path-card:hover) { border-color: rgba(108, 141, 255, 0.32); }
        }
        :global(.release-path-card-wide) { padding: clamp(26px, 3.4vw, 44px); }
        :global(.release-path-card .ic) { color: var(--blue-soft); }
        .tag {
          margin-top: 22px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ink-3);
        }
        .t { margin-top: 12px; color: var(--ink); }
        .b {
          margin-top: 14px;
          font-size: 14px;
          line-height: 1.65;
          color: var(--ink-2);
        }
        :global(.release-path-card-wide) .t { font-size: clamp(24px, 2.9vw, 34px); }
        @media (max-width: 1023px) {
          .paths-section { scroll-margin-top: 88px; }
          .paths-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
