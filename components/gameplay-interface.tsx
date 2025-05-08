"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { GameLeaderboard } from "@/components/game-leaderboard"
import { GameResultsModal } from "@/components/game-results-modal"
import { CheckCircle, XCircle, Clock, Trophy, AlertCircle, Loader2 } from "lucide-react"
import confetti from "canvas-confetti"
import { useWeb3 } from "@/contexts/web3-context"
import { getGame, submitAnswers as apiSubmitAnswers } from "@/utils/api"
import { submitAnswers as web3SubmitAnswers } from "@/utils/web3"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Question {
  id: string
  text: string
  options: string[]
}

interface GameState {
  stage: number
  question: number
  score: number
  completed: boolean
  eliminated: boolean
  timeRemaining: number
}

export function GameplayInterface({ gameId }: { gameId: string }) {
  const { address, basename } = useWeb3()
  const [loading, setLoading] = useState(true)
  const [game, setGame] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [gameState, setGameState] = useState<GameState>({
    stage: 1,
    question: 0,
    score: 0,
    completed: false,
    eliminated: false,
    timeRemaining: 0,
  })
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load game data
    const loadGame = async () => {
      try {
        setLoading(true)

        // Fetch game data from API
        const gameData = await getGame(gameId)
        setGame(gameData)

        // Set questions
        setQuestions(gameData.questions)

        // Set time remaining
        const endsAt = new Date(gameData.endsAt).getTime()
        const now = new Date().getTime()
        const timeRemaining = Math.max(0, endsAt - now)

        setGameState((prev) => ({ ...prev, timeRemaining }))

        // Start timer
        const timer = setInterval(() => {
          setGameState((prev) => {
            const newTimeRemaining = prev.timeRemaining - 1000
            if (newTimeRemaining <= 0) {
              clearInterval(timer)
              return { ...prev, timeRemaining: 0 }
            }
            return { ...prev, timeRemaining: newTimeRemaining }
          })
        }, 1000)

        setLoading(false)

        return () => clearInterval(timer)
      } catch (err) {
        console.error("Failed to load game:", err)
        setError("Failed to load game data. Please try again.")
        setLoading(false)
      }
    }

    loadGame()
  }, [gameId])

  const handleOptionSelect = (index: number) => {
    if (feedback || submitting) return
    setSelectedOption(index)
  }

  const handleSubmit = async () => {
    if (selectedOption === null || submitting || !address || !basename) return

    setSubmitting(true)
    setError(null)

    try {
      // 1. Submit answer to API
      const { isCorrect, score } = await apiSubmitAnswers(gameId, {
        stage: gameState.stage,
        question: gameState.question,
        selectedOption,
        address,
        basename,
      })

      setFeedback(isCorrect ? "correct" : "incorrect")

      if (isCorrect) {
        // If this is the last question in the stage
        if (gameState.question === 4) {
          // If this is the last stage
          if (gameState.stage === 3) {
            // Game completed successfully
            setTimeout(() => {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              })

              // 2. Submit answers to blockchain
              web3SubmitAnswers(address, gameId, gameState.stage, [score])
                .then(() => {
                  setGameState((prev) => ({
                    ...prev,
                    completed: true,
                    score: prev.score + 1,
                  }))
                  setShowResults(true)
                })
                .catch((err) => {
                  console.error("Failed to submit answers to blockchain:", err)
                  setError(
                    "Failed to submit answers to blockchain. Your progress has been saved, but rewards may be delayed.",
                  )
                  setGameState((prev) => ({
                    ...prev,
                    completed: true,
                    score: prev.score + 1,
                  }))
                  setShowResults(true)
                })
            }, 1500)
          } else {
            // Move to next stage
            setTimeout(() => {
              confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.6 },
              })

              // 2. Submit answers to blockchain
              web3SubmitAnswers(address, gameId, gameState.stage, [score])
                .then(() => {
                  setGameState((prev) => ({
                    ...prev,
                    stage: prev.stage + 1,
                    question: 0,
                    score: prev.score + 1,
                  }))
                  setFeedback(null)
                  setSelectedOption(null)
                  setSubmitting(false)
                })
                .catch((err) => {
                  console.error("Failed to submit answers to blockchain:", err)
                  setError(
                    "Failed to submit answers to blockchain. Your progress has been saved, but you may need to reconnect.",
                  )
                  setGameState((prev) => ({
                    ...prev,
                    stage: prev.stage + 1,
                    question: 0,
                    score: prev.score + 1,
                  }))
                  setFeedback(null)
                  setSelectedOption(null)
                  setSubmitting(false)
                })
            }, 1500)
          }
        } else {
          // Move to next question
          setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              question: prev.question + 1,
              score: prev.score + 1,
            }))
            setFeedback(null)
            setSelectedOption(null)
            setSubmitting(false)
          }, 1500)
        }
      } else {
        // Player is eliminated
        setTimeout(() => {
          // 2. Submit answers to blockchain
          web3SubmitAnswers(address, gameId, gameState.stage, [score])
            .then(() => {
              setGameState((prev) => ({
                ...prev,
                eliminated: true,
              }))
              setShowResults(true)
            })
            .catch((err) => {
              console.error("Failed to submit answers to blockchain:", err)
              setError(
                "Failed to submit answers to blockchain. Your progress has been saved, but rewards may be delayed.",
              )
              setGameState((prev) => ({
                ...prev,
                eliminated: true,
              }))
              setShowResults(true)
            })
        }, 1500)
      }
    } catch (err) {
      console.error("Failed to submit answer:", err)
      setError("Failed to submit answer. Please try again.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading game...</p>
      </div>
    )
  }

  if (error && !game) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const currentQuestion = questions[(gameState.stage - 1) * 5 + gameState.question]

  // Format time remaining
  const hours = Math.floor(gameState.timeRemaining / (1000 * 60 * 60))
  const minutes = Math.floor((gameState.timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((gameState.timeRemaining % (1000 * 60)) / 1000)
  const timeRemainingFormatted = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="w-full md:w-2/3">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <Badge className="mb-2">Stage {gameState.stage}/3</Badge>
                  <CardTitle>Question {gameState.question + 1}/5</CardTitle>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-1 h-4 w-4 text-gray-500" />
                  <span className="font-mono">{timeRemainingFormatted}</span>
                </div>
              </div>
              <Progress value={(gameState.score / 15) * 100} className="h-2" />
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6">{currentQuestion.text}</p>

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedOption === index ? "default" : "outline"}
                    className={`justify-start h-auto py-3 px-4 text-left ${
                      feedback === "correct" && selectedOption === index
                        ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-300"
                        : feedback === "incorrect" && selectedOption === index
                          ? "bg-red-100 text-red-800 hover:bg-red-100 border-red-300"
                          : ""
                    }`}
                    onClick={() => handleOptionSelect(index)}
                    disabled={!!feedback || submitting}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        {feedback === "correct" && selectedOption === index ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : feedback === "incorrect" && selectedOption === index ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              selectedOption === index ? "border-white" : "border-gray-400"
                            }`}
                          >
                            {selectedOption === index && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                          </div>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </Button>
                ))}
              </div>

              {feedback && (
                <div
                  className={`mt-4 p-3 rounded-md ${
                    feedback === "correct" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  {feedback === "correct" ? (
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                      <span>
                        Correct!{" "}
                        {gameState.question === 4 && gameState.stage === 3
                          ? "You've completed all questions!"
                          : gameState.question === 4
                            ? "Moving to next stage..."
                            : "Moving to next question..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircle className="mr-2 h-5 w-5 text-red-600" />
                      <span>Incorrect! You've been eliminated from the game.</span>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                disabled={selectedOption === null || !!feedback || submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Answer"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Stage 1</span>
                    <span className="text-sm text-gray-500">
                      {gameState.stage > 1 ? "5/5" : gameState.stage === 1 ? `${gameState.question}/5` : "0/5"}
                    </span>
                  </div>
                  <Progress value={gameState.stage > 1 ? 100 : (gameState.question / 5) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Stage 2</span>
                    <span className="text-sm text-gray-500">
                      {gameState.stage > 2 ? "5/5" : gameState.stage === 2 ? `${gameState.question}/5` : "0/5"}
                    </span>
                  </div>
                  <Progress
                    value={gameState.stage > 2 ? 100 : gameState.stage === 2 ? (gameState.question / 5) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Stage 3</span>
                    <span className="text-sm text-gray-500">
                      {gameState.stage === 3 ? `${gameState.question}/5` : "0/5"}
                    </span>
                  </div>
                  <Progress value={gameState.stage === 3 ? (gameState.question / 5) * 100 : 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Leaderboard</CardTitle>
                <Badge variant="outline" className="flex items-center">
                  <Trophy className="mr-1 h-3 w-3" />
                  <span>Top 3 Win</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <GameLeaderboard gameId={gameId} currentStage={gameState.stage} />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Game Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Creator:</span>
                  <p className="font-medium">{game.creatorBasename}</p>
                </div>
                <Separator />
                <div>
                  <span className="text-sm text-gray-500">Stake Amount:</span>
                  <p className="font-medium">{game.stakeAmount} DTAIOC</p>
                </div>
                <Separator />
                <div>
                  <span className="text-sm text-gray-500">Players:</span>
                  <p className="font-medium">
                    {game.playerCount}/{game.playerLimit}
                  </p>
                </div>
                <Separator />
                <div>
                  <span className="text-sm text-gray-500">Reward Structure:</span>
                  <ul className="text-sm mt-1 space-y-1">
                    <li className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Stage 1 Failure: 0% refund</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Stage 2 Failure: 30% refund</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>Stage 3 Failure: 70% refund</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Perfect Score: 100% refund + NFT (top 3)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showResults && <GameResultsModal gameState={gameState} onClose={() => setShowResults(false)} />}
    </div>
  )
}
