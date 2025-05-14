"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"
import { BasenameModal } from "@/components/basename-modal"
import { Menu, X, LogOut, Trophy, Gamepad2, Home, UserPlus, Code } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { useToast } from "@/components/ui/use-toast"
import { usePathname } from "next/navigation"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showBasenameModal, setShowBasenameModal] = useState(false)
  const { isConnected, address, basename, disconnectWallet, tokenBalance } = useWeb3()
  const { toast } = useToast()
  const pathname = usePathname()

  // Check if basename is missing after connection
  useEffect(() => {
    if (isConnected && !basename) {
      setShowBasenameModal(true)
    }
  }, [isConnected, basename])

  const handleDisconnect = () => {
    disconnectWallet()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected successfully.",
      duration: 3000,
    })
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-game-dark-accent border-b border-game-dark-border backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary font-bold text-xl">
                DTriviaAIOnChain
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive("/")
                    ? "bg-gradient-to-r from-game-primary/20 to-game-secondary/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-game-dark-lighter"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </div>
              </Link>
              <Link
                href="/marketplace"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive("/marketplace")
                    ? "bg-gradient-to-r from-game-primary/20 to-game-secondary/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-game-dark-lighter"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Gamepad2 className="h-4 w-4" />
                  <span>Games</span>
                </div>
              </Link>
              <Link
                href="/create-game"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive("/create-game")
                    ? "bg-gradient-to-r from-game-primary/20 to-game-secondary/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-game-dark-lighter"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Gamepad2 className="h-4 w-4" />
                  <span>Create</span>
                </div>
              </Link>
              <Link
                href="/leaderboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive("/leaderboard")
                    ? "bg-gradient-to-r from-game-primary/20 to-game-secondary/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-game-dark-lighter"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>Leaderboard</span>
                </div>
              </Link>
              <Link
                href="/tools"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive("/tools")
                    ? "bg-gradient-to-r from-game-primary/20 to-game-secondary/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-game-dark-lighter"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Code className="h-4 w-4" />
                  <span>Developer Tools</span>
                </div>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            {!isConnected ? (
              <div className="animate-pulse">
                <WalletConnect buttonText="Connect Wallet" buttonVariant="default" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {tokenBalance && (
                  <div className="px-3 py-1 bg-game-dark-lighter rounded-md border border-game-dark-border">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-game-primary to-game-secondary flex items-center justify-center">
                        <span className="text-xs font-bold">$</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {Number.parseFloat(tokenBalance).toFixed(2)} DTAIOC
                      </span>
                    </div>
                  </div>
                )}
                <div className="px-3 py-1 bg-game-dark-lighter rounded-md border border-game-dark-border flex items-center">
                  <span className="text-sm text-white truncate max-w-[150px]">
                    {basename || (address && address.substring(0, 6) + "..." + address.substring(address.length - 4))}
                  </span>
                  {!basename && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBasenameModal(true)}
                      className="ml-1 p-0 h-6 w-6"
                      title="Set Basename"
                    >
                      <UserPlus className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="border-game-dark-border bg-game-dark-lighter hover:bg-game-dark-accent text-white"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-game-dark-lighter focus:outline-none focus:ring-2 focus:ring-inset focus:ring-game-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-game-dark-accent border-t border-game-dark-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/")
                  ? "bg-gradient-to-r from-game-primary/20 to-game-secondary/20 text-white"
                  : "text-gray-300 hover:text-white hover:bg-game-dark-lighter"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </div>
            </Link>
            <Link
              href="/marketplace"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/marketplace")
                  ? "bg-gradient-to-r from-game-primary/20 to-game-secondary/20 text-white"
                  : "text-gray-300 hover:text-white hover:bg-game-dark-lighter"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Gamepad2 className="h-5 w-5" />
                <span>Games</span>
              </div>
            </Link>
            <Link
              href="/create-game"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/create-game")
                  ? "bg-gradient-to-r from-game-primary/20 to-game-secondary/20 text-white"
                  : "text-gray-300 hover:text-white hover:bg-game-dark-lighter"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Gamepad2 className="h-5 w-5" />
                <span>Create Game</span>
              </div>
            </Link>
            <Link
              href="/leaderboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/leaderboard")
                  ? "bg-gradient-to-r from-game-primary/20 to-game-secondary/20 text-white"
                  : "text-gray-300 hover:text-white hover:bg-game-dark-lighter"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Leaderboard</span>
              </div>
            </Link>
            <Link
              href="/tools"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/tools")
                  ? "bg-gradient-to-r from-game-primary/20 to-game-secondary/20 text-white"
                  : "text-gray-300 hover:text-white hover:bg-game-dark-lighter"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Developer Tools</span>
              </div>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-game-dark-border">
            <div className="px-2 space-y-1">
              {!isConnected ? (
                <div className="px-3 py-2 animate-pulse">
                  <WalletConnect fullWidth={true} />
                </div>
              ) : (
                <div className="px-3 py-2 flex flex-col space-y-2">
                  {tokenBalance && (
                    <div className="px-3 py-2 bg-game-dark-lighter rounded-md border border-game-dark-border flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-game-primary to-game-secondary flex items-center justify-center">
                        <span className="text-xs font-bold">$</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {Number.parseFloat(tokenBalance).toFixed(2)} DTAIOC
                      </span>
                    </div>
                  )}
                  <div className="px-3 py-2 bg-game-dark-lighter rounded-md border border-game-dark-border flex items-center justify-center">
                    <span className="text-sm text-white truncate">
                      {basename || (address && address.substring(0, 6) + "..." + address.substring(address.length - 4))}
                    </span>
                    {!basename && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBasenameModal(true)}
                        className="ml-1 p-0 h-6 w-6"
                        title="Set Basename"
                      >
                        <UserPlus className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="w-full border-game-dark-border bg-game-dark-lighter hover:bg-game-dark-accent text-white"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showBasenameModal && <BasenameModal onClose={() => setShowBasenameModal(false)} />}
    </nav>
  )
}
