import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { StorySection } from '@/components/sections/StorySection'
import { PlatformsSection } from '@/components/sections/PlatformsSection'
import { SocialSection } from '@/components/sections/SocialSection'

export default function Home() {
  return (
    <main className="relative bg-[#050505]">
      <Navigation />
      <StorySection />
      <PlatformsSection />
      <SocialSection />
      <Footer />
    </main>
  )
}
