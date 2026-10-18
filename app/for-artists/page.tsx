import type { Metadata } from 'next'
import { SITE_URL, ARTIST_TITLE, ARTIST_DESCRIPTION } from '@/lib/site'
import { Navigation }          from '@/components/layout/Navigation'
import { Footer }              from '@/components/layout/Footer'
import { HeroSection }         from '@/components/sections/HeroSection'
import { StatsBanner }         from '@/components/sections/StatsBanner'
import { MarqueeBand }         from '@/components/sections/MarqueeBand'
import { AboutSection }        from '@/components/sections/AboutSection'
import { ReleasePathsSection } from '@/components/sections/ReleasePathsSection'
import { PlatformsSection }    from '@/components/sections/PlatformsSection'
import { SocialSection }       from '@/components/sections/SocialSection'
import { FaqSection }          from '@/components/sections/FaqSection'
import { DemoSection }         from '@/components/sections/DemoSection'
import { IntroNavigation }     from '@/components/intro/IntroNavigation'
import { SiteReveal }          from '@/components/intro/SiteReveal'

export const metadata: Metadata = {
  title: ARTIST_TITLE,
  description: ARTIST_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/for-artists` },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    type: 'website', locale: 'en_US', siteName: 'uwbelieve',
    url: `${SITE_URL}/for-artists`, title: ARTIST_TITLE, description: ARTIST_DESCRIPTION,
    images: [{ url: '/og-home.png', width: 1200, height: 630, alt: 'uwbelieve. Independent electronic music label.' }],
  },
  twitter: {
    card: 'summary_large_image', title: ARTIST_TITLE, description: ARTIST_DESCRIPTION,
    images: ['/og-home.png'],
  },
}

export default function ForArtists() {
  return (
    <>
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
          <SocialSection />
          <FaqSection />
          <DemoSection />
          <Footer />
        </main>
      </SiteReveal>
    </>
  )
}
