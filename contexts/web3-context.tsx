"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  connectBaseSmartWallet,
  disconnectBaseSmartWallet,
  isWalletConnected,
  getCurrentAddress,
  setupAccountChangeListener,
  setupChainChangeListener,
  switchToBaseNetwork,
} from "../utils/web3-smart-wallets"
import { getTokenBalance } from "../utils/web3"

interface Web3ContextType {
  address: string | null
  walletClient: any | null
  provider: any | null
  isConnected: boolean
  isConnecting: boolean
  tokenBalance: string
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  refreshBalance: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  walletClient: null,
  provider: null,
  isConnected: false,
  isConnecting: false,
  tokenBalance: "0",
  error: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  refreshBalance: async () => {},
})

export const useWeb3 = () => useContext(Web3Context)

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [walletClient, setWalletClient] = useState<any | null>(null)
  const [provider, setProvider] = useState<any | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [tokenBalance, setTokenBalance] = useState<string>("0")
  const [error, setError] = useState<string | null>(null)

  // Initialize web3 on component mount
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const connected = await isWalletConnected()
        if (connected) {
          const currentAddress = await getCurrentAddress()
          if (currentAddress) {
            setAddress(currentAddress)
            setIsConnected(true)

            // Fetch token balance
            const balance = await getTokenBalance(currentAddress)
            setTokenBalance(balance)
          }
        }
      } catch (err) {
        console.error("Error initializing web3:", err)
        setError("Failed to initialize web3 connection")
      }
    }

    initWeb3()
  }, [])

  // Set up account change listener
  useEffect(() => {
    const cleanup = setupAccountChangeListener(async (newAddress) => {
      setAddress(newAddress)
      setIsConnected(!!newAddress)

      if (newAddress) {
        // Fetch token balance for new address
        const balance = await getTokenBalance(newAddress)
        setTokenBalance(balance)
      } else {
        setTokenBalance("0")
      }
    })

    return cleanup
  }, [])

  // Set up chain change listener
  useEffect(() => {
    const cleanup = setupChainChangeListener(() => {
      // Reload the page on chain change
      window.location.reload()
    })

    return cleanup
  }, [])

  // Connect wallet function
  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // First, ensure we're on the Base network
      const switched = await switchToBaseNetwork()
      if (!switched) {
        throw new Error("Failed to switch to Base network")
      }

      // Connect to the wallet
      const { address: walletAddress, walletClient: client, provider: walletProvider } = await connectBaseSmartWallet()

      setAddress(walletAddress)
      setWalletClient(client)
      setProvider(walletProvider)
      setIsConnected(true)

      // Fetch token balance
      const balance = await getTokenBalance(walletAddress)
      setTokenBalance(balance)

      return { address: walletAddress, walletClient: client }
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message || "Failed to connect wallet")
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      await disconnectBaseSmartWallet()

      setAddress(null)
      setWalletClient(null)
      setProvider(null)
      setIsConnected(false)
      setTokenBalance("0")

      return true
    } catch (err: any) {
      console.error("Error disconnecting wallet:", err)
      setError(err.message || "Failed to disconnect wallet")
      return false
    }
  }

  // Refresh balance function
  const refreshBalance = async () => {
    if (address) {
      try {
        const balance = await getTokenBalance(address)
        setTokenBalance(balance)
      } catch (err: any) {
        console.error("Error refreshing balance:", err)
        setError(err.message || "Failed to refresh balance")
      }
    }
  }

  const value = {
    address,
    walletClient,
    provider,
    isConnected,
    isConnecting,
    tokenBalance,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
