"use client"

import { useState } from "react"
import { useWeb3 } from "../contexts/web3-context"
import { setBasenameForAddress, getBasenameForAddress, calculateNamehash } from "../utils/web3"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BasenameManager() {
  const { address, walletClient, isConnected } = useWeb3()
  const [basename, setBasename] = useState("")
  const [currentBasename, setCurrentBasename] = useState<string | null>(null)
  const [namehash, setNamehash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSetBasename = async () => {
    if (!address || !walletClient || !basename) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const hash = await setBasenameForAddress(walletClient, address, basename)
      setSuccess(`Basename set successfully! Transaction hash: ${hash}`)
      setCurrentBasename(basename)

      // Calculate namehash
      const calculatedNamehash = await calculateNamehash(basename)
      setNamehash(calculatedNamehash)
    } catch (err: any) {
      setError(err.message || "Failed to set basename")
    } finally {
      setIsLoading(false)
    }
  }

  const checkCurrentBasename = async () => {
    if (!address) return

    setIsChecking(true)
    setError(null)

    try {
      const basename = await getBasenameForAddress(address)
      setCurrentBasename(basename)

      if (basename) {
        // Calculate namehash
        const calculatedNamehash = await calculateNamehash(basename)
        setNamehash(calculatedNamehash)
      }
    } catch (err: any) {
      setError(err.message || "Failed to check current basename")
    } finally {
      setIsChecking(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Basename Manager</CardTitle>
          <CardDescription>Manage your basename for the DTriviaAIOnChain game</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please connect your wallet to manage your basename.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basename Manager</CardTitle>
        <CardDescription>Manage your basename for the DTriviaAIOnChain game</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Current Basename</h3>
            <Button variant="outline" size="sm" onClick={checkCurrentBasename} disabled={isChecking}>
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check"
              )}
            </Button>
          </div>
          <div className="p-2 bg-gray-100 rounded-md">
            {currentBasename ? (
              <div>
                <p className="font-mono">{currentBasename}</p>
                {namehash && <p className="text-xs text-gray-500 mt-1">Namehash: {namehash}</p>}
              </div>
            ) : (
              <p className="text-gray-500">No basename set</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Set New Basename</h3>
          <div className="flex space-x-2">
            <Input placeholder="Enter your basename" value={basename} onChange={(e) => setBasename(e.target.value)} />
            <Button onClick={handleSetBasename} disabled={isLoading || !basename}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting...
                </>
              ) : (
                "Set"
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your basename will be used to identify you in games and on leaderboards.
          </p>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        <p>
          Basenames are stored on-chain and are publicly visible. Choose a basename that you want to be identified by.
        </p>
      </CardFooter>
    </Card>
  )
}
