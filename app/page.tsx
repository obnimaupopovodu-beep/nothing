import type { Metadata } from 'next'
import { SITE_URL, HOME_TITLE, HOME_DESCRIPTION } from '@/lib/site'
import { Navigation }          from '@/components/layout/Navigation'
import { Footer }              from '@/components/layout/Footer'
import { HeroSection }         from '@/components/sections/HeroSection'
import { StatsBanner }         from '@/components/sections/StatsBanner'
import { MarqueeBand }         from '@/components/sections/MarqueeBand'
import { AboutSection }        from '@/components/sections/AboutSection'
import { ReleasePathsSection } from '@/components/sections/ReleasePathsSection'
import { PlatformsSection }    from '@/components/sections/PlatformsSection'
import { PlaylistsSection }    from '@/components/sections/PlaylistsSection'
import { SocialSection }       from '@/components/sections/SocialSection'
import { FaqSection }          from '@/components/sections/FaqSection'
import { DemoSection }         from '@/components/sections/DemoSection'
import { IntroNavigation }     from '@/components/intro/IntroNavigation'
import { SiteReveal }          from '@/components/intro/SiteReveal'

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/` },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    type: 'website', locale: 'en_US', siteName: 'uwbelieve',
    url: `${SITE_URL}/`, title: HOME_TITLE, description: HOME_DESCRIPTION,
    images: [{ url: '/og-home.png', width: 1200, height: 630, alt: 'uwbelieve. Independent electronic music label.' }],
  },
  twitter: {
    card: 'summary_large_image', title: HOME_TITLE, description: HOME_DESCRIPTION,
    images: ['/og-home.png'],
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'uwbelieve',
      url: `${SITE_URL}/`, description: HOME_DESCRIPTION, email: 'info@uwbelieve.com',
      sameAs: ['https://instagram.com/uwbelieve_records', 'https://tiktok.com/@uwbelieve'],
    },
    {
      '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'uwbelieve', url: `${SITE_URL}/`,
      inLanguage: 'en', publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <IntroNavigation />
      <SiteReveal>
        <main className="relative">
          <Navigation />
          <HeroSection />
          <AboutSection />
          <StatsBanner />
          <MarqueeBand />
          <ReleasePathsSection />
          {/* untouched by design: the everywhere reveal animation */}
          <PlatformsSection />
          <PlaylistsSection />
          <SocialSection />
          <FaqSection />
          <DemoSection />
          <Footer />
        </main>
      </SiteReveal>
    </>
  )
}
