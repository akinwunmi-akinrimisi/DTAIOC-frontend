import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GameplayInterface } from "@/components/gameplay-interface"

export default function GamePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-game-dark">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <GameplayInterface gameId={params.id} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
