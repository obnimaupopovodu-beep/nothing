'use client'

import { EverywhereReveal } from '@/components/animations/EverywhereReveal'

export function PlatformsSection() {
  return (
    <section
      id="platforms"
      style={{ borderTop: '1px solid var(--line-soft)' }}
      aria-label="Streaming platforms"
    >
      <EverywhereReveal />
    </section>
  )
}
