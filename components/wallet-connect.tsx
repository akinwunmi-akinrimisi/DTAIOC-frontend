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
import { Wallet, ShieldCheck, AlertCircle } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BaseLogo } from "@/components/base-logo"

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

  const handleConnect = async (type: "MetaMask" | "Safe" | "WalletConnect" | "Coinbase" | "Base") => {
    try {
      await connectWallet(type)
    } catch (error) {
      console.error(`Failed to connect with ${type}:`, error)
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
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to connect to DTriviaAIOnChain</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <Button
            onClick={() => handleConnect("Base")}
            disabled={isConnecting}
            className="flex items-center justify-center bg-gradient-to-r from-[#0052FF] to-[#5299FF] hover:from-[#0052FF] hover:to-[#5299FF] hover:opacity-90"
          >
            <BaseLogo className="mr-2 h-6 w-6" />
            {isConnecting ? "Connecting..." : "Base Smart Wallet (Recommended)"}
          </Button>

          <Button
            onClick={() => handleConnect("MetaMask")}
            disabled={isConnecting}
            className="flex items-center justify-center"
          >
            <img src="/placeholder.svg?height=24&width=24" alt="MetaMask" className="mr-2 h-6 w-6" />
            {isConnecting ? "Connecting..." : "MetaMask"}
          </Button>

          <Button
            onClick={() => handleConnect("Safe")}
            disabled={isConnecting}
            variant="outline"
            className="flex items-center justify-center"
          >
            <ShieldCheck className="mr-2 h-5 w-5" />
            {isConnecting ? "Connecting..." : "Safe Wallet"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Coming Soon</span>
            </div>
          </div>

          <Button disabled={true} variant="outline" className="flex items-center justify-center opacity-60">
            <img src="/placeholder.svg?height=24&width=24" alt="WalletConnect" className="mr-2 h-6 w-6" />
            WalletConnect (Coming Soon)
          </Button>
          <Button disabled={true} variant="outline" className="flex items-center justify-center opacity-60">
            <img src="/placeholder.svg?height=24&width=24" alt="Coinbase" className="mr-2 h-6 w-6" />
            Coinbase Wallet (Coming Soon)
          </Button>

          <div className="text-center text-sm text-gray-500 mt-2">
            New to Web3?{" "}
            <a
              href="https://docs.base.org/tools/smart-wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Learn about Smart Wallets
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
