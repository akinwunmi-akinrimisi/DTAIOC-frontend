"use client"

import { useState } from "react"
import { useWeb3 } from "@/contexts/web3-context"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WalletPromptProps {
  message?: string
  onClose?: () => void
  onConnect?: () => void
}

export function WalletPrompt({ message, onClose, onConnect }: WalletPromptProps) {
  const { connectWallet, isConnecting, error } = useWeb3()
  const [localError, setLocalError] = useState<string | null>(null)

  const handleConnect = async () => {
    setLocalError(null)
    try {
      await connectWallet()
      if (onConnect) {
        onConnect()
      }
      if (onClose) {
        onClose()
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err)
      setLocalError(err instanceof Error ? err.message : "Failed to connect wallet")
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose ? () => onClose() : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>{message || "You need to connect your wallet to access this feature."}</DialogDescription>
        </DialogHeader>

        {(error || localError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || localError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-4 py-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800">Why connect a wallet?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Connecting your wallet allows you to participate in games, earn tokens, and track your progress on the
              blockchain.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col space-y-2">
          <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
