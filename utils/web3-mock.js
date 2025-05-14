import { createPublicClient, createWalletClient, http, custom, parseEther, formatEther } from "viem"
import { baseSepolia } from "viem/chains"
import MockBasenameResolverABI from "../abis/MockBasenameResolver.json"
import MockEntryPointABI from "../abis/MockEntryPoint.json"
import MockSmartWalletABI from "../abis/MockSmartWallet.json"
import GameABI from "../abis/DTAIOCGame.json"

// Environment variables for testing
const MOCK_BASENAME_RESOLVER_ADDRESS =
  process.env.MOCK_BASENAME_RESOLVER_ADDRESS || "0x0000000000000000000000000000000000000001"
const MOCK_ENTRY_POINT_ADDRESS = process.env.MOCK_ENTRY_POINT_ADDRESS || "0x0000000000000000000000000000000000000002"
const MOCK_SMART_WALLET_ADDRESS = process.env.MOCK_SMART_WALLET_ADDRESS || "0x0000000000000000000000000000000000000003"
const TEST_RPC_URL = process.env.TEST_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL

// Create public client for read operations in test environment
export const testPublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(TEST_RPC_URL),
})

// Helper function to create a test wallet client
export const createTestWallet = (provider) => {
  return createWalletClient({
    chain: baseSepolia,
    transport: custom(provider),
  })
}

// Mock contract interaction functions
export const getMockBasenameResolverContract = () => {
  return {
    address: MOCK_BASENAME_RESOLVER_ADDRESS,
    abi: MockBasenameResolverABI.abi,
  }
}

export const getMockEntryPointContract = () => {
  return {
    address: MOCK_ENTRY_POINT_ADDRESS,
    abi: MockEntryPointABI.abi,
  }
}

export const getMockSmartWalletContract = () => {
  return {
    address: MOCK_SMART_WALLET_ADDRESS,
    abi: MockSmartWalletABI.abi,
  }
}

// Mock basename resolver functions
export const getBasenameForAddress = async (address) => {
  try {
    const mockBasenameResolver = getMockBasenameResolverContract()
    const basename = await testPublicClient.readContract({
      ...mockBasenameResolver,
      functionName: "basenames",
      args: [address],
    })
    return basename
  } catch (error) {
    console.error("Error getting basename for address:", error)
    return null
  }
}

export const setBasenameForAddress = async (walletClient, address, basename) => {
  try {
    const mockBasenameResolver = getMockBasenameResolverContract()
    const [walletAddress] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...mockBasenameResolver,
      functionName: "setBasename",
      args: [address, basename],
      account: walletAddress,
    })

    return hash
  } catch (error) {
    console.error("Error setting basename for address:", error)
    throw error
  }
}

export const resolveBasenameToAddress = async (node) => {
  try {
    const mockBasenameResolver = getMockBasenameResolverContract()
    const address = await testPublicClient.readContract({
      ...mockBasenameResolver,
      functionName: "resolve",
      args: [node],
    })
    return address
  } catch (error) {
    console.error("Error resolving basename to address:", error)
    return null
  }
}

export const setResolvedAddress = async (walletClient, node, address) => {
  try {
    const mockBasenameResolver = getMockBasenameResolverContract()
    const [walletAddress] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...mockBasenameResolver,
      functionName: "setResolvedAddress",
      args: [node, address],
      account: walletAddress,
    })

    return hash
  } catch (error) {
    console.error("Error setting resolved address:", error)
    throw error
  }
}

// Mock smart wallet functions
export const executeTransaction = async (walletClient, target, data) => {
  try {
    const mockSmartWallet = getMockSmartWalletContract()
    const [walletAddress] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...mockSmartWallet,
      functionName: "execute",
      args: [target, data],
      account: walletAddress,
    })

    return hash
  } catch (error) {
    console.error("Error executing transaction:", error)
    throw error
  }
}

// Mock entry point functions
export const depositToEntryPoint = async (walletClient, account, value) => {
  try {
    const mockEntryPoint = getMockEntryPointContract()
    const [walletAddress] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...mockEntryPoint,
      functionName: "depositTo",
      args: [account],
      account: walletAddress,
      value: parseEther(value.toString()),
    })

    return hash
  } catch (error) {
    console.error("Error depositing to entry point:", error)
    throw error
  }
}

export const getEntryPointDeposit = async (address) => {
  try {
    const mockEntryPoint = getMockEntryPointContract()
    const deposit = await testPublicClient.readContract({
      ...mockEntryPoint,
      functionName: "deposits",
      args: [address],
    })
    return formatEther(deposit)
  } catch (error) {
    console.error("Error getting entry point deposit:", error)
    return "0"
  }
}

// Check if player has a perfect score
export const isPerfectScore = async (gameId, playerAddress, stage) => {
  try {
    const gameContract = {
      address: process.env.GAME_CONTRACT_ADDRESS,
      abi: GameABI.abi,
    }

    const isPerfect = await testPublicClient.readContract({
      ...gameContract,
      functionName: "isPerfectScore",
      args: [gameId, playerAddress, stage],
    })

    return isPerfect
  } catch (error) {
    console.error("Error checking if player has perfect score:", error)
    return false
  }
}

// Export all functions
export default {
  testPublicClient,
  createTestWallet,
  getMockBasenameResolverContract,
  getMockEntryPointContract,
  getMockSmartWalletContract,
  getBasenameForAddress,
  setBasenameForAddress,
  resolveBasenameToAddress,
  setResolvedAddress,
  executeTransaction,
  depositToEntryPoint,
  getEntryPointDeposit,
  isPerfectScore,
}
