'use client'

import { EverywhereReveal } from '@/components/animations/EverywhereReveal'
import { platforms } from '@/components/data/platforms'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { motion } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'

export function PlatformsSection() {
  return (
    <section
      id="platforms"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      aria-label="Streaming platforms"
    >
      <EverywhereReveal />

      <div className="section-shell" style={{ padding: '96px 0 96px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '80px' }}>

          <motion.div
            style={{ width: '260px', flexShrink: 0 }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="label-caps" style={{ marginBottom: '14px' }}>Distribution</p>
            <h2
              style={{
                fontSize: 'clamp(1.7rem, 2.8vw, 2.4rem)',
                fontWeight: 200,
                letterSpacing: '-0.04em',
                color: '#f0f0f0',
                lineHeight: 1.12,
                marginBottom: '16px',
              }}
            >
              Your audience
              <br />is.
            </h2>
            <p style={{ fontSize: '13px', lineHeight: 1.75, color: 'rgba(240,240,240,0.38)', maxWidth: '26ch' }}>
              We distribute to all major platforms simultaneously — day-and-date worldwide.
            </p>
          </motion.div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {platforms.map((platform, index) => (
              <motion.a
                key={platform.name}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: index * 0.04 + 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 0',
                    borderBottom: index < platforms.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <span style={{ color: 'rgba(240,240,240,0.28)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <PlatformIcon platform={platform} size={16} />
                  </span>

                  <span style={{ flex: 1, fontSize: '14px', fontWeight: 400, color: 'rgba(240,240,240,0.82)', letterSpacing: '-0.01em' }}>
                    {platform.name}
                  </span>

                  <span style={{ fontSize: '12px', color: 'rgba(240,240,240,0.3)', letterSpacing: '0.01em' }}>
                    {platform.desc}
                  </span>

                  <ArrowUpRight
                    size={13}
                    weight="regular"
                    style={{ color: 'rgba(240,240,240,0.2)', flexShrink: 0 }}
                  />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
