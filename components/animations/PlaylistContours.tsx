'use client'

import { useEffect, type RefObject } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

const CONTOURS = [
  'M -110 -120 C -85 215 75 445 385 520 C 680 592 1050 515 1580 390',
  'M -135 -100 C -105 265 65 485 365 558 C 665 632 1040 555 1580 430',
  'M -175 280 C 30 415 158 640 292 835 C 500 1135 750 1265 1005 1800',
  'M -205 345 C 5 485 128 705 270 905 C 470 1190 680 1370 900 1830',
  'M -260 1090 C 70 1065 365 1260 535 1740',
]

export function PlaylistContours({ target }: { target: RefObject<HTMLElement | null> }) {
  const reduceMotion = useReducedMotion()
  const leadTarget = useMotionValue(-100)
  const trailTarget = useMotionValue(200)
  const leadY = useSpring(leadTarget, { stiffness: 170, damping: 34, mass: 0.45 })
  const trailY = useSpring(trailTarget, { stiffness: 170, damping: 34, mass: 0.45 })

  useEffect(() => {
    let frame = 0
    const update = () => {
      if (!target.current) return
      const viewportHeight = window.innerHeight
      const backgroundHeight = window.matchMedia('(max-width: 700px)').matches ? 1100 : 1700
      // Only the section's start edge is used, so card expansion cannot move
      // the light. As the section scrolls up, the masks sweep up on screen.
      const progress = Math.max(0, Math.min(1,
        (viewportHeight - target.current.getBoundingClientRect().top) / (viewportHeight + backgroundHeight)
      ))
      const y = -100 + progress * (backgroundHeight - 300)
      leadTarget.set(y)
      trailTarget.set(y + 300)
    }
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [target, leadTarget, trailTarget])

  return (
    <div className="playlist-contours" aria-hidden="true">
      <svg viewBox="0 0 1440 1700" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id="playlist-metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06070b" />
            <stop offset="24%" stopColor="#252a34" />
            <stop offset="43%" stopColor="#11151e" />
            <stop offset="72%" stopColor="#080a10" />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>
          <linearGradient id="playlist-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9da5b5" stopOpacity="0.38" />
            <stop offset="30%" stopColor="#e8edfb" stopOpacity="0.56" />
            <stop offset="65%" stopColor="#8d9ab3" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#8996b0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="playlist-sweep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="25%" stopColor="white" stopOpacity="0.55" />
            <stop offset="50%" stopColor="white" stopOpacity="1" />
            <stop offset="75%" stopColor="white" stopOpacity="0.55" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter id="playlist-line-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <mask id="playlist-lead-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="1700">
            <motion.rect
              x="0"
              y={reduceMotion ? 620 : leadY}
              width="1440"
              height="360"
              fill="url(#playlist-sweep)"
            />
          </mask>
          <mask id="playlist-trail-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="1700">
            <motion.rect
              x="0"
              y={reduceMotion ? 1800 : trailY}
              width="1440"
              height="300"
              fill="url(#playlist-sweep)"
            />
          </mask>
        </defs>

        <path
          d="M -110 -120 C -85 215 75 445 385 520 C 680 592 1050 515 1580 390 L 1580 430 C 1040 555 665 632 365 558 C 65 485 -105 265 -135 -100 Z"
          fill="url(#playlist-metal)"
          opacity="0.48"
        />
        <path
          d="M -175 280 C 30 415 158 640 292 835 C 500 1135 750 1265 1005 1800 L 900 1830 C 680 1370 470 1190 270 905 C 128 705 5 485 -205 345 Z"
          fill="url(#playlist-metal)"
          opacity="0.32"
        />

        <g fill="none" stroke="url(#playlist-edge)" strokeWidth="1.25" vectorEffect="non-scaling-stroke">
          {CONTOURS.map((path) => <path key={path} d={path} />)}
        </g>

        <g mask="url(#playlist-trail-mask)" fill="none" vectorEffect="non-scaling-stroke">
          <g stroke="#365ee0" strokeWidth="20" opacity="0.72" filter="url(#playlist-line-glow)">
            {CONTOURS.map((path) => <path key={path} d={path} />)}
          </g>
          <g stroke="#304ba7" strokeWidth="1.5" opacity="0.7">
            {CONTOURS.map((path) => <path key={path} d={path} />)}
          </g>
        </g>
        <g mask="url(#playlist-lead-mask)" fill="none" vectorEffect="non-scaling-stroke">
          <g stroke="#141f4b" strokeWidth="19" opacity="0.95" filter="url(#playlist-line-glow)">
            {CONTOURS.map((path) => <path key={path} d={path} />)}
          </g>
          <g stroke="#859bda" strokeWidth="2.2" opacity="0.98">
            {CONTOURS.map((path) => <path key={path} d={path} />)}
          </g>
        </g>
      </svg>

      <style jsx>{`
        .playlist-contours {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1700px;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          opacity: 0.9;
        }
        svg { display: block; width: 100%; height: 100%; }
        @media (max-width: 700px) {
          .playlist-contours { height: 1100px; opacity: 0.54; }
        }
      `}</style>
    </div>
  )
}
