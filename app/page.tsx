import { HeroSection } from "@/components/hero-section"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-game-dark">
      <Navbar />
      <main className="flex-1 w-full">
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}
