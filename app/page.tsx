import type { Metadata } from 'next'
import { ListenerHome } from '@/components/listeners/ListenerHome'
import { SITE_URL, HOME_TITLE_LISTENERS, LISTENER_DESCRIPTION } from '@/lib/site'
import { IntroNavigation } from '@/components/intro/IntroNavigation'
import { SiteReveal } from '@/components/intro/SiteReveal'
import './listeners.css'

export const metadata: Metadata = {
  title: HOME_TITLE_LISTENERS,
  description: LISTENER_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/` },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    type: 'website', locale: 'en_US', siteName: 'uwbelieve', url: `${SITE_URL}/`,
    title: HOME_TITLE_LISTENERS, description: LISTENER_DESCRIPTION,
    images: [{ url: '/images/listener-speaker.webp', alt: 'Discover independent electronic music with uwbelieve.' }],
  },
  twitter: { card: 'summary_large_image', title: HOME_TITLE_LISTENERS, description: LISTENER_DESCRIPTION, images: ['/images/listener-speaker.webp'] },
}
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'uwbelieve', url: `${SITE_URL}/`,
      description: LISTENER_DESCRIPTION, email: 'info@uwbelieve.com',
      sameAs: ['https://instagram.com/uwbelieve_records', 'https://tiktok.com/@uwbelieve'] },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'uwbelieve', url: `${SITE_URL}/`,
      inLanguage: 'en', publisher: { '@id': `${SITE_URL}/#organization` } },
  ],
}
export default function Home() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} /><IntroNavigation skipOnHash routes={[
    { label: 'Discover artists', target: '#discover' },
    { label: 'Hear the catalog', target: '#catalog' },
    { label: 'Your sound', target: '#your-sound' },
    { label: 'Join the community', target: '#community' },
  ]} /><SiteReveal skipOnHash><ListenerHome /></SiteReveal></>
}
