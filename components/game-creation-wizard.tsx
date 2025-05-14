"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Twitter, ArrowLeft, ArrowRight, Check, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWeb3 } from "@/contexts/web3-context"
import { generateQuestions, createGame as apiCreateGame } from "@/utils/api"
import { createGame as web3CreateGame, calculateNamehash } from "@/utils/web3"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { BasenameModal } from "./basename-modal"
import { useWalletClient } from "wagmi"

interface Question {
  id: string
  text: string
  options: string[]
  correctOption: number
  hash?: string
}

export function GameCreationWizard() {
  const router = useRouter()
  const { address, basename, isConnected } = useWeb3()
  const { toast } = useToast()
  const { data: walletClient } = useWalletClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [twitterUsername, setTwitterUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [stakeAmount, setStakeAmount] = useState("1")
  const [playerLimit, setPlayerLimit] = useState("30")
  const [duration, setDuration] = useState("1")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  const [showBasenameModal, setShowBasenameModal] = useState(false)

  // Check if wallet is connected and basename is set
  useEffect(() => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a game.",
        variant: "destructive",
      })
    } else if (!basename) {
      toast({
        title: "Basename Not Set",
        description: "Please set a basename to create a game.",
        variant: "destructive",
      })
      setShowBasenameModal(true)
    }
  }, [isConnected, basename, toast])

  const handleTwitterSubmit = async () => {
    if (!twitterUsername) {
      setError("Please enter your Twitter username")
      return
    }

    if (!isConnected || !address) {
      setError("Wallet not connected. Please connect your wallet first.")
      return
    }

    if (!basename) {
      setError("Basename not set. Please set your basename first.")
      setShowBasenameModal(true)
      return
    }

    setError("")
    setLoading(true)

    try {
      // Clean up Twitter username (remove @ if present)
      const cleanUsername = twitterUsername.startsWith("@") ? twitterUsername.substring(1) : twitterUsername

      // Call API to generate questions
      const generatedQuestions = await generateQuestions(cleanUsername)

      // Format questions
      const formattedQuestions = generatedQuestions.map((q, i) => ({
        id: `q-${i + 1}`,
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
      }))

      setQuestions(formattedQuestions)
      setCurrentStep(2)
    } catch (err) {
      console.error("Failed to generate questions:", err)
      setError(err instanceof Error ? err.message : "Failed to generate questions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionEdit = (id: string, field: string, value: string | number) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const handleOptionEdit = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === optionIndex ? value : opt)),
            }
          : q,
      ),
    )
  }

  // Update the handleCreateGame function to handle the namehash calculation
  const handleCreateGame = async () => {
    if (!isConnected || !address) {
      setError("Wallet not connected. Please connect your wallet first.")
      return
    }

    if (!basename) {
      setError("Basename not set. Please set your basename first.")
      setShowBasenameModal(true)
      return
    }

    if (questions.length !== 15) {
      setError("You must have exactly 15 questions (5 per stage)")
      return
    }

    setCreating(true)
    setError("")

    try {
      // Calculate namehash for the basename
      const basenameNode = await calculateNamehash(basename)
      if (!basenameNode) {
        throw new Error("Failed to calculate namehash for basename")
      }

      // 1. Call API to create game and get question hashes
      const gameData = await apiCreateGame({
        twitterUsername,
        basename,
        questions: questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctOption: q.correctOption,
        })),
        stakeAmount: Number.parseFloat(stakeAmount),
        playerLimit: Number.parseInt(playerLimit),
        duration: Number.parseInt(duration) * 3600, // Convert hours to seconds
      })

      console.log("Game data from API:", gameData)

      // 2. Call smart contract to create game
      // For now, we're using empty question root hashes
      const questionRootHashes = ["0x0", "0x0", "0x0"] // Replace with actual hashes from API when available
      const gameDuration = Number.parseInt(duration) * 3600 // Convert hours to seconds

      if (!walletClient) {
        throw new Error("Wallet client not found")
      }

      const tx = await web3CreateGame(walletClient, basenameNode, questionRootHashes, gameDuration)

      // 3. Set transaction hash for reference
      setTransactionHash(tx)

      // 4. Show success toast
      toast({
        title: "Game Created Successfully",
        description: "Your game has been created and is now available in the marketplace.",
        duration: 5000,
      })

      // 5. Redirect to marketplace
      router.push("/marketplace")
    } catch (err) {
      console.error("Failed to create game:", err)
      setError(err instanceof Error ? err.message : "Failed to create game. Please try again.")
      setCreating(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="twitter-username" className="block text-sm font-medium text-gray-700">
                      Twitter Username
                    </label>
                    <div className="mt-1 flex items-center">
                      <Twitter className="mr-2 h-5 w-5 text-[#1DA1F2]" />
                      <Input
                        id="twitter-username"
                        placeholder="@username"
                        value={twitterUsername}
                        onChange={(e) => setTwitterUsername(e.target.value)}
                        className="flex-1"
                        disabled={loading}
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800">How it works</h4>
                    <p className="mt-1 text-sm text-blue-700">
                      We'll analyze your recent Twitter activity to generate personalized trivia questions for your
                      game. Players will answer these questions to compete for rewards.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleTwitterSubmit}
                disabled={loading || !isConnected || !basename}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="stage-1">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="stage-1">Stage 1</TabsTrigger>
                    <TabsTrigger value="stage-2">Stage 2</TabsTrigger>
                    <TabsTrigger value="stage-3">Stage 3</TabsTrigger>
                  </TabsList>

                  {[1, 2, 3].map((stage) => (
                    <TabsContent key={stage} value={`stage-${stage}`} className="space-y-4 mt-4">
                      {questions.slice((stage - 1) * 5, stage * 5).map((question, index) => (
                        <div key={question.id} className="border rounded-md p-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Question {(stage - 1) * 5 + index + 1}
                              </label>
                              <Textarea
                                value={question.text}
                                onChange={(e) => handleQuestionEdit(question.id, "text", e.target.value)}
                                className="mt-1"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">Options</label>
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center">
                                  <div className="mr-2 flex-shrink-0">
                                    <input
                                      type="radio"
                                      checked={question.correctOption === optIndex}
                                      onChange={() => handleQuestionEdit(question.id, "correctOption", optIndex)}
                                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                    />
                                  </div>
                                  <Input
                                    value={option}
                                    onChange={(e) => handleOptionEdit(question.id, optIndex, e.target.value)}
                                    className="flex-1"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} className="flex items-center">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="stake-amount" className="block text-sm font-medium text-gray-700">
                      Stake Amount (DTAIOC tokens)
                    </label>
                    <Select value={stakeAmount} onValueChange={setStakeAmount}>
                      <SelectTrigger id="stake-amount" className="mt-1">
                        <SelectValue placeholder="Select stake amount" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 10].map((amount) => (
                          <SelectItem key={amount} value={amount.toString()}>
                            {amount} DTAIOC
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="player-limit" className="block text-sm font-medium text-gray-700">
                      Player Limit
                    </label>
                    <Select value={playerLimit} onValueChange={setPlayerLimit}>
                      <SelectTrigger id="player-limit" className="mt-1">
                        <SelectValue placeholder="Select player limit" />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 30, 40, 50].map((limit) => (
                          <SelectItem key={limit} value={limit.toString()}>
                            {limit} players
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                      Game Duration
                    </label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration" className="mt-1">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 3, 6, 12, 24].map((hours) => (
                          <SelectItem key={hours} value={hours.toString()}>
                            {hours} {hours === 1 ? "hour" : "hours"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-yellow-800">Game Rules</h4>
                    <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside space-y-1">
                      <li>Players must stake {stakeAmount} DTAIOC tokens to join</li>
                      <li>Maximum {playerLimit} players can join</li>
                      <li>
                        Game will last for {duration} {Number.parseInt(duration) === 1 ? "hour" : "hours"}
                      </li>
                      <li>Top 3 players will receive NFT rewards and token prizes</li>
                    </ul>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleCreateGame} disabled={creating} className="flex items-center">
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Game...
                  </>
                ) : (
                  <>
                    Create Game
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-8">
        <div className="flex items-center">
          <div className="flex items-center relative">
            {[1, 2, 3].map((step) => (
              <div key={step} className="relative">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    currentStep >= step ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`absolute top-5 h-0.5 w-12 -right-6 ${
                      currentStep > step ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between">
              <span className={`text-sm ${currentStep >= 1 ? "text-primary font-medium" : "text-gray-500"}`}>
                Twitter
              </span>
              <span className={`text-sm ${currentStep >= 2 ? "text-primary font-medium" : "text-gray-500"}`}>
                Questions
              </span>
              <span className={`text-sm ${currentStep >= 3 ? "text-primary font-medium" : "text-gray-500"}`}>
                Settings
              </span>
            </div>
          </div>
        </div>
      </div>

      {renderStepContent()}

      {showBasenameModal && <BasenameModal onClose={() => setShowBasenameModal(false)} />}
    </div>
  )
}
