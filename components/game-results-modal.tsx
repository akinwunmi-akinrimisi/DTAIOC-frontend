"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trophy, Coins, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface GameState {
  stage: number
  question: number
  score: number
  completed: boolean
  eliminated: boolean
  timeRemaining: number
}

interface GameResultsModalProps {
  gameState: GameState
  onClose: () => void
}

export function GameResultsModal({ gameState, onClose }: GameResultsModalProps) {
  const router = useRouter()
  const [rank, setRank] = useState<number | null>(null)
  const [refundPercentage, setRefundPercentage] = useState(0)
  const [reward, setReward] = useState(0)
  const [hasNft, setHasNft] = useState(false)

  useEffect(() => {
    // Calculate results based on game state
    if (gameState.completed) {
      // Randomly assign a rank for demo purposes
      const randomRank = Math.floor(Math.random() * 5) + 1
      setRank(randomRank)
      setRefundPercentage(100)

      // Top 3 get NFTs and rewards
      if (randomRank <= 3) {
        setHasNft(true)
        setReward(Math.floor(Math.random() * 5) + 3) // 3-8 tokens
      }
    } else if (gameState.eliminated) {
      // Calculate refund based on stage
      if (gameState.stage === 1) {
        setRefundPercentage(0)
      } else if (gameState.stage === 2) {
        setRefundPercentage(30)
      } else if (gameState.stage === 3) {
        setRefundPercentage(70)
      }
    }
  }, [gameState])

  const handlePlayAgain = () => {
    router.push("/marketplace")
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {gameState.completed ? "Game Completed!" : "Game Over"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {gameState.completed
              ? "You've successfully completed all questions!"
              : `You've been eliminated at Stage ${gameState.stage}, Question ${gameState.question + 1}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {gameState.completed ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {rank && rank <= 3 ? (
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Trophy className="h-12 w-12 text-yellow-500" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                      #{rank}
                    </div>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                    <Trophy className="h-12 w-12 text-blue-500" />
                  </div>
                )}
              </div>

              <h3 className="text-lg font-medium mb-1">
                {rank && rank <= 3 ? "Congratulations! You're in the top 3!" : "Well done!"}
              </h3>
              <p className="text-gray-500 mb-4">
                {rank && rank <= 3
                  ? "You've earned an NFT and a share of the rewards!"
                  : "You've completed all questions successfully."}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-green-50 p-3 rounded-md text-center">
                  <p className="text-sm text-green-600 mb-1">Refund</p>
                  <p className="text-xl font-bold text-green-700">{refundPercentage}%</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-md text-center">
                  <p className="text-sm text-blue-600 mb-1">Reward</p>
                  <p className="text-xl font-bold text-blue-700">{reward > 0 ? `+${reward} DTAIOC` : "0 DTAIOC"}</p>
                </div>
              </div>

              {hasNft && (
                <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center justify-center">
                    <Trophy className="h-4 w-4 mr-1" /> Winner NFT Earned
                  </h4>
                  <div className="bg-white p-2 rounded border">
                    <div className="aspect-square rounded bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">DTriviaAIOnChain</p>
                        <p className="text-lg font-bold text-primary">#{rank} Winner</p>
                        <p className="text-xs text-gray-500">Game #{Math.floor(Math.random() * 1000)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
              </div>

              <h3 className="text-lg font-medium mb-1">Better luck next time!</h3>
              <p className="text-gray-500 mb-4">
                You've been eliminated, but you'll receive a partial refund of your stake.
              </p>

              <div className="bg-blue-50 p-4 rounded-md text-center mt-6">
                <p className="text-sm text-blue-600 mb-1">Refund Amount</p>
                <div className="flex items-center justify-center">
                  <Coins className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="text-xl font-bold text-blue-700">{refundPercentage}%</p>
                </div>
                <p className="text-xs text-blue-500 mt-1">
                  {refundPercentage === 0
                    ? "No refund for Stage 1 elimination"
                    : refundPercentage === 30
                      ? "30% refund for Stage 2 elimination"
                      : "70% refund for Stage 3 elimination"}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handlePlayAgain} className="w-full">
            Play Another Game
          </Button>
          <Button variant="outline" onClick={() => router.push("/leaderboard")} className="w-full">
            View Leaderboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
