'use client'

import { useEffect, useState } from 'react'
import { audienceIntroSeen } from '@/lib/audienceNavigation'
import { useAudienceExperience } from '@/components/layout/AudienceExperience'
import { INTRO_REVEAL_EVENT } from './IntroNavigation'
import { catalogReturnRequested } from '@/lib/catalogReturn'

/**
 * Wraps the main site so it fades/scales into view smoothly right as the
 * intro curtain starts revealing it, instead of appearing as a static,
 * already-rendered block the instant the white mask slides away.
 */
export function SiteReveal({ children, skipOnHash = false }: { children: React.ReactNode; skipOnHash?: boolean }) {
  const skipIntro = Boolean(useAudienceExperience()?.skipIntro)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (skipIntro || audienceIntroSeen() || catalogReturnRequested() || (skipOnHash && window.location.hash)) setRevealed(true)
    function handleReveal() {
      setRevealed(true)
    }

    window.addEventListener(INTRO_REVEAL_EVENT, handleReveal)
    return () => window.removeEventListener(INTRO_REVEAL_EVENT, handleReveal)
  }, [skipOnHash, skipIntro])

  return (
    <div className={revealed || skipIntro ? 'site-reveal site-reveal--visible' : 'site-reveal'}>
      {children}
    </div>
  )
}
