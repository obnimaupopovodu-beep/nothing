import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { catalogReleases } from '@/components/data/catalog'
import '../../catalog-detail.css'

export function generateStaticParams() {
  return catalogReleases.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const release = catalogReleases.find((item) => item.slug === slug)
  return { title: release ? `${release.title} — ${release.artist} | uwbelieve` : 'Release | uwbelieve' }
}

export default async function CatalogReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const release = catalogReleases.find((item) => item.slug === slug)
  if (!release) notFound()
  return <main className="catalog-detail">
    <header className="catalog-detail__nav"><a href="/">uwbelieve<span>.</span></a><a href="/#top">← Back to the label</a></header>
    <div className="catalog-detail__content">
      <div className="catalog-detail__art"><img src={release.artwork} alt={`${release.title} cover`} /></div>
      <div className="catalog-detail__info">
        <p>uwbelieve / release concept</p>
        <h1>{release.title}</h1>
        <h2>{release.artist}</h2>
        <span>{release.year}</span>
        <p className="catalog-detail__note">{release.description}</p>
        <a href="/#top" className="btn btn-ghost">Back to homepage</a>
      </div>
    </div>
  </main>
}
