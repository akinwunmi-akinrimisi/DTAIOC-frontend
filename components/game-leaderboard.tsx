"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, Medal } from "lucide-react"

interface Player {
  id: string
  basename: string
  stage: number
  question: number
  completionTime?: number // in seconds
  rank?: number
}

export function GameLeaderboard({ gameId, currentStage }: { gameId: string; currentStage: number }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch leaderboard
    setTimeout(() => {
      // Generate mock players
      const mockPlayers: Player[] = Array.from({ length: 10 }, (_, i) => {
        const stage = Math.min(3, Math.floor(Math.random() * (currentStage + 1)) + 1)
        const question = stage === currentStage ? Math.floor(Math.random() * 5) : 5
        const completionTime = stage === 3 && question === 5 ? Math.floor(Math.random() * 300) + 60 : undefined // 1-6 minutes

        return {
          id: `player-${i + 1}`,
          basename: `user${Math.floor(Math.random() * 1000)}.base.eth`,
          stage,
          question,
          completionTime,
        }
      })

      // Add current user
      mockPlayers.push({
        id: "current-user",
        basename: "you.base.eth",
        stage: currentStage,
        question: Math.floor(Math.random() * 5),
      })

      // Sort by stage, then by question, then by completion time
      const sortedPlayers = mockPlayers.sort((a, b) => {
        if (a.stage !== b.stage) return b.stage - a.stage
        if (a.question !== b.question) return b.question - a.question
        if (a.completionTime && b.completionTime) return a.completionTime - b.completionTime
        if (a.completionTime) return -1
        if (b.completionTime) return 1
        return 0
      })

      // Assign ranks to players who completed all stages
      let rank = 1
      sortedPlayers.forEach((player) => {
        if (player.stage === 3 && player.question === 5) {
          player.rank = rank++
        }
      })

      setPlayers(sortedPlayers)
      setLoading(false)
    }, 1000)
  }, [gameId, currentStage])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2 animate-pulse">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {players.map((player, index) => (
        <div
          key={player.id}
          className={`flex items-center justify-between p-2 rounded-md ${
            player.id === "current-user" ? "bg-blue-900/30" : index % 2 === 0 ? "bg-game-dark-lighter" : ""
          } ${player.rank === 1 ? "border-l-4 border-yellow-400" : player.rank === 2 ? "border-l-4 border-gray-400" : player.rank === 3 ? "border-l-4 border-amber-600" : ""}`}
        >
          <div className="flex items-center">
            <div className="w-6 flex-shrink-0 text-center mr-2">
              {player.rank ? (
                player.rank === 1 ? (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                ) : player.rank === 2 ? (
                  <Medal className="h-4 w-4 text-gray-400" />
                ) : player.rank === 3 ? (
                  <Medal className="h-4 w-4 text-amber-600" />
                ) : (
                  player.rank
                )
              ) : (
                index + 1
              )}
            </div>
            <div className="truncate max-w-[120px]" title={player.basename}>
              {player.id === "current-user" ? <span className="font-medium text-gray-300">You</span> : player.basename}
            </div>
          </div>
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2">
              Stage {player.stage}/{player.question === 5 ? "✓" : player.question}
            </Badge>
            {player.completionTime && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                  {Math.floor(player.completionTime / 60)}:{(player.completionTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
