import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GlobalLeaderboard } from "@/components/global-leaderboard"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-game-dark">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary">
              Leaderboard
            </h1>
            <p className="mt-2 text-gray-300">View top players and their achievements</p>
            <GlobalLeaderboard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
