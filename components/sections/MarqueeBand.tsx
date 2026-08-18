'use client'

const ARTISTS = [
  'AURA', 'VOIDWALKER', 'NOCTURNE', 'SPECTER', 'DUSK', 'HEXFORM',
  'BLACKSITE', 'SOLARIS', 'ECHO DEPTH', 'MANTIS', 'PHANTASM', 'CIPHER',
]

export function MarqueeBand() {
  const doubled = [...ARTISTS, ...ARTISTS]

  return (
    <section id="roster" aria-label="Artist roster" className="marquee band">
      <div className="marquee-track">
        {doubled.map((name, i) => (
          <span key={`${name}-${i}`} className="cell">
            <span className="name">{name}</span>
            <span aria-hidden="true" className="star">✶</span>
          </span>
        ))}
      </div>

      <style jsx>{`
        .marquee {
          overflow: hidden;
          padding: clamp(26px, 4vw, 40px) 0;
          border-bottom: 1px solid var(--line-soft);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%);
        }
        .cell {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }
        .name {
          padding: 0 clamp(18px, 3vw, 34px);
          font-size: clamp(26px, 4vw, 52px);
          font-weight: 900;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          color: rgba(147, 160, 192, 0.32);
          transition: color 0.3s ease;
        }
        .cell:hover .name { color: var(--ink); }
        .star {
          font-size: 12px;
          color: var(--blue-soft);
          opacity: 0.45;
          user-select: none;
        }
      `}</style>
    </section>
  )
}
