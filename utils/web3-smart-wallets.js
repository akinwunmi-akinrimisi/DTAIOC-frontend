// Smart wallet integration utilities
import { createPublicClient, http, createWalletClient, custom } from "viem"
import { baseSepolia } from "viem/chains"

// Initialize Base Smart Wallet
export const initBaseSmartWallet = async (provider) => {
  try {
    if (!provider) {
      throw new Error("No provider available. Please install a wallet extension.")
    }

    // Create a public client for Base Sepolia
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org"),
    })

    // Create a wallet client using the provider
    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom(provider),
    })

    // Get the wallet address
    const [address] = await walletClient.getAddresses()

    return {
      publicClient,
      walletClient,
      address,
    }
  } catch (error) {
    console.error("Failed to initialize Base Smart Wallet:", error)
    throw error
  }
}

// Connect to Base Smart Wallet
export const connectBaseSmartWallet = async (provider) => {
  try {
    if (!provider) {
      throw new Error("No provider available. Please install a wallet extension.")
    }

    // Request account access
    await provider.request({ method: "eth_requestAccounts" })

    // Create a wallet client
    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom(provider),
    })

    // Get the wallet address
    const [address] = await walletClient.getAddresses()

    // Get the chain ID
    const chainId = await walletClient.getChainId()

    return {
      type: "Base",
      address,
      networkId: chainId,
      walletClient,
    }
  } catch (error) {
    console.error("Base Smart Wallet connection error:", error)
    throw new Error(`Failed to connect to Base Smart Wallet: ${error.message}`)
  }
}

// Connect to WalletConnect
export const connectWalletConnect = async () => {
  try {
    // This would use the WalletConnect SDK in a real implementation
    throw new Error("WalletConnect integration not fully implemented yet")
  } catch (error) {
    console.error("WalletConnect connection error:", error)
    throw new Error(`Failed to connect to WalletConnect: ${error.message}`)
  }
}

// Connect to Coinbase Wallet
export const connectCoinbaseWallet = async () => {
  try {
    // This would use the Coinbase Wallet SDK in a real implementation
    throw new Error("Coinbase Wallet integration not fully implemented yet")
  } catch (error) {
    console.error("Coinbase Wallet connection error:", error)
    throw new Error(`Failed to connect to Coinbase Wallet: ${error.message}`)
  }
}

export default {
  initBaseSmartWallet,
  connectBaseSmartWallet,
  connectWalletConnect,
  connectCoinbaseWallet,
}
