import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { PLAYLISTS_URL, SITE_URL } from '@/lib/site'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get('host') || '').split(':')[0].toLowerCase()
  const isPlaylistsSite = host === new URL(PLAYLISTS_URL).hostname
  const isPublicSite = isPlaylistsSite || ['uwbelieve.com', 'www.uwbelieve.com'].includes(host)
  if (!isPublicSite || process.env.VERCEL_ENV === 'preview') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  // The wildcard includes Googlebot, Bingbot, OAI-SearchBot and PerplexityBot.
  // Keep one shared policy so AI-specific groups cannot override private-path exclusions.
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/artists', '/admin', '/login', '/preview', '/auth', '/api'] },
    sitemap: `${isPlaylistsSite ? PLAYLISTS_URL : SITE_URL}/sitemap.xml`,
  }
}
