import { ReleasePlayer } from '@/components/catalog/ReleasePlayer'
import { CatalogBackLink } from '@/components/catalog/CatalogBackLink'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { catalogUrlSlug } from '@/lib/catalogLinks'
import { catalogReleases } from '@/components/data/catalog'
import '../../catalog-detail.css'

export function generateStaticParams() {
  return Array.from(new Set(catalogReleases.flatMap(({ slug }) => [slug, catalogUrlSlug(slug)]))).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const release = catalogReleases.find((item) => item.slug === slug || catalogUrlSlug(item.slug) === slug)
  return { title: release ? `${release.title} — ${release.artist} | uwbelieve` : 'Release | uwbelieve' }
}

export default async function CatalogReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const release = catalogReleases.find((item) => item.slug === slug || catalogUrlSlug(item.slug) === slug)
  if (!release) notFound()
  return <main className="catalog-detail">
    <header className="catalog-detail__nav"><Link href="/" prefetch={false}>uwbelieve<span>.</span></Link><CatalogBackLink /></header>
    <ReleasePlayer key={release.slug} release={release} />
  </main>
}
