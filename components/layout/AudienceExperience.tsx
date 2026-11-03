'use client'

import Link from 'next/link'
import { rememberAudienceIntro, audienceIntroSeen } from '@/lib/audienceNavigation'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useSmoothScroll } from '@/components/layout/SmoothScroll'

// Keep URLs independently shareable while presenting them as one continuous site.
type AudiencePath = '/' | '/for-artists'
type AudienceContextValue = { skipIntro: boolean; selected: string; busy: boolean; navigate: (path: AudiencePath) => void }
const AudienceContext = createContext<AudienceContextValue | null>(null)
export const useAudienceExperience = () => useContext(AudienceContext)

export function AudienceExperience({ children }: { children: ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const reduced = useReducedMotion()
  const scroll = useSmoothScroll()
  const seen = useRef(new Set<string>())
  const pending = useRef<AudiencePath | null>(null)
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previous = useRef(path)
  const [selected, setSelected] = useState<string | null>(null)
  const [, restoreSession] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle')

  useEffect(() => {
    if (audienceIntroSeen()) { seen.current.add(path); restoreSession(value => value + 1) }
    function remember() { if (path === '/' || path === '/for-artists') { seen.current.add(path); rememberAudienceIntro(path) } }
    window.addEventListener('nothing-intro:reveal', remember)
    return () => window.removeEventListener('nothing-intro:reveal', remember)
  }, [path])

  useEffect(() => {
    if (previous.current === path) return
    previous.current = path
    if (exitTimer.current) clearTimeout(exitTimer.current)
    if (enterTimer.current) clearTimeout(enterTimer.current)
    const fromSwitch = pending.current === path
    pending.current = null
    setSelected(null)
    setPhase('enter')
    scroll?.current?.scrollTo(0, { immediate: true, force: true })
    scroll?.current?.start()
    enterTimer.current = setTimeout(() => {
      setPhase('idle')
      if (fromSwitch) {
        const title = document.querySelector<HTMLElement>('main h1')
        if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }) }
      }
    }, reduced ? 0 : 620)
  }, [path, reduced, scroll])

  useEffect(() => () => {
    if (exitTimer.current) clearTimeout(exitTimer.current)
    if (enterTimer.current) clearTimeout(enterTimer.current)
  }, [])

  function navigate(destination: AudiencePath) {
    if (destination === path || pending.current) return
    if (enterTimer.current) clearTimeout(enterTimer.current)
    seen.current.add(path); seen.current.add(destination)
    rememberAudienceIntro(path); rememberAudienceIntro(destination)
    pending.current = destination
    setSelected(destination); setPhase('exit')
    scroll?.current?.stop()
    // Prefetch is also supplied by the links. The destination stays hidden until ready.
    router.prefetch(destination)
    exitTimer.current = setTimeout(() => router.push(destination, { scroll: true }), reduced ? 0 : 260)
  }

  return <AudienceContext.Provider value={{ skipIntro: seen.current.has(path), selected: selected || path, busy: phase === 'exit', navigate }}>
    <div className="audience-stage" data-phase={phase} aria-busy={phase === 'exit' || undefined}>{children}</div>
  </AudienceContext.Provider>
}

export function AudienceSwitch({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname()
  const experience = useAudienceExperience()
  const selected = experience?.selected || path
  function switchTo(event: MouseEvent<HTMLAnchorElement>, destination: AudiencePath) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !experience) return
    event.preventDefault()
    if (experience.busy || destination === path) return
    onNavigate?.()
    experience.navigate(destination)
  }
  return <nav className="audience-switch" aria-label="Choose site experience" data-artists={selected === '/for-artists'}>
    <span className="audience-switch__indicator" aria-hidden="true" />
    <Link href="/" aria-current={path === '/' ? 'page' : undefined} aria-disabled={experience?.busy || undefined}
      onClick={event => switchTo(event, '/')}>Listen</Link>
    <Link href="/for-artists" aria-current={path === '/for-artists' ? 'page' : undefined} aria-disabled={experience?.busy || undefined}
      onClick={event => switchTo(event, '/for-artists')}>For artists</Link>
  </nav>
}
