'use client'

import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer
      id="connect"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '120px 0 80px' }}
    >
      <div className="section-shell">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '680px' }}>

          {/* Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.6rem)',
                fontWeight: 200,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                color: '#f0f0f0',
              }}
            >
              If the record fits,
              <br />
              <span style={{ color: 'rgba(240,240,240,0.42)' }}>we will tell you.</span>
            </h2>

            <p
              style={{
                marginTop: '20px',
                fontSize: '14px',
                lineHeight: 1.75,
                color: 'rgba(240,240,240,0.38)',
                maxWidth: '44ch',
              }}
            >
              If it does not, we will say that too.
              Send your track and we respond within 48 hours.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            style={{ marginTop: '44px', display: 'flex', alignItems: 'center', gap: '16px' }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          >
            <a
              href="mailto:hello@nothingrecords.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 28px',
                borderRadius: '8px',
                background: '#f0f0f0',
                color: '#0a0a0a',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'background 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f0f0f0'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Submit a track
            </a>

            <a
              href="mailto:hello@nothingrecords.com"
              style={{
                fontSize: '13px',
                color: 'rgba(240,240,240,0.35)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(240,240,240,0.65)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240,240,240,0.35)')}
            >
              hello@nothingrecords.com
            </a>
          </motion.div>

          {/* Bottom meta */}
          <div
            style={{
              marginTop: '80px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '11px', color: 'rgba(240,240,240,0.22)', letterSpacing: '0.06em' }}>
              © {new Date().getFullYear()} Nothing Records
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(240,240,240,0.16)', letterSpacing: '0.04em' }}>
              Independent Electronic Music Label
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
