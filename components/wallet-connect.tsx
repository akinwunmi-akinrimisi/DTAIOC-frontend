"use client"

import { useState } from "react"
import { useWeb3 } from "../contexts/web3-context"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function WalletConnect() {
  const { address, isConnected, isConnecting, tokenBalance, connectWallet, disconnectWallet, error } = useWeb3()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (err) {
      console.error("Failed to connect wallet:", err)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await disconnectWallet()
    } catch (err) {
      console.error("Failed to disconnect wallet:", err)
    } finally {
      setIsDisconnecting(false)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      {isConnected && address ? (
        <>
          <div className="text-sm font-medium mr-2">
            <span className="text-gray-500">Balance:</span> {tokenBalance} DTAIOC
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{formatAddress(address)}</div>
            <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isDisconnecting}>
              {isDisconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting
                </>
              ) : (
                "Disconnect"
              )}
            </Button>
          </div>
        </>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      )}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  )
}
