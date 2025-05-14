"use client"

import { useState } from "react"
import { useWeb3 } from "../contexts/web3-context"
import { isPerfectScore, getGameData, getPlayerData } from "../utils/web3"
import { depositToEntryPoint, getEntryPointDeposit } from "../utils/web3-mock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ContractTester() {
  const { address, walletClient, isConnected } = useWeb3()
  const [gameId, setGameId] = useState("")
  const [playerAddress, setPlayerAddress] = useState("")
  const [stage, setStage] = useState("1")
  const [depositAmount, setDepositAmount] = useState("0.01")
  const [depositAccount, setDepositAccount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckPerfectScore = async () => {
    if (!gameId || !playerAddress) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const isPerfect = await isPerfectScore(gameId, playerAddress, Number.parseInt(stage))
      setResult({ isPerfectScore: isPerfect })
    } catch (err: any) {
      setError(err.message || "Failed to check perfect score")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetGameData = async () => {
    if (!gameId) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const gameData = await getGameData(gameId)
      setResult({ gameData })
    } catch (err: any) {
      setError(err.message || "Failed to get game data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetPlayerData = async () => {
    if (!gameId || !playerAddress) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const playerData = await getPlayerData(gameId, playerAddress)
      setResult({ playerData })
    } catch (err: any) {
      setError(err.message || "Failed to get player data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!walletClient || !depositAccount || !depositAmount) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const hash = await depositToEntryPoint(walletClient, depositAccount, Number.parseFloat(depositAmount))
      setResult({ transactionHash: hash })

      // Get updated deposit
      const deposit = await getEntryPointDeposit(depositAccount)
      setResult((prev: any) => ({ ...prev, deposit }))
    } catch (err: any) {
      setError(err.message || "Failed to deposit")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetDeposit = async () => {
    if (!depositAccount) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const deposit = await getEntryPointDeposit(depositAccount)
      setResult({ deposit })
    } catch (err: any) {
      setError(err.message || "Failed to get deposit")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contract Tester</CardTitle>
          <CardDescription>Test contract interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please connect your wallet to test contract interactions.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Tester</CardTitle>
        <CardDescription>Test contract interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="game">
          <TabsList className="mb-4">
            <TabsTrigger value="game">Game</TabsTrigger>
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="entrypoint">EntryPoint</TabsTrigger>
          </TabsList>

          <TabsContent value="game">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Game ID</label>
                <Input
                  placeholder="Enter game ID"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button onClick={handleGetGameData} disabled={isLoading || !gameId}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Get Game Data"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="player">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Game ID</label>
                <Input
                  placeholder="Enter game ID"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Player Address</label>
                <Input
                  placeholder="Enter player address"
                  value={playerAddress}
                  onChange={(e) => setPlayerAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Stage</label>
                <Input
                  placeholder="Enter stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="mt-1"
                  type="number"
                  min="1"
                  max="3"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleGetPlayerData} disabled={isLoading || !gameId || !playerAddress}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Get Player Data"
                  )}
                </Button>

                <Button
                  onClick={handleCheckPerfectScore}
                  disabled={isLoading || !gameId || !playerAddress}
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check Perfect Score"
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="entrypoint">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Account Address</label>
                <Input
                  placeholder="Enter account address"
                  value={depositAccount}
                  onChange={(e) => setDepositAccount(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Deposit Amount (ETH)</label>
                <Input
                  placeholder="Enter deposit amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="mt-1"
                  type="number"
                  step="0.001"
                  min="0"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleDeposit} disabled={isLoading || !depositAccount || !depositAmount}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Depositing...
                    </>
                  ) : (
                    "Deposit"
                  )}
                </Button>

                <Button onClick={handleGetDeposit} disabled={isLoading || !depositAccount} variant="outline">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Get Deposit"
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Result</h3>
            <pre className="p-2 bg-gray-100 rounded-md overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
