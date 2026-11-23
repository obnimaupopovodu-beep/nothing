import Image from 'next/image'
import Link from 'next/link'
import type { CatalogRelease } from '@/components/data/catalog'
import { catalogReleasePath } from '@/lib/catalogLinks'
export function ReleaseCards({ releases }: { releases: CatalogRelease[] }) {
  return <div className="music-records">{releases.map(release => <article key={release.slug}>
    <Link href={catalogReleasePath(release.slug)}><Image unoptimized src={release.artwork} alt={`${release.title} cover`} width={450} height={450} /><h3>{release.title}</h3></Link>
    <p>{release.artist} · {release.year}</p><p>{release.description}</p>
    <Link className="music-link" href={catalogReleasePath(release.slug)}>Explore release ↗</Link>
  </article>)}</div>
}
