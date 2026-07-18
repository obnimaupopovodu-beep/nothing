'use client'

import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer id="connect" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(60px, 12vw, 120px) 0 clamp(40px, 8vw, 80px)', position: 'relative', zIndex: 1, background: '#000000' }}>
      <div className="section-shell">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '680px' }}>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 6vw, 3.6rem)', fontWeight: 200, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#FAFAFA' }}>
              If the record fits,
              <br />
              <span style={{ color: 'rgba(250,250,250,0.38)' }}>we will tell you.</span>
            </h2>
            <p style={{ marginTop: '16px', fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: 1.75, color: 'rgba(250,250,250,0.36)', maxWidth: '44ch' }}>
              If it does not, we will say that too. Send your track and we respond within 48 hours.
            </p>
          </motion.div>

          <motion.div style={{ marginTop: 'clamp(28px, 6vw, 44px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}>
            {/* Primary — white fill pill */}
            <a href="mailto:hello@nothingrecords.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '9999px', background: '#FAFAFA', color: '#09090B', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease', minHeight: '48px' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.10)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              Submit a track
            </a>
            {/* Ghost secondary — transparent, white border pill */}
            <a href="mailto:hello@nothingrecords.com"
              style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 28px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', color: 'rgba(250,250,250,0.60)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textDecoration: 'none', transition: 'border-color 0.18s ease, color 0.18s ease', minHeight: '48px' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.40)'; e.currentTarget.style.color = 'rgba(250,250,250,0.88)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'rgba(250,250,250,0.60)' }}
            >
              hello@nothingrecords.com
            </a>
          </motion.div>

          <div style={{ marginTop: 'clamp(40px, 8vw, 80px)', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(250,250,250,0.20)', letterSpacing: '0.06em' }}>© {new Date().getFullYear()} Nothing Records</span>
            <span style={{ fontSize: '11px', color: 'rgba(250,250,250,0.14)', letterSpacing: '0.04em' }}>Independent Electronic Music Label</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
