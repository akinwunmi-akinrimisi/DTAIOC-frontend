"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { registerBasename } from "@/utils/base-smart-wallet"
import { BaseLogo } from "@/components/base-logo"

interface BaseWalletConnectProps {
  buttonText?: string
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  fullWidth?: boolean
}

export function BaseWalletConnect({
  buttonText = "Connect Base Smart Wallet",
  buttonVariant = "default",
  buttonSize = "default",
  fullWidth = false,
}: BaseWalletConnectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const { connectWallet, isConnecting, isConnected, address, setBasename } = useWeb3()

  // Close dialog if connected
  if (isConnected && isOpen) {
    setIsOpen(false)
  }

  const handleConnect = async () => {
    try {
      await connectWallet("Base")
    } catch (error) {
      console.error("Failed to connect Base Smart Wallet:", error)
      setError(error instanceof Error ? error.message : "Failed to connect Base Smart Wallet")
    }
  }

  const handleRegisterBasename = async () => {
    if (!username) {
      setError("Please enter a username")
      return
    }

    if (!address) {
      setError("Please connect your wallet first")
      return
    }

    setIsRegistering(true)
    setError(null)

    try {
      const result = await registerBasename(address, username)
      if (result.success) {
        setBasename(result.basename)
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Failed to register basename:", error)
      setError(error instanceof Error ? error.message : "Failed to register basename")
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={`${fullWidth ? "w-full" : ""} bg-gradient-to-r from-[#0052FF] to-[#5299FF] hover:from-[#0052FF] hover:to-[#5299FF] hover:opacity-90`}
        >
          <BaseLogo className="mr-2 h-4 w-4" /> {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Base Smart Wallet</DialogTitle>
          <DialogDescription>
            Base Smart Wallets make it easy to get onchain without managing private keys or paying gas fees directly.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800">Benefits of Base Smart Wallets</h4>
            <ul className="mt-1 text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>No need to manage private keys</li>
              <li>Gasless transactions (sponsored by the app)</li>
              <li>Batch multiple transactions together</li>
              <li>Enhanced security features</li>
            </ul>
          </div>

          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-[#0052FF] to-[#5299FF] hover:from-[#0052FF] hover:to-[#5299FF] hover:opacity-90"
            >
              {isConnecting ? "Connecting..." : "Connect Base Smart Wallet"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Choose a Username for your Basename
                </label>
                <div className="mt-1">
                  <Input
                    id="username"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1"
                  />
                  <p className="mt-1 text-sm text-gray-500">Your basename will be {username || "username"}.base.eth</p>
                </div>
              </div>

              <Button
                onClick={handleRegisterBasename}
                disabled={isRegistering || !username}
                className="w-full bg-gradient-to-r from-[#0052FF] to-[#5299FF] hover:from-[#0052FF] hover:to-[#5299FF] hover:opacity-90"
              >
                {isRegistering ? "Registering..." : "Register Basename"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
