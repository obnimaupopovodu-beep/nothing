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

export default function Home() {
  return (
    <>
      <IntroNavigation />
      <main className="relative">
        <Navigation />
        <HeroSection />
        <StatsBanner />
        <MarqueeBand />
        <AboutSection />
        <ReleasePathsSection />
        {/* untouched by design: the everywhere reveal animation */}
        <PlatformsSection />
        <PlaylistsSection />
        <SocialSection />
        <FaqSection />
        <DemoSection />
        <Footer />
      </main>
    </>
  )
}
