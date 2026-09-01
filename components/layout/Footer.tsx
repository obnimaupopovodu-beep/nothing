'use client'

const LINKS = [
  { label: 'How we work',  href: '#releases'  },
  { label: 'Platforms', href: '#platforms' },
  { label: 'Playlists', href: '#playlists' },
  { label: 'Socials',   href: '#social'    },
  { label: 'FAQ',       href: '#faq'       },
]

export function Footer() {
  return (
    <footer id="connect" className="band foot" aria-label="Footer">
      <div className="shell">
        <div className="top">
          <div>
            <span className="brand">Nothing<span className="dot">.</span></span>
            <p className="tag">Independent electronic music label.</p>
          </div>

          <nav className="links" aria-label="Footer">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href}>{l.label}</a>
            ))}
          </nav>

          <a className="mail" href="mailto:demo@nothingrecords.com">demo@nothingrecords.com</a>
        </div>

        <div className="bottom">
          <span>© {new Date().getFullYear()} Nothing Records</span>
          <span>Worldwide</span>
        </div>
      </div>

      <style jsx>{`
        .foot {
          border-top: 1px solid var(--line-soft);
          padding: clamp(52px, 8vw, 88px) 0 clamp(28px, 4vw, 44px);
        }
        .top {
          display: grid;
          grid-template-columns: 1.2fr 1fr auto;
          gap: clamp(26px, 4vw, 60px);
          align-items: start;
        }
        .brand {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--ink);
        }
        .dot { color: var(--blue-soft); }
        .tag { margin-top: 10px; font-size: 13px; color: var(--ink-3); }
        .links { display: grid; gap: 10px; }
        .links a {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink-2);
          text-decoration: none;
          transition: color 0.25s ease;
          width: fit-content;
        }
        .links a:hover { color: var(--ink); }
        .mail {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--ink);
          text-decoration: none;
          border-bottom: 1px solid var(--line);
          padding-bottom: 3px;
          transition: border-color 0.25s ease;
        }
        .mail:hover { border-bottom-color: var(--blue-soft); }
        .bottom {
          margin-top: clamp(40px, 6vw, 72px);
          padding-top: 22px;
          border-top: 1px solid var(--line-soft);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px;
          font-size: 11.5px;
          letter-spacing: 0.04em;
          color: var(--ink-3);
        }
        @media (max-width: 760px) {
          .top { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  )
}
