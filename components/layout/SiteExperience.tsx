'use client'
import { useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { AudienceExperience } from './AudienceExperience'
import { SmoothScroll } from './SmoothScroll'
import { ElasticCursor } from './ElasticCursor'
import { StarField } from '@/components/animations/StarField'
export function SiteExperience({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const reduced = useReducedMotion()
  if (path !== '/' && path !== '/for-artists' && path !== '/playlists') return <>{children}</>
  const content = <AudienceExperience>{children}</AudienceExperience>
  return (
    <>
      <div className="aura aura-a" aria-hidden="true" />
      <div className="aura aura-b" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
      <StarField />
      {reduced ? content : <SmoothScroll>{content}</SmoothScroll>}
      <ElasticCursor />
    </>
  )
}
