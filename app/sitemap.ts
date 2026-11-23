import type { MetadataRoute } from 'next'
import { catalogReleases } from '@/components/data/catalog'
import { catalogReleasePath } from '@/lib/catalogLinks'
import { publicArtists, artistPath } from '@/lib/musicDiscovery'
import { headers } from 'next/headers'
import { PLAYLISTS_URL, SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = ((await headers()).get('host') || '').split(':')[0].toLowerCase()
  const siteUrl = host === new URL(PLAYLISTS_URL).hostname ? PLAYLISTS_URL : SITE_URL
  if (siteUrl === PLAYLISTS_URL) return [{ url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 }]
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/for-artists`, changeFrequency: 'monthly', priority: .8 },
    { url: `${SITE_URL}/music/artists`, changeFrequency: 'weekly', priority: .8 },
    ...publicArtists.map(artist => ({ url: `${SITE_URL}${artistPath(artist.slug)}`, changeFrequency: 'weekly' as const, priority: .7 })),
    ...catalogReleases.map(release => ({ url: `${SITE_URL}${catalogReleasePath(release.slug)}`, changeFrequency: 'monthly' as const, priority: .7 })),
  ]
}
