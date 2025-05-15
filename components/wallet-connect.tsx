"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "../contexts/web3-context"
import { Button } from "@/components/ui/button"
import { Loader2, User, AlertCircle } from "lucide-react"
import { BasenameModal } from "./basename-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function WalletConnect() {
  const { address, basename, isConnected, isConnecting, tokenBalance, connectWallet, disconnectWallet, error } =
    useWeb3()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [showBasenameModal, setShowBasenameModal] = useState(false)
  const [showBasenameAlert, setShowBasenameAlert] = useState(false)

  // Check if user has a basename after connecting
  useEffect(() => {
    if (isConnected && address && !basename) {
      setShowBasenameAlert(true)
    } else {
      setShowBasenameAlert(false)
    }
  }, [isConnected, address, basename])

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

  const handleSetupBasename = () => {
    setShowBasenameModal(true)
    setShowBasenameAlert(false)
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
            {basename ? (
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                <User className="h-3 w-3 mr-1" />
                {basename}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetupBasename}
                className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
              >
                Set Basename
              </Button>
            )}
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

      {showBasenameAlert && (
        <Alert variant="warning" className="mt-2 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-800" />
          <AlertDescription className="text-yellow-800">
            Set up a Basename to fully use the app's features.{" "}
            <button onClick={handleSetupBasename} className="underline font-medium hover:text-yellow-900">
              Set up now
            </button>
          </AlertDescription>
        </Alert>
      )}

      {showBasenameModal && (
        <BasenameModal
          onClose={() => {
            console.log("Closing basename modal from WalletConnect")
            setShowBasenameModal(false)
          }}
        />
      )}
    </div>
  )
}
