import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { StorySection } from '@/components/sections/StorySection'

export default function Home() {
  return (
    <main className="relative bg-[#050505]">
      <Navigation />
      <StorySection />
      <Footer />
    </main>
  )
}
