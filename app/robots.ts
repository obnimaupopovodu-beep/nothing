import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { SITE_URL } from '@/lib/site'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get('host') || '').split(':')[0].toLowerCase()
  const isPublicSite = ['uwbelieve.com', 'www.uwbelieve.com'].includes(host)
  if (!isPublicSite || process.env.VERCEL_ENV === 'preview') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/artists', '/admin', '/login', '/preview', '/auth', '/api'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
