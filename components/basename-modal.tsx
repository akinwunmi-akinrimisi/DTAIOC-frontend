"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Twitter, AlertCircle, ExternalLink, ArrowRight, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/contexts/web3-context"
import { linkBasename, createBasename } from "@/utils/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { setBasenameForAddress } from "@/utils/web3"

interface BasenameModalProps {
  onClose: () => void
}

export function BasenameModal({ onClose }: BasenameModalProps) {
  const { address, walletClient, refreshBalance, setBasename: setContextBasename } = useWeb3()
  const [twitterUsername, setTwitterUsername] = useState("")
  const [desiredBasename, setDesiredBasename] = useState("")
  const [isLinking, setIsLinking] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"link" | "create">("link")

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!twitterUsername) {
      setError("Please enter your Twitter username")
      return
    }

    if (!address) {
      setError("Wallet not connected. Please connect your wallet first.")
      return
    }

    setIsLinking(true)
    setError("")

    try {
      // Clean up Twitter username (remove @ if present)
      const cleanUsername = twitterUsername.startsWith("@") ? twitterUsername.substring(1) : twitterUsername

      // Call API to link basename
      const response = await linkBasename({
        address,
        twitterUsername: cleanUsername,
      })

      if (response && response.basename) {
        // Update basename in context
        setContextBasename(response.basename)

        // If we have a wallet client, also set it on-chain
        if (walletClient) {
          try {
            await setBasenameForAddress(walletClient, address, response.basename)
          } catch (err) {
            console.error("Failed to set basename on-chain:", err)
            // Continue anyway as we've set it in our context
          }
        }
      }

      setSuccess(true)

      // Refresh balance to update UI
      if (refreshBalance) {
        await refreshBalance()
      }

      // Close modal after showing success message
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Failed to link basename:", err)
      setError(err instanceof Error ? err.message : "Failed to link basename. Please try again.")
    } finally {
      setIsLinking(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!desiredBasename) {
      setError("Please enter your desired basename")
      return
    }

    if (!address) {
      setError("Wallet not connected. Please connect your wallet first.")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      // Call API to create basename
      const response = await createBasename({
        address,
        basename: desiredBasename,
      })

      if (response && response.basename) {
        // Update basename in context
        setContextBasename(response.basename)

        // If we have a wallet client, also set it on-chain
        if (walletClient) {
          try {
            await setBasenameForAddress(walletClient, address, response.basename)
          } catch (err) {
            console.error("Failed to set basename on-chain:", err)
            // Continue anyway as we've set it in our context
          }
        }
      }

      setSuccess(true)

      // Refresh balance to update UI
      if (refreshBalance) {
        await refreshBalance()
      }

      // Close modal after showing success message
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Failed to create basename:", err)
      setError(err instanceof Error ? err.message : "Failed to create basename. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenBaseRegistrar = () => {
    window.open("https://www.basename.app", "_blank")
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Up Your Basename</DialogTitle>
          <DialogDescription>
            A Basename is your identity on Base. You can link an existing one or create a new one.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-800" />
            <AlertDescription className="text-green-800">
              Basename successfully set! You're all set to play.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "link" | "create")}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="link">Link Existing</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>

            <TabsContent value="link">
              <form onSubmit={handleLinkSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="twitter-username" className="text-sm font-medium">
                      Twitter Username
                    </label>
                    <div className="flex items-center">
                      <Twitter className="mr-2 h-5 w-5 text-[#1DA1F2]" />
                      <Input
                        id="twitter-username"
                        placeholder="@username"
                        value={twitterUsername}
                        onChange={(e) => setTwitterUsername(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    {error && activeTab === "link" && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex flex-col space-y-2">
                  <Button type="submit" disabled={isLinking} className="w-full">
                    {isLinking ? "Linking..." : "Link Basename"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setError("")
                      onClose()
                    }}
                    className="w-full"
                  >
                    Skip for Now
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="create">
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="desired-basename" className="text-sm font-medium">
                    Desired Basename
                  </label>
                  <div className="flex items-center">
                    <Input
                      id="desired-basename"
                      placeholder="yourname"
                      value={desiredBasename}
                      onChange={(e) => setDesiredBasename(e.target.value)}
                      className="flex-1"
                    />
                    <span className="ml-2 text-gray-500">.base.eth</span>
                  </div>
                  {error && activeTab === "create" && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" /> Register on Basename.app
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    For the best experience, we recommend registering your basename through the official Basename.app
                    service.
                  </p>
                  <Button
                    onClick={handleOpenBaseRegistrar}
                    variant="outline"
                    className="mt-2 w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Go to Basename.app <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex flex-col space-y-2">
                <Button type="button" onClick={handleCreateSubmit} disabled={isCreating} className="w-full">
                  {isCreating ? "Creating..." : "Create Basename"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setError("")
                    onClose()
                  }}
                  className="w-full"
                >
                  Skip for Now
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-3 bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium">Benefits of Basenames:</h4>
          <ul className="text-sm text-gray-600 mt-1 space-y-1 list-disc list-inside">
            <li>Easy to remember and share</li>
            <li>Works across all Base applications</li>
            <li>Makes your wallet address human-readable</li>
            <li>Improves your experience in DTriviaAIOnChain</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
