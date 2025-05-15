"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Coins, Search, Plus, Filter } from "lucide-react"
import Link from "next/link"
import { JoinGameModal } from "@/components/join-game-modal"
import { getGames } from "@/utils/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/contexts/web3-context"
import { WalletPrompt } from "@/components/wallet-prompt"

interface Game {
  id: string
  creatorBasename: string
  stakeAmount: number
  playerCount: number
  playerLimit: number
  duration: number // in hours
  createdAt: Date
  endsAt: Date
}

export function GameMarketplace() {
  const { isConnected } = useWeb3()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showWalletPrompt, setShowWalletPrompt] = useState(false)

  useEffect(() => {
    // Fetch games from API
    const fetchGames = async () => {
      try {
        setLoading(true)
        const gamesData = await getGames()

        // Convert dates to Date objects
        const formattedGames = gamesData.map((game: any) => ({
          ...game,
          createdAt: new Date(game.createdAt),
          endsAt: new Date(game.endsAt),
        }))

        setGames(formattedGames)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch games:", err)
        setError("Unable to load games. Using demo data instead.")

        // Fallback to demo data on error
        const demoGames = [
          {
            id: "demo-1",
            creatorBasename: "demo.creator.base.eth",
            stakeAmount: 5,
            playerCount: 8,
            playerLimit: 30,
            duration: 24,
            createdAt: new Date(Date.now() - 3600000),
            endsAt: new Date(Date.now() + 86400000),
          },
          {
            id: "demo-2",
            creatorBasename: "trivia.master.base.eth",
            stakeAmount: 10,
            playerCount: 12,
            playerLimit: 20,
            duration: 12,
            createdAt: new Date(Date.now() - 7200000),
            endsAt: new Date(Date.now() + 43200000),
          },
          {
            id: "demo-3",
            creatorBasename: "crypto.quiz.base.eth",
            stakeAmount: 3,
            playerCount: 5,
            playerLimit: 15,
            duration: 48,
            createdAt: new Date(Date.now() - 10800000),
            endsAt: new Date(Date.now() + 172800000),
          },
        ]
        setGames(demoGames)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()

    // Refresh games every 30 seconds
    const interval = setInterval(fetchGames, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleJoinGame = (game: Game) => {
    if (!isConnected) {
      setShowWalletPrompt(true)
      return
    }

    setSelectedGame(game)
    setShowJoinModal(true)
  }

  const filteredGames = games.filter((game) => game.creatorBasename.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="mt-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by creator"
            className="pl-8 bg-game-dark-lighter border-game-dark-border text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center bg-game-dark-lighter border-game-dark-border text-white hover:bg-game-dark-accent"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Link href="/create-game" className="w-full sm:w-auto">
            <Button
              className="w-full flex items-center bg-gradient-to-r from-game-primary to-game-secondary hover:shadow-neon text-white"
              onClick={(e) => {
                if (!isConnected) {
                  e.preventDefault()
                  setShowWalletPrompt(true)
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Game
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4 bg-game-error/20 border-game-error text-white">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-game-dark-card border-game-dark-border">
              <CardHeader className="pb-2">
                <div className="h-6 bg-game-dark-lighter rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-game-dark-lighter rounded w-1/2"></div>
                  <div className="h-4 bg-game-dark-lighter rounded w-2/3"></div>
                  <div className="h-4 bg-game-dark-lighter rounded w-1/3"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-game-dark-lighter rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onJoin={handleJoinGame} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-game-dark-card border border-game-dark-border rounded-lg">
          <h3 className="text-lg font-medium text-white">No games found</h3>
          <p className="mt-2 text-sm text-gray-300">Try adjusting your search or create your own game</p>
          <Link href="/create-game" className="mt-4 inline-block">
            <Button
              className="bg-gradient-to-r from-game-primary to-game-secondary hover:shadow-neon text-white"
              onClick={(e) => {
                if (!isConnected) {
                  e.preventDefault()
                  setShowWalletPrompt(true)
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Game
            </Button>
          </Link>
        </div>
      )}

      {showJoinModal && selectedGame && <JoinGameModal game={selectedGame} onClose={() => setShowJoinModal(false)} />}
      <WalletPrompt isOpen={showWalletPrompt} onClose={() => setShowWalletPrompt(false)} />
    </div>
  )
}

function GameCard({ game, onJoin }: { game: Game; onJoin: (game: Game) => void }) {
  // Calculate time remaining
  const now = new Date()
  const timeRemaining = game.endsAt.getTime() - now.getTime()
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)))
  const minutesRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)))

  const isEnding = hoursRemaining < 1

  return (
    <Card className="game-card overflow-hidden hover:scale-105 transition-all duration-300">
      <CardHeader className="pb-2 bg-game-dark-accent border-b border-game-dark-border">
        <CardTitle className="text-lg flex items-center">
          <span className="truncate text-white">{game.creatorBasename}</span>
          {isEnding && (
            <Badge variant="outline" className="ml-2 bg-game-error/20 text-game-error border-game-error">
              Ending Soon
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <div className="w-8 h-8 rounded-full bg-game-primary/20 flex items-center justify-center mr-2">
              <Coins className="h-4 w-4 text-game-primary" />
            </div>
            <span className="text-gray-300">
              Stake: <span className="text-white font-medium">{game.stakeAmount} DTAIOC</span>
            </span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-8 h-8 rounded-full bg-game-secondary/20 flex items-center justify-center mr-2">
              <Users className="h-4 w-4 text-game-secondary" />
            </div>
            <span className="text-gray-300">
              Players:{" "}
              <span className="text-white font-medium">
                {game.playerCount}/{game.playerLimit}
              </span>
            </span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-8 h-8 rounded-full bg-game-highlight/20 flex items-center justify-center mr-2">
              <Clock className="h-4 w-4 text-game-highlight" />
            </div>
            <span className="text-gray-300">
              {hoursRemaining > 0 ? `${hoursRemaining}h ` : ""}
              {minutesRemaining}m remaining
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-game-dark-accent border-t border-game-dark-border">
        <Button
          onClick={() => onJoin(game)}
          className={`w-full ${
            game.playerCount >= game.playerLimit
              ? "bg-game-dark-lighter text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-game-primary to-game-secondary hover:shadow-neon text-white"
          }`}
          disabled={game.playerCount >= game.playerLimit}
        >
          {game.playerCount >= game.playerLimit ? "Game Full" : "Join Game"}
        </Button>
      </CardFooter>
    </Card>
  )
}
