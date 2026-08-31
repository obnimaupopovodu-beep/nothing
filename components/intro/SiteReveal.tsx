'use client'

import { useEffect, useState } from 'react'
import { INTRO_REVEAL_EVENT } from './IntroNavigation'

/**
 * Wraps the main site so it fades/scales into view smoothly right as the
 * intro curtain starts revealing it, instead of appearing as a static,
 * already-rendered block the instant the white mask slides away.
 */
export function SiteReveal({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    function handleReveal() {
      setRevealed(true)
    }

    window.addEventListener(INTRO_REVEAL_EVENT, handleReveal)
    return () => window.removeEventListener(INTRO_REVEAL_EVENT, handleReveal)
  }, [])

  return (
    <div className={revealed ? 'site-reveal site-reveal--visible' : 'site-reveal'}>
      {children}
    </div>
  )
}
