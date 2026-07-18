import { Navigation }       from '@/components/layout/Navigation'
import { Footer }           from '@/components/layout/Footer'
import { StorySection }     from '@/components/sections/StorySection'
import { StatsBanner }      from '@/components/sections/StatsBanner'
import { MarqueeBand }      from '@/components/sections/MarqueeBand'
import { PlatformsSection } from '@/components/sections/PlatformsSection'
import { AboutSection }     from '@/components/sections/AboutSection'
import { SocialSection }    from '@/components/sections/SocialSection'
import { PlaylistsSection } from '@/components/sections/PlaylistsSection'

export default function Home() {
  return (
    <main className="relative" style={{ background: '#000000' }}>
      <Navigation />
      <StorySection />
      <StatsBanner />
      <MarqueeBand />
      <AboutSection />
      <PlatformsSection />
      <SocialSection />
      <PlaylistsSection />
      <Footer />
    </main>
  )
}
