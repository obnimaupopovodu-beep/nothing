import { ReleasePlayer } from '@/components/catalog/ReleasePlayer'
import { CatalogBackLink } from '@/components/catalog/CatalogBackLink'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { artistPath, artistEntity, findArtist, releaseArtists, recordingEntity, jsonLd } from '@/lib/musicDiscovery'
import { SITE_URL } from '@/lib/site'
import { catalogReleasePath, catalogUrlSlug } from '@/lib/catalogLinks'
import { catalogReleases } from '@/components/data/catalog'
import '../../catalog-detail.css'
import '../../music/music.css'

export function generateStaticParams() {
  return Array.from(new Set(catalogReleases.flatMap(({ slug }) => [slug, catalogUrlSlug(slug)]))).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const release = catalogReleases.find((item) => item.slug === slug || catalogUrlSlug(item.slug) === slug)
  if (!release) notFound()
  const title = `${release.title} — ${release.artist} | uwbelieve`
  const description = `${release.title} by ${release.artist} in the uwbelieve catalog. ${release.description}. Explore the release, artist credits and available streaming links.`
  const url = `${SITE_URL}${catalogReleasePath(release.slug)}`
  return { title, description, alternates: { canonical: url }, robots: { index: true, follow: true, googleBot: { 'max-image-preview': 'large' } },
    openGraph: { type: 'music.song', title, description, url, siteName: 'uwbelieve', images: [{ url: release.artwork, alt: `${release.title} cover` }] },
    twitter: { card: 'summary_large_image', title, description, images: [release.artwork] } }
}

export default async function CatalogReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const release = catalogReleases.find((item) => item.slug === slug || catalogUrlSlug(item.slug) === slug)
  if (!release) notFound()
  return <main className="catalog-detail">
    <header className="catalog-detail__nav"><Link href="/" prefetch={false}>uwbelieve<span>.</span></Link><CatalogBackLink /></header>
    <ReleasePlayer key={release.slug} release={release} />
    <section className="catalog-detail__artists"><h2>Artists on this release</h2>{releaseArtists(release).map(name => {
      const artist = findArtist(name)
      return artist ? <Link key={artist.slug} href={artistPath(artist.slug)}>{artist.name} ↗</Link> : <span key={name}>{name}</span>
    })}</section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@graph': [recordingEntity(release), ...releaseArtists(release).map(artistEntity),
      { '@type': 'WebPage', name: `${release.title} — ${release.artist}`, url: `${SITE_URL}${catalogReleasePath(release.slug)}`, mainEntity: { '@id': `${SITE_URL}${catalogReleasePath(release.slug)}#recording` }, isPartOf: { '@id': `${SITE_URL}/#website` } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'uwbelieve catalog', item: `${SITE_URL}/#catalog` }, { '@type': 'ListItem', position: 2, name: release.title, item: `${SITE_URL}${catalogReleasePath(release.slug)}` }] },
    ] }) }} />
  </main>
}
