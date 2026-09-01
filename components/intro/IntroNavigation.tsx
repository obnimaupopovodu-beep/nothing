'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type IntroState = 'boot' | 'opening' | 'menu' | 'navigating' | 'revealing' | 'closed'

const ROUTES: { label: string; target: string | null }[] = [
  { label: 'Playlists', target: '#playlists' },
  { label: 'Socials', target: '#social' },
  { label: 'About', target: '#about' },
  { label: 'Submit a song', target: '#demo' },
]

const BOOT_DELAY_MS = 1000
const WHEEL_THRESHOLD = 60
const SWIPE_THRESHOLD = 50
const CURTAIN_EASE = [0.65, 0, 0.35, 1] as const
const MENU_ITEM_EASE = [0.16, 1, 0.3, 1] as const
export const INTRO_REVEAL_EVENT = 'nothing-intro:reveal'

function moveToTarget(target: string | null) {
  if (!target) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    return
  }

  document.querySelector(target)?.scrollIntoView({ behavior: 'auto', block: 'start' })
}

export function IntroNavigation() {
  const [state, setState] = useState<IntroState>('boot')
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const reducedMotion = useReducedMotion()

  const wheelProgress = useRef(0)
  const touchStartY = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    // Intro plays on every load/reload by design — no session gate.
    if (reducedMotion) {
      setState('menu')
      window.dispatchEvent(new CustomEvent(INTRO_REVEAL_EVENT))
      return
    }

    const timer = window.setTimeout(() => setState('opening'), BOOT_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [reducedMotion])

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setState('closed')
  }, [])

  const selectRoute = useCallback(
    (target: string | null) => {
      setState((current) => {
        if (current !== 'menu') return current

        setSelectedTarget(target)
        moveToTarget(target)

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent(INTRO_REVEAL_EVENT))

            if (reducedMotion) {
              finishIntro()
            } else {
              setState('revealing')
            }
          })
        })

        return 'navigating'
      })
    },
    [reducedMotion, finishIntro]
  )

  useEffect(() => {
    if (state === 'closed') return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [state])

  useEffect(() => {
    if (state !== 'menu') return

    wheelProgress.current = 0

    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      if (event.deltaY <= 0) return

      wheelProgress.current += event.deltaY
      if (wheelProgress.current >= WHEEL_THRESHOLD) {
        selectRoute(null)
      }
    }

    function handleTouchStart(event: TouchEvent) {
      touchStartY.current = event.touches[0]?.clientY ?? 0
    }

    function handleTouchEnd(event: TouchEvent) {
      const endY = event.changedTouches[0]?.clientY ?? touchStartY.current
      const verticalDistance = touchStartY.current - endY

      if (verticalDistance >= SWIPE_THRESHOLD) {
        selectRoute(null)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [state, selectRoute])

  if (state === 'closed') return null

  const menuVisible = state === 'opening' || state === 'menu' || state === 'navigating'
  const isInteractive = state === 'menu'
  // The black backdrop must only exist while the white curtain hasn't
  // fully covered the screen yet. Once it has (menu/navigating/revealing),
  // it needs to disappear so the curtain acts as a real mask over the
  // actual page underneath instead of a solid black layer.
  const showBootBackdrop = state === 'boot' || state === 'opening'

  return (
    <div
      className="intro-root"
      role="dialog"
      aria-modal="true"
      aria-label="Choose where to explore Nothing Records"
    >
      {showBootBackdrop && <div className="intro-boot" aria-hidden="true" />}

      <motion.div
        className="intro-curtain"
        initial={reducedMotion ? { height: '100%', y: '0%' } : { height: '0%', y: '0%' }}
        animate={{
          height: state === 'boot' ? '0%' : '100%',
          y: state === 'revealing' ? '-100%' : '0%',
        }}
        transition={{
          height: { duration: reducedMotion ? 0 : 1.2, ease: CURTAIN_EASE },
          y: { duration: reducedMotion ? 0 : 1.05, ease: CURTAIN_EASE },
        }}
        onAnimationComplete={() => {
          if (state === 'opening') setState('menu')
          if (state === 'revealing') finishIntro()
        }}
      >
        <div className="intro-menu">
          <div className="intro-menu-list">
            {ROUTES.map((route, index) => {
              const dimmed = state === 'navigating' && selectedTarget !== route.target

              return (
                <motion.button
                  key={route.label}
                  type="button"
                  className="intro-menu-item"
                  data-dimmed={dimmed ? 'true' : 'false'}
                  disabled={!isInteractive}
                  onClick={() => selectRoute(route.target)}
                  initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                  animate={menuVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                  transition={{
                    duration: 0.65,
                    delay: reducedMotion ? 0 : 0.3 + index * 0.1,
                    ease: MENU_ITEM_EASE,
                  }}
                >
                  {route.label}
                  <span className="intro-menu-item-line" aria-hidden="true" />
                </motion.button>
              )
            })}
          </div>

          <motion.button
            type="button"
            className="intro-scroll-hint"
            disabled={!isInteractive}
            onClick={() => selectRoute(null)}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={menuVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.7 }}
          >
            <span className="intro-scroll-hint-label">Scroll to explore</span>
            <motion.span
              className="intro-scroll-hint-arrow"
              animate={reducedMotion ? { y: 0 } : { y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              &#8595;
            </motion.span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
