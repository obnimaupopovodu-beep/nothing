'use client'

const ARTISTS = [
  'AURA', 'VOIDWALKER', 'NOCTURNE', 'SPECTER', 'DUSK', 'HEXFORM',
  'BLACKSITE', 'SOLARIS', 'ECHO DEPTH', 'MANTIS', 'PHANTASM', 'CIPHER',
]

export function MarqueeBand() {
  const doubled = [...ARTISTS, ...ARTISTS]

  return (
    <section
      aria-label="Artist roster"
      style={{
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(1.2rem, 3vw, 1.8rem) 0',
        position: 'relative', zIndex: 1,
        background: '#000000',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)',
        maskImage:       'linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)',
      }}
    >
      <div className="marquee-track">
        {doubled.map((name, i) => (
          <span key={`${name}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <span
              style={{ fontSize: 'clamp(10px, 2vw, 13px)', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(250,250,250,0.28)', padding: '0 clamp(1.2rem, 3vw, 2rem)', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.72)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.28)' }}
            >
              {name}
            </span>
            <span aria-hidden="true" style={{ color: 'rgba(250,250,250,0.12)', fontSize: '8px', userSelect: 'none' }}>✶</span>
          </span>
        ))}
      </div>
    </section>
  )
}
