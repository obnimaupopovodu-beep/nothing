import { Navigation } from '@/components/layout/Navigation'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { PlatformsSection } from '@/components/sections/PlatformsSection'
import { FeaturedRelease } from '@/components/sections/FeaturedRelease'
import { SocialSection } from '@/components/sections/SocialSection'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <main className="relative bg-[#050505]">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <PlatformsSection />
      <FeaturedRelease />
      <SocialSection />
      <Footer />
    </main>
  )
}
