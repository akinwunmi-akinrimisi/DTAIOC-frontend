"use client"

import { useState } from "react"
import { useWeb3 } from "@/contexts/web3-context"
import { Button } from "@/components/ui/button"
import { Wallet, X, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface WalletPromptProps {
  message?: string
  onClose?: () => void
}

export function WalletPrompt({ message, onClose }: WalletPromptProps) {
  const { connectWallet, isConnecting } = useWeb3()
  const [isOpen, setIsOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setError(null)
      await connectWallet()
      handleClose()
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open && onClose) onClose()
      }}
    >
      <DialogContent className="bg-game-dark-card border-game-dark-border text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-gray-300">
            {message || "Please connect your wallet to access this feature."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-game-primary to-game-secondary rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-game-primary to-game-secondary hover:shadow-neon text-white relative"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <Button variant="ghost" className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={handleClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
