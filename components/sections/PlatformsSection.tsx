'use client'

import { EverywhereReveal } from '@/components/animations/EverywhereReveal'

export function PlatformsSection() {
  return (
    <section
      id="platforms"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      aria-label="Streaming platforms"
    >
      <EverywhereReveal />
    </section>
  )
}
