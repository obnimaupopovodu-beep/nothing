import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { PLAYLISTS_URL, SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = ((await headers()).get('host') || '').split(':')[0].toLowerCase()
  const siteUrl = host === new URL(PLAYLISTS_URL).hostname ? PLAYLISTS_URL : SITE_URL
  return [{ url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 }]
}
