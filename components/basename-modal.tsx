"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Twitter, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/contexts/web3-context"
import { linkBasename } from "@/utils/api"

interface BasenameModalProps {
  onClose: () => void
}

export function BasenameModal({ onClose }: BasenameModalProps) {
  const { address, setBasename } = useWeb3()
  const [twitterUsername, setTwitterUsername] = useState("")
  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!twitterUsername) {
      setError("Please enter your Twitter username")
      return
    }

    if (!address) {
      setError("Wallet not connected. Please connect your wallet first.")
      return
    }

    setIsLinking(true)
    setError("")

    try {
      // Clean up Twitter username (remove @ if present)
      const cleanUsername = twitterUsername.startsWith("@") ? twitterUsername.substring(1) : twitterUsername

      // Call API to link basename
      const response = await linkBasename({
        address,
        twitterUsername: cleanUsername,
      })

      // Update basename in context
      if (response.basename) {
        setBasename(response.basename)
      }

      setSuccess(true)

      // Close modal after showing success message
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Failed to link basename:", err)
      setError(err instanceof Error ? err.message : "Failed to link basename. Please try again.")
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Your Basename</DialogTitle>
          <DialogDescription>
            Link your Twitter username to a Basename for a better experience. Your Basename will be used to identify you
            on leaderboards and in games.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Basename successfully linked! You're all set to play.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="twitter-username" className="text-sm font-medium">
                  Twitter Username
                </label>
                <div className="flex items-center">
                  <Twitter className="mr-2 h-5 w-5 text-[#1DA1F2]" />
                  <Input
                    id="twitter-username"
                    placeholder="@username"
                    value={twitterUsername}
                    onChange={(e) => setTwitterUsername(e.target.value)}
                    className="flex-1"
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800">What is a Basename?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  A Basename is a human-readable identifier (like username.base.eth) that replaces your complex wallet
                  address, making it easier to identify you in games and leaderboards.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Basenames are part of Base's naming system and work across the Base ecosystem, making your identity
                  portable across different applications.
                </p>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-medium">Benefits of Basenames:</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-1 list-disc list-inside">
                  <li>Easy to remember and share</li>
                  <li>Works across all Base applications</li>
                  <li>Makes your wallet address human-readable</li>
                  <li>Improves your experience in DTriviaAIOnChain</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Skip for Now
              </Button>
              <Button type="submit" disabled={isLinking}>
                {isLinking ? "Linking..." : "Link Basename"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
