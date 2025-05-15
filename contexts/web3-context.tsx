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
import { getTokenBalance, getBasenameForAddress } from "../utils/web3"

interface Web3ContextType {
  address: string | null
  basename: string | null
  walletClient: any | null
  provider: any | null
  isConnected: boolean
  isConnecting: boolean
  tokenBalance: string
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  refreshBalance: () => Promise<void>
  setBasename: (basename: string) => void
  checkBasename: () => Promise<string | null>
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  basename: null,
  walletClient: null,
  provider: null,
  isConnected: false,
  isConnecting: false,
  tokenBalance: "0",
  error: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  refreshBalance: async () => {},
  setBasename: () => {},
  checkBasename: async () => null,
})

export const useWeb3 = () => useContext(Web3Context)

interface Web3ProviderProps {
  children: ReactNode
}

// Local storage keys
const BASENAME_STORAGE_KEY = "dtaioc_basename"
const ADDRESS_STORAGE_KEY = "dtaioc_address"
const CONNECTION_STORAGE_KEY = "dtaioc_connected"

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [basename, setBasenameState] = useState<string | null>(null)
  const [walletClient, setWalletClient] = useState<any | null>(null)
  const [provider, setProvider] = useState<any | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [tokenBalance, setTokenBalance] = useState<string>("0")
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false)

  // Initialize web3 on component mount
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Try to restore from localStorage first
        const storedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY)
        const storedBasename = localStorage.getItem(BASENAME_STORAGE_KEY)
        const storedConnected = localStorage.getItem(CONNECTION_STORAGE_KEY) === "true"

        if (storedAddress && storedConnected) {
          setAddress(storedAddress)

          if (storedBasename) {
            setBasenameState(storedBasename)
          }

          // Verify if the wallet is still connected
          const connected = await isWalletConnected()
          if (connected) {
            const currentAddress = await getCurrentAddress()

            if (currentAddress && currentAddress.toLowerCase() === storedAddress.toLowerCase()) {
              setIsConnected(true)

              // Fetch token balance
              try {
                const balance = await getTokenBalance(currentAddress)
                setTokenBalance(balance)
              } catch (err) {
                console.error("Error fetching token balance:", err)
              }

              // If no stored basename, try to fetch it
              if (!storedBasename) {
                try {
                  const basename = await getBasenameForAddress(currentAddress)
                  if (basename) {
                    setBasenameState(basename)
                    localStorage.setItem(BASENAME_STORAGE_KEY, basename)
                  }
                } catch (err) {
                  console.error("Error fetching basename:", err)
                }
              }
            } else {
              // Address changed or not connected, clear storage
              localStorage.removeItem(ADDRESS_STORAGE_KEY)
              localStorage.removeItem(BASENAME_STORAGE_KEY)
              localStorage.removeItem(CONNECTION_STORAGE_KEY)
            }
          } else {
            // Not connected, clear storage
            localStorage.removeItem(ADDRESS_STORAGE_KEY)
            localStorage.removeItem(BASENAME_STORAGE_KEY)
            localStorage.removeItem(CONNECTION_STORAGE_KEY)
          }
        }
      } catch (err) {
        console.error("Error initializing web3:", err)
        setError("Failed to initialize web3 connection")
      } finally {
        setInitialized(true)
      }
    }

    initWeb3()
  }, [])

  // Set up account change listener
  useEffect(() => {
    if (!initialized) return () => {}

    const cleanup = setupAccountChangeListener(async (newAddress) => {
      setAddress(newAddress)
      setIsConnected(!!newAddress)

      if (newAddress) {
        // Save to localStorage
        localStorage.setItem(ADDRESS_STORAGE_KEY, newAddress)
        localStorage.setItem(CONNECTION_STORAGE_KEY, "true")

        // Fetch token balance for new address
        try {
          const balance = await getTokenBalance(newAddress)
          setTokenBalance(balance)
        } catch (err) {
          console.error("Error fetching token balance:", err)
        }

        // Fetch basename for new address
        try {
          const basename = await getBasenameForAddress(newAddress)
          if (basename) {
            setBasenameState(basename)
            localStorage.setItem(BASENAME_STORAGE_KEY, basename)
          } else {
            setBasenameState(null)
            localStorage.removeItem(BASENAME_STORAGE_KEY)
          }
        } catch (err) {
          console.error("Error fetching basename:", err)
          setBasenameState(null)
          localStorage.removeItem(BASENAME_STORAGE_KEY)
        }
      } else {
        setTokenBalance("0")
        setBasenameState(null)
        localStorage.removeItem(ADDRESS_STORAGE_KEY)
        localStorage.removeItem(BASENAME_STORAGE_KEY)
        localStorage.removeItem(CONNECTION_STORAGE_KEY)
      }
    })

    return cleanup
  }, [initialized])

  // Set up chain change listener
  useEffect(() => {
    if (!initialized) return () => {}

    const cleanup = setupChainChangeListener(() => {
      // Reload the page on chain change
      window.location.reload()
    })

    return cleanup
  }, [initialized])

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

      // Save to localStorage
      localStorage.setItem(ADDRESS_STORAGE_KEY, walletAddress)
      localStorage.setItem(CONNECTION_STORAGE_KEY, "true")

      // Fetch token balance
      try {
        const balance = await getTokenBalance(walletAddress)
        setTokenBalance(balance)
      } catch (err) {
        console.error("Error fetching token balance:", err)
      }

      // Fetch basename
      try {
        const basename = await getBasenameForAddress(walletAddress)
        if (basename) {
          setBasenameState(basename)
          localStorage.setItem(BASENAME_STORAGE_KEY, basename)
        } else {
          console.log("No basename found for address:", walletAddress)
        }
      } catch (err) {
        console.error("Error fetching basename:", err)
      }

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
      setBasenameState(null)
      setWalletClient(null)
      setProvider(null)
      setIsConnected(false)
      setTokenBalance("0")

      // Clear localStorage
      localStorage.removeItem(ADDRESS_STORAGE_KEY)
      localStorage.removeItem(BASENAME_STORAGE_KEY)
      localStorage.removeItem(CONNECTION_STORAGE_KEY)

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

        // Also refresh basename
        try {
          const basename = await getBasenameForAddress(address)
          if (basename) {
            setBasenameState(basename)
            localStorage.setItem(BASENAME_STORAGE_KEY, basename)
          } else {
            console.log("No basename found for address during refresh:", address)
          }
        } catch (err) {
          console.error("Error refreshing basename:", err)
        }
      } catch (err: any) {
        console.error("Error refreshing balance:", err)
        setError(err.message || "Failed to refresh balance")
      }
    }
  }

  // Set basename function
  const setBasename = (newBasename: string) => {
    setBasenameState(newBasename)
    if (newBasename) {
      localStorage.setItem(BASENAME_STORAGE_KEY, newBasename)
    } else {
      localStorage.removeItem(BASENAME_STORAGE_KEY)
    }
  }

  // Check basename function
  const checkBasename = async () => {
    if (!address) return null

    try {
      const basename = await getBasenameForAddress(address)
      if (basename) {
        setBasenameState(basename)
        localStorage.setItem(BASENAME_STORAGE_KEY, basename)
      }
      return basename
    } catch (err) {
      console.error("Error checking basename:", err)
      return null
    }
  }

  const value = {
    address,
    basename,
    walletClient,
    provider,
    isConnected,
    isConnecting,
    tokenBalance,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    setBasename,
    checkBasename,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
