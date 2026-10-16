import type { Metadata } from 'next'
import { PlaylistsSection } from '@/components/sections/PlaylistsSection'
import { PLAYLISTS_URL, SITE_URL } from '@/lib/site'
import './playlists.css'

const title = 'Playlists | uwbelieve'
const description = 'Handpicked Spotify playlists from uwbelieve. Discover electronic music, new releases and collections for every mood.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${PLAYLISTS_URL}/` },
  openGraph: {
    type: 'website',
    siteName: 'uwbelieve',
    title,
    description,
    url: `${PLAYLISTS_URL}/`,
  },
  twitter: { card: 'summary', title, description },
}

export default function PlaylistsPage() {
  return (
    <div className="playlists-site">
      <header className="playlists-header shell">
        <a href={SITE_URL} className="playlists-brand" aria-label="uwbelieve — main website">
          uwbelieve<span>.</span>
        </a>
        <a href={SITE_URL} className="playlists-back">Main website ↗</a>
      </header>
      <main>
        <PlaylistsSection />
      </main>
      <footer className="playlists-footer shell">
        <span>Curated by uwbelieve</span>
        <a href="mailto:info@uwbelieve.com">info@uwbelieve.com</a>
      </footer>
    </div>
  )
}
