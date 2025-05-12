"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface WalletConnectProps {
  buttonText?: string
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  fullWidth?: boolean
}

export function WalletConnect({
  buttonText = "Connect Wallet",
  buttonVariant = "default",
  buttonSize = "default",
  fullWidth = false,
}: WalletConnectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { connectWallet, isConnecting, error, isConnected } = useWeb3()

  // Close dialog if connected
  useEffect(() => {
    if (isConnected) {
      setIsOpen(false)
    }
  }, [isConnected])

  const handleConnect = async () => {
    try {
      await connectWallet("Base")
      setIsOpen(false)
    } catch (error) {
      console.error(`Failed to connect with Base Smart Wallet:`, error)
      // Error handling is done in the context
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={fullWidth ? "w-full" : ""}>
          <Wallet className="mr-2 h-4 w-4" /> {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Smart Wallet</DialogTitle>
          <DialogDescription>Connect your Base Smart Wallet to DTriviaAIOnChain</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center justify-center bg-gradient-to-r from-game-primary to-game-secondary"
          >
            <img src="/placeholder.svg?height=24&width=24" alt="Base" className="mr-2 h-6 w-6" />
            {isConnecting ? "Connecting..." : "Base Smart Wallet"}
          </Button>

          <div className="text-center text-sm text-gray-500 mt-2">
            <p>Base Smart Wallet provides a seamless Web3 experience with improved security and usability.</p>
            <a
              href="https://docs.base.org/tools/smart-wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Learn more about Smart Wallets
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
