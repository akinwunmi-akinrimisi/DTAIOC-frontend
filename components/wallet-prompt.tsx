"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"

interface WalletPromptProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletPrompt({ isOpen, onClose }: WalletPromptProps) {
  const { isConnected, connectWallet, isConnecting } = useWeb3()

  // Close the prompt if the user connects their wallet
  useEffect(() => {
    if (isConnected) {
      onClose()
    }
  }, [isConnected, onClose])

  const handleConnect = async () => {
    try {
      await connectWallet("MetaMask")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  return (
    <Dialog open={isOpen && !isConnected} onOpenChange={onClose}>
      <DialogContent className="bg-game-dark-card border border-game-primary/50 shadow-lg shadow-game-primary/20">
        <DialogHeader>
          <DialogTitle className="text-gray-200 text-xl">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-gray-300">
            You need to connect your wallet to access this feature.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-4">
          <div className="absolute inset-0 bg-gradient-to-r from-game-primary to-game-secondary rounded-lg blur-md opacity-30"></div>
          <div className="relative bg-game-dark-lighter border border-game-dark-border rounded-lg p-6">
            <p className="text-gray-200 mb-4">Connecting your wallet allows you to:</p>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-game-primary/20 flex items-center justify-center mr-2">
                  <span className="text-game-primary text-xs">✓</span>
                </div>
                <span>Join and create trivia games</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-game-primary/20 flex items-center justify-center mr-2">
                  <span className="text-game-primary text-xs">✓</span>
                </div>
                <span>Stake tokens and earn rewards</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-game-primary/20 flex items-center justify-center mr-2">
                  <span className="text-game-primary text-xs">✓</span>
                </div>
                <span>Win exclusive NFTs</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-game-primary/20 flex items-center justify-center mr-2">
                  <span className="text-game-primary text-xs">✓</span>
                </div>
                <span>Track your progress on leaderboards</span>
              </li>
            </ul>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-game-primary to-game-secondary rounded-lg blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-game-primary to-game-secondary hover:shadow-neon text-white relative"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
