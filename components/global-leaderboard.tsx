"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Trophy, Medal } from "lucide-react"

interface Player {
  id: string
  basename: string
  gamesPlayed: number
  gamesWon: number
  winRate: number
  totalEarned: number
  nfts: number
}

export function GlobalLeaderboard() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulate API call to fetch leaderboard
    setTimeout(() => {
      // Generate mock players
      const mockPlayers: Player[] = Array.from({ length: 50 }, (_, i) => {
        const gamesPlayed = Math.floor(Math.random() * 50) + 1
        const gamesWon = Math.floor(Math.random() * gamesPlayed)
        const winRate = (gamesWon / gamesPlayed) * 100

        return {
          id: `player-${i + 1}`,
          basename: `user${Math.floor(Math.random() * 1000)}.base.eth`,
          gamesPlayed,
          gamesWon,
          winRate,
          totalEarned: Math.floor(Math.random() * 100) + 1,
          nfts: Math.floor(Math.random() * 5),
        }
      })

      // Sort by games won
      const sortedPlayers = mockPlayers.sort((a, b) => b.gamesWon - a.gamesWon)

      setPlayers(sortedPlayers)
      setLoading(false)
    }, 1500)
  }, [])

  const filteredPlayers = players.filter((player) => player.basename.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="mt-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Global Rankings</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by basename"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wins">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="wins">Wins</TabsTrigger>
              <TabsTrigger value="win-rate">Win Rate</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="nfts">NFTs</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 animate-pulse">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="wins" className="space-y-1 mt-0">
                  {filteredPlayers
                    .sort((a, b) => b.gamesWon - a.gamesWon)
                    .slice(0, 20)
                    .map((player, index) => (
                      <LeaderboardRow
                        key={player.id}
                        player={player}
                        index={index}
                        metric={player.gamesWon}
                        metricLabel="wins"
                      />
                    ))}
                </TabsContent>

                <TabsContent value="win-rate" className="space-y-1 mt-0">
                  {filteredPlayers
                    .sort((a, b) => b.winRate - a.winRate)
                    .slice(0, 20)
                    .map((player, index) => (
                      <LeaderboardRow
                        key={player.id}
                        player={player}
                        index={index}
                        metric={Math.round(player.winRate)}
                        metricLabel="%"
                      />
                    ))}
                </TabsContent>

                <TabsContent value="earnings" className="space-y-1 mt-0">
                  {filteredPlayers
                    .sort((a, b) => b.totalEarned - a.totalEarned)
                    .slice(0, 20)
                    .map((player, index) => (
                      <LeaderboardRow
                        key={player.id}
                        player={player}
                        index={index}
                        metric={player.totalEarned}
                        metricLabel="DTAIOC"
                      />
                    ))}
                </TabsContent>

                <TabsContent value="nfts" className="space-y-1 mt-0">
                  {filteredPlayers
                    .sort((a, b) => b.nfts - a.nfts)
                    .slice(0, 20)
                    .map((player, index) => (
                      <LeaderboardRow
                        key={player.id}
                        player={player}
                        index={index}
                        metric={player.nfts}
                        metricLabel="NFTs"
                      />
                    ))}
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function LeaderboardRow({
  player,
  index,
  metric,
  metricLabel,
}: {
  player: Player
  index: number
  metric: number
  metricLabel: string
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md ${
        index % 2 === 0 ? "bg-game-dark-lighter" : ""
      } ${index < 3 ? "border-l-4 " + (index === 0 ? "border-yellow-400" : index === 1 ? "border-gray-400" : "border-amber-600") : ""}`}
    >
      <div className="flex items-center">
        <div className="w-8 flex-shrink-0 text-center mr-3">
          {index === 0 ? (
            <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />
          ) : index === 1 ? (
            <Medal className="h-5 w-5 text-gray-400 mx-auto" />
          ) : index === 2 ? (
            <Medal className="h-5 w-5 text-amber-600 mx-auto" />
          ) : (
            <span className="text-gray-500">{index + 1}</span>
          )}
        </div>
        <span className="text-gray-300 truncate max-w-[200px]" title={player.basename}>
          {player.basename}
        </span>
        <Badge variant="outline" className="ml-3 text-xs">
          {player.gamesPlayed} games
        </Badge>
      </div>
      <div className="font-medium text-gray-300">
        {metric} {metricLabel}
      </div>
    </div>
  )
}
