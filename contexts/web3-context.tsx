"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { connectMetaMask, connectSafe, getTokenBalance, initWeb3 } from "@/utils/web3"
import { connectBaseSmartWallet, getBasename } from "@/utils/base-smart-wallet"

interface Web3ContextType {
  address: string | null
  basename: string | null
  walletType: "MetaMask" | "Safe" | "Base" | "WalletConnect" | "Coinbase" | null
  isConnected: boolean
  isConnecting: boolean
  tokenBalance: string | null
  error: string | null
  connectWallet: (type: "MetaMask" | "Safe" | "Base" | "WalletConnect" | "Coinbase") => Promise<void>
  disconnectWallet: () => void
  setBasename: (basename: string) => void
  refreshBalance: () => Promise<void>
  smartAccountClient: any | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [basename, setBasenameState] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<"MetaMask" | "Safe" | "Base" | "WalletConnect" | "Coinbase" | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [smartAccountClient, setSmartAccountClient] = useState<any | null>(null)

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

  // Connect wallet (MetaMask, Safe, Base Smart Wallet, or other wallets)
  const connectWallet = async (type: "MetaMask" | "Safe" | "Base" | "WalletConnect" | "Coinbase") => {
    setIsConnecting(true)
    setError(null)

    try {
      let walletData: any

      if (type === "MetaMask") {
        walletData = await connectMetaMask()
      } else if (type === "Safe") {
        walletData = await connectSafe()
      } else if (type === "Base") {
        walletData = await connectBaseSmartWallet()
        setSmartAccountClient(walletData.smartAccountClient)
      } else {
        // For now, other wallet types are not fully implemented
        setError(`${type} wallet integration is coming soon. Please use MetaMask, Safe, or Base Smart Wallet for now.`)
        setIsConnecting(false)
        return
      }

      setAddress(walletData.address)
      setWalletType(type)
      setIsConnected(true)

      // Try to get basename for the address
      if (type === "Base") {
        const userBasename = await getBasename(walletData.address)
        if (userBasename) {
          setBasenameState(userBasename)
        }
      }

      // Save to localStorage
      localStorage.setItem(
        "walletData",
        JSON.stringify({
          address: walletData.address,
          basename,
          walletType: type,
        }),
      )

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
    setSmartAccountClient(null)
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
    smartAccountClient,
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
