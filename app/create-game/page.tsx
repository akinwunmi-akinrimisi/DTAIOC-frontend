"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GameCreationWizard } from "@/components/game-creation-wizard"

export default function CreateGamePage() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-game-dark">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary">
              Create a New Game
            </h1>
            <p className="mt-2 text-gray-300">
              Create a new trivia game with questions generated from your Twitter activity
            </p>
            <GameCreationWizard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
