"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useWeb3 } from "@/contexts/web3-context"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { WalletPrompt } from "@/components/wallet-prompt"

export function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected, connectWallet, isConnecting } = useWeb3()
  const router = useRouter()
  const pathname = usePathname()
  const [showPrompt, setShowPrompt] = useState(false)

  // Public routes that don't require wallet connection
  const publicRoutes = ["/", "/about", "/faq"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // Update the useEffect to show the prompt when navigating to protected routes
  useEffect(() => {
    // If not connected and not on a public route, show prompt and redirect to home
    if (!isConnected && !isPublicRoute) {
      setShowPrompt(true)
      router.push("/")
    }
  }, [isConnected, isPublicRoute, router])

  // Also update the ProtectedWrapper to show the prompt more aggressively
  const ProtectedWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isConnected) {
      return <>{children}</>
    }

    return (
      <div
        onClick={(e) => {
          // Always show the prompt for non-connected users
          e.preventDefault()
          e.stopPropagation()
          setShowPrompt(true)
        }}
      >
        {children}
      </div>
    )
  }

  const handleConnect = async () => {
    try {
      await connectWallet("Base")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  // If on a public route, show the content regardless of connection status
  if (isPublicRoute) {
    return (
      <>
        <ProtectedWrapper>{children}</ProtectedWrapper>
        <WalletPrompt isOpen={showPrompt} onClose={() => setShowPrompt(false)} />
      </>
    )
  }

  // If not connected and not on a public route, show connection screen
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-game-dark p-4">
        <div className="max-w-md w-full bg-game-dark-card border border-game-dark-border rounded-lg shadow-game-card p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">Connect Your Wallet</h1>
          <p className="text-gray-300 mb-8">
            Please connect your wallet to access DTriviaAIOnChain. You need to be connected to interact with the
            application.
          </p>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-game-primary to-game-secondary rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-game-primary to-game-secondary hover:shadow-neon text-white relative"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {isConnecting ? "Connecting..." : "Connect Smart Wallet"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If connected, show the content
  return <>{children}</>
}
