import { createWalletClient, custom } from "viem"
import { base } from "viem/chains"

// Base RPC URL from environment variables
const BASE_RPC_URL = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL

// Connect to a Base smart wallet
export const connectBaseSmartWallet = async () => {
  try {
    // Check if ethereum is available in the window object
    if (typeof window !== "undefined" && window.ethereum) {
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.")
      }

      // Create a wallet client using the provider
      const walletClient = createWalletClient({
        chain: base,
        transport: custom(window.ethereum),
      })

      // Get the connected address
      const [address] = await walletClient.getAddresses()

      return {
        address,
        walletClient,
        provider: window.ethereum,
      }
    } else {
      throw new Error("Ethereum provider not found. Please install a wallet extension like MetaMask.")
    }
  } catch (error) {
    console.error("Error connecting to Base smart wallet:", error)
    throw error
  }
}

// Disconnect from a Base smart wallet
export const disconnectBaseSmartWallet = async () => {
  // Most wallet providers don't have a disconnect method
  // We can just clear our local state
  return true
}

// Check if a wallet is connected
export const isWalletConnected = async () => {
  try {
    if (typeof window !== "undefined" && window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      return accounts.length > 0
    }
    return false
  } catch (error) {
    console.error("Error checking wallet connection:", error)
    return false
  }
}

// Get the current connected address
export const getCurrentAddress = async () => {
  try {
    if (typeof window !== "undefined" && window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      return accounts.length > 0 ? accounts[0] : null
    }
    return null
  } catch (error) {
    console.error("Error getting current address:", error)
    return null
  }
}

// Listen for account changes
export const setupAccountChangeListener = (callback) => {
  if (typeof window !== "undefined" && window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      callback(accounts.length > 0 ? accounts[0] : null)
    })

    return () => {
      window.ethereum.removeListener("accountsChanged", callback)
    }
  }
  return () => {}
}

// Listen for chain changes
export const setupChainChangeListener = (callback) => {
  if (typeof window !== "undefined" && window.ethereum) {
    window.ethereum.on("chainChanged", (chainId) => {
      callback(chainId)
    })

    return () => {
      window.ethereum.removeListener("chainChanged", callback)
    }
  }
  return () => {}
}

// Switch to Base network
export const switchToBaseNetwork = async () => {
  try {
    if (typeof window !== "undefined" && window.ethereum) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }], // Base mainnet chain ID
      })
      return true
    }
    return false
  } catch (error) {
    // If the error code is 4902, the chain hasn't been added to the wallet
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x2105",
              chainName: "Base",
              nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [BASE_RPC_URL],
              blockExplorerUrls: ["https://basescan.org/"],
            },
          ],
        })
        return true
      } catch (addError) {
        console.error("Error adding Base network:", addError)
        return false
      }
    }
    console.error("Error switching to Base network:", error)
    return false
  }
}
