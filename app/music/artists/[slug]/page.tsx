import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ReleaseCards } from '@/components/music/ReleaseCards'
import { publicArtists, artistPath, artistDescription, artistReleases, artistEntity, recordingEntity, jsonLd } from '@/lib/musicDiscovery'
import { SITE_URL } from '@/lib/site'
import '../../music.css'
export const dynamicParams = false
export function generateStaticParams() { return publicArtists.map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const artist = publicArtists.find(item => item.slug === slug)
  if (!artist) notFound()
  const title = `${artist.name} — Music, Releases & Collaborations | uwbelieve`
  const description = artistDescription(artist.name), url = `${SITE_URL}${artistPath(slug)}`
  const image = artistReleases(artist.name)[0]?.artwork
  return { title, description, alternates: { canonical: url }, robots: { index: true, follow: true, googleBot: { 'max-image-preview': 'large' } },
    openGraph: { type: 'website', title, description, url, siteName: 'uwbelieve', images: image ? [{ url: image, alt: `Artwork from ${artist.name}'s catalog` }] : [] },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : [] } }
}
export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artist = publicArtists.find(item => item.slug === slug)
  if (!artist) notFound()
  const releases = artistReleases(artist.name), url = `${SITE_URL}${artistPath(slug)}`
  const collaborators = publicArtists.filter(other => other.slug !== slug && releases.some(release => artistReleases(other.name).includes(release)))
  const graph = [
    { ...artistEntity(artist.name), description: artistDescription(artist.name), ...(artist.sameAs.length ? { sameAs: artist.sameAs } : {}) },
    { '@type': 'ProfilePage', '@id': `${url}#page`, name: `${artist.name} on uwbelieve`, url, mainEntity: { '@id': `${url}#artist` }, isPartOf: { '@id': `${SITE_URL}/#website` } },
    { '@type': 'ItemList', name: `${artist.name} — uwbelieve catalog`, itemListElement: releases.map((release, index) => ({ '@type': 'ListItem', position: index + 1, item: recordingEntity(release) })) },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'uwbelieve', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Artists', item: `${SITE_URL}/music/artists` }, { '@type': 'ListItem', position: 3, name: artist.name, item: url }] },
  ]
  return <main className="music-page"><header><Link href="/">uwbelieve.</Link><Link href="/music/artists">← All artists</Link></header>
    <h1>{artist.name}</h1>{!!artist.aliases.length && <p className="music-note">Also known as: {artist.aliases.join(", ")}</p>}<p className="music-intro">{artist.biography || artistDescription(artist.name)}</p>
    <p className="music-note">This page documents {artist.name}’s appearances in the uwbelieve catalog, rather than a complete discography.</p>
    <section aria-labelledby="artist-releases"><h2 id="artist-releases">Music &amp; releases</h2><ReleaseCards releases={releases} /></section>
    {!!collaborators.length && <section><h2>Collaborations in this catalog</h2><div className="music-collaborators">{collaborators.map(other => <Link key={other.slug} href={artistPath(other.slug)}>{other.name} ↗</Link>)}</div></section>}
    {!!artist.sameAs.length && <section><h2>Official artist profiles</h2>{artist.sameAs.map(link => <a className="music-link" key={link} href={link} target="_blank" rel="noopener noreferrer">{new URL(link).hostname} ↗</a>)}</section>}
    <footer><Link href="/#catalog">Explore the full catalog ↗</Link><Link href="/for-artists">For artists ↗</Link></footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@graph': graph }) }} />
  </main>
}
