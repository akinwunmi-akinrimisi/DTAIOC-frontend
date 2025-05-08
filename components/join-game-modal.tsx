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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWeb3 } from "@/contexts/web3-context"
import { joinGame as apiJoinGame } from "@/utils/api"
import { joinGame as web3JoinGame, mintTokens, hasSufficientBalance } from "@/utils/web3"

interface Game {
  id: string
  creatorBasename: string
  stakeAmount: number
  playerCount: number
  playerLimit: number
  duration: number
  createdAt: Date
  endsAt: Date
}

interface JoinGameModalProps {
  game: Game
  onClose: () => void
}

export function JoinGameModal({ game, onClose }: JoinGameModalProps) {
  const router = useRouter()
  const { address, basename, refreshBalance, tokenBalance } = useWeb3()
  const [joining, setJoining] = useState(false)
  const [minting, setMinting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [needsTokens, setNeedsTokens] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")

  // Check if user has enough tokens
  useEffect(() => {
    const checkBalance = async () => {
      if (address && tokenBalance) {
        const hasBalance = Number.parseFloat(tokenBalance) >= game.stakeAmount
        setNeedsTokens(!hasBalance)
      }
    }

    checkBalance()
  }, [address, tokenBalance, game.stakeAmount])

  const handleJoin = async () => {
    if (!address || !basename) {
      setError("Wallet not connected or basename not set")
      return
    }

    setJoining(true)
    setError("")

    try {
      // 1. Get signature from backend
      const { signature } = await apiJoinGame(game.id, { address, basename })

      // 2. Join game via smart contract
      const tx = await web3JoinGame(address, game.id, basename, signature)

      // 3. Set transaction hash for reference
      setTransactionHash(tx.transactionHash)

      // 4. Update token balance
      await refreshBalance()

      // 5. Show success message
      setSuccess(true)

      // 6. Redirect to game page after success
      setTimeout(() => {
        router.push(`/game/${game.id}`)
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Failed to join game:", err)
      setError(err instanceof Error ? err.message : "Failed to join game. Please try again.")
      setJoining(false)
    }
  }

  const handleMintTokens = async () => {
    if (!address) {
      setError("Wallet not connected")
      return
    }

    setMinting(true)
    setError("")

    try {
      // Mint 10 tokens (or the amount needed for the game)
      const mintAmount = Math.max(10, game.stakeAmount + 1)
      const tx = await mintTokens(address, mintAmount)

      // Update token balance
      await refreshBalance()

      // Check if we now have enough tokens
      const hasEnough = await hasSufficientBalance(address, game.stakeAmount)
      setNeedsTokens(!hasEnough)

      setMinting(false)
    } catch (err) {
      console.error("Failed to mint tokens:", err)
      setError(err instanceof Error ? err.message : "Failed to mint tokens. Please try again.")
      setMinting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Game</DialogTitle>
          <DialogDescription>You are about to join a trivia game created by {game.creatorBasename}</DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Successfully joined the game! Redirecting to game page...
            </AlertDescription>
          </Alert>
        ) : (
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="font-medium text-gray-900">Game Details</h4>
              <div className="mt-2 space-y-2 text-sm">
                <p className="text-gray-600">Creator: {game.creatorBasename}</p>
                <p className="text-gray-600">Stake Amount: {game.stakeAmount} DTAIOC</p>
                <p className="text-gray-600">
                  Players: {game.playerCount}/{game.playerLimit}
                </p>
                <p className="text-gray-600">Duration: {game.duration} hours</p>
              </div>
            </div>

            {needsTokens ? (
              <div className="space-y-4">
                <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    You don't have enough DTAIOC tokens to join this game. You need to mint tokens first.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleMintTokens} disabled={minting} className="w-full">
                  {minting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Coins className="mr-2 h-4 w-4" />
                      Mint DTAIOC Tokens
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <span className="text-blue-800 font-medium">Stake Amount:</span>
                  <span className="text-blue-800 font-medium">{game.stakeAmount} DTAIOC</span>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={joining || minting}>
            Cancel
          </Button>
          {!needsTokens && !success && (
            <Button onClick={handleJoin} disabled={joining}>
              {joining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Confirm & Join"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
