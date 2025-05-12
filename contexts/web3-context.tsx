"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { initWeb3 } from "@/utils/web3"

interface Web3ContextType {
  address: string | null
  basename: string | null
  walletType: "MetaMask" | "Safe" | "WalletConnect" | "Coinbase" | "Base" | null
  isConnected: boolean
  isConnecting: boolean
  tokenBalance: string | null
  error: string | null
  connectWallet: (type: "MetaMask" | "Safe" | "WalletConnect" | "Coinbase" | "Base") => Promise<void>
  disconnectWallet: () => void
  setBasename: (basename: string) => void
  refreshBalance: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [basename, setBasenameState] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<"MetaMask" | "Safe" | "WalletConnect" | "Coinbase" | "Base" | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedWalletData = localStorage.getItem("walletData")
    if (storedWalletData) {
      try {
        const { address, basename, walletType } = JSON.parse(storedWalletData)
        setAddress(address)
        setBasenameState(basename)
        setWalletType(walletType)
        setIsConnected(true)

        // Initialize Web3 and fetch balance
        if (window.ethereum) {
          initWeb3(window.ethereum).then(() => {
            refreshBalance()
          })
        }
      } catch (err) {
        console.error("Failed to restore wallet connection:", err)
        localStorage.removeItem("walletData")
      }
    }
  }, [])

  // Connect wallet (Base Smart Wallet)
  const connectWallet = async (type: "MetaMask" | "Safe" | "WalletConnect" | "Coinbase" | "Base") => {
    setIsConnecting(true)
    setError(null)

    try {
      // For development, use a mock implementation
      // In a real implementation, this would use the actual wallet connection
      const mockAddress =
        "0x" +
        Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")

      // Simulate a delay to mimic the connection process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAddress(mockAddress)
      setWalletType("Base")
      setIsConnected(true)

      // Save to localStorage
      localStorage.setItem(
        "walletData",
        JSON.stringify({
          address: mockAddress,
          basename,
          walletType: "Base",
        }),
      )

      // Set mock token balance
      setTokenBalance("100.00")
    } catch (err) {
      console.error("Wallet connection error:", err)
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setAddress(null)
    setBasenameState(null)
    setWalletType(null)
    setIsConnected(false)
    setTokenBalance(null)
    localStorage.removeItem("walletData")
  }

  // Set basename and update localStorage
  const setBasename = (newBasename: string) => {
    setBasenameState(newBasename)

    if (isConnected && address) {
      localStorage.setItem(
        "walletData",
        JSON.stringify({
          address,
          basename: newBasename,
          walletType,
        }),
      )
    }
  }

  // Refresh token balance
  const refreshBalance = async () => {
    if (!address) return

    try {
      // For development, use a mock balance
      setTokenBalance("100.00")

      // In a real implementation, this would fetch the actual balance
      // const balance = await getTokenBalance(address)
      // setTokenBalance(balance)
    } catch (err) {
      console.error("Failed to fetch token balance:", err)
      // Don't set error state here to avoid disrupting the UI
    }
  }

  // Context value
  const value = {
    address,
    basename,
    walletType,
    isConnected,
    isConnecting,
    tokenBalance,
    error,
    connectWallet,
    disconnectWallet,
    setBasename,
    refreshBalance,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

// Custom hook to use the Web3 context
export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
