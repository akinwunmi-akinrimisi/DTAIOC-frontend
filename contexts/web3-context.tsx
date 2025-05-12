"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { initWeb3, getTokenBalance } from "@/utils/web3"
import { connectBaseSmartWallet } from "@/utils/web3-smart-wallets"

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
  const [walletClient, setWalletClient] = useState<any>(null)

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

  // Connect wallet
  const connectWallet = async (type: "MetaMask" | "Safe" | "WalletConnect" | "Coinbase" | "Base") => {
    setIsConnecting(true)
    setError(null)

    try {
      let walletData

      // Connect based on wallet type
      if (type === "Base") {
        if (!window.ethereum) {
          throw new Error("No Ethereum provider found. Please install a wallet extension.")
        }

        walletData = await connectBaseSmartWallet(window.ethereum)
        setWalletClient(walletData.walletClient)
      } else if (type === "MetaMask") {
        throw new Error("MetaMask connection not implemented yet")
      } else if (type === "WalletConnect") {
        throw new Error("WalletConnect connection not implemented yet")
      } else if (type === "Coinbase") {
        throw new Error("Coinbase Wallet connection not implemented yet")
      } else if (type === "Safe") {
        throw new Error("Safe Wallet connection not implemented yet")
      }

      setAddress(walletData.address)
      setWalletType(type)
      setIsConnected(true)

      // Save to localStorage
      localStorage.setItem(
        "walletData",
        JSON.stringify({
          address: walletData.address,
          basename,
          walletType: type,
        }),
      )

      // Initialize Web3 with the provider
      await initWeb3(window.ethereum)

      // Fetch token balance
      await refreshBalance()
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
    setWalletClient(null)
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
      const balance = await getTokenBalance(address)
      setTokenBalance(balance)
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
