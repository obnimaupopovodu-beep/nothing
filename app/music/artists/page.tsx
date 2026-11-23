import type { Metadata } from 'next'
import Link from 'next/link'
import { publicArtists, artistPath, artistReleases, jsonLd } from '@/lib/musicDiscovery'
import { SITE_URL } from '@/lib/site'
import '../music.css'
export const metadata: Metadata = {
  title: 'Artists & collaborators | uwbelieve', description: 'Explore artists and collaborators in the uwbelieve catalog, including FXRNVN, Hiderest and DJ NXW. Discover their releases and streaming links.',
  alternates: { canonical: `${SITE_URL}/music/artists` }, robots: { index: true, follow: true },
}
export default function ArtistsPage() {
  return <main className="music-page"><header><Link href="/">uwbelieve.</Link><Link href="/#discover">← Back to the label</Link></header>
    <h1>Artists &amp; collaborators.</h1><p className="music-intro">The people behind the records. Explore artist pages, collaborations and music in the uwbelieve catalog.</p>
    <div className="music-artist-list">{publicArtists.map(artist => <Link href={artistPath(artist.slug)} key={artist.slug}><h2>{artist.name}</h2><span>{artistReleases(artist.name).length} catalog releases ↗</span></Link>)}</div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'uwbelieve artists and collaborators', url: `${SITE_URL}/music/artists`, mainEntity: { '@type': 'ItemList', itemListElement: publicArtists.map((artist, index) => ({ '@type': 'ListItem', position: index + 1, name: artist.name, url: `${SITE_URL}${artistPath(artist.slug)}` })) } }) }} />
  </main>
}
