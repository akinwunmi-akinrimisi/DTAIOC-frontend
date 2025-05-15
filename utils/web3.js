import { createPublicClient, createWalletClient, http, custom, parseEther } from "viem"
import { base } from "viem/chains"
import { ethers } from "ethers"
import { api } from "./api"
import GameABI from "../abis/DTAIOCGame.json"
import TokenABI from "../abis/DTAIOCToken.json"
import StakingABI from "../abis/DTAIOCStaking.json"
import NFTABI from "../abis/DTAIOCNFT.json"
import BasenameResolverABI from "../abis/IBasenameResolver.json"

// Initialize with environment variables
const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS
const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS
const BASENAME_RESOLVER_ADDRESS = process.env.BASENAME_RESOLVER_ADDRESS
const BASE_RPC_URL = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL

// Create public client for read operations
export const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
})

// Helper function to create a wallet client
export const createWallet = (provider) => {
  return createWalletClient({
    chain: base,
    transport: custom(provider),
  })
}

// Contract interaction functions
export const getGameContract = async () => {
  return {
    address: GAME_CONTRACT_ADDRESS,
    abi: GameABI.abi,
  }
}

export const getTokenContract = async () => {
  return {
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TokenABI.abi,
  }
}

export const getStakingContract = async () => {
  return {
    address: STAKING_CONTRACT_ADDRESS,
    abi: StakingABI.abi,
  }
}

export const getNFTContract = async () => {
  return {
    address: NFT_CONTRACT_ADDRESS,
    abi: NFTABI.abi,
  }
}

export const getBasenameResolverContract = async () => {
  return {
    address: BASENAME_RESOLVER_ADDRESS,
    abi: BasenameResolverABI.abi,
  }
}

/**
 * Get token balance for an address
 * @param {string} address - Wallet address
 * @returns {Promise<string>} - Token balance
 */
export const getTokenBalance = async (address) => {
  try {
    // Use the API to get the token balance
    const balance = await api.getTokenBalance(address)
    return ethers.utils.formatUnits(balance, 18) // Assuming 18 decimals
  } catch (error) {
    console.error("Error getting token balance:", error)
    return "0"
  }
}

export const getGameData = async (gameId) => {
  try {
    const gameContract = await getGameContract()
    const gameData = await publicClient.readContract({
      ...gameContract,
      functionName: "games",
      args: [gameId],
    })

    return gameData
  } catch (error) {
    console.error("Error getting game data:", error)
    return null
  }
}

export const getLeaderboardData = async (gameId) => {
  try {
    const gameContract = await getGameContract()
    const leaderboardData = await publicClient.readContract({
      ...gameContract,
      functionName: "getLeaderboardData",
      args: [gameId],
    })

    return leaderboardData
  } catch (error) {
    console.error("Error getting leaderboard data:", error)
    return null
  }
}

export const getPlayerData = async (gameId, playerAddress) => {
  try {
    const gameContract = await getGameContract()
    const playerData = await publicClient.readContract({
      ...gameContract,
      functionName: "getPlayer",
      args: [gameId, playerAddress],
    })

    return playerData
  } catch (error) {
    console.error("Error getting player data:", error)
    return null
  }
}

export const isPlayerInGame = async (gameId, playerAddress) => {
  try {
    const gameContract = await getGameContract()
    const isInGame = await publicClient.readContract({
      ...gameContract,
      functionName: "isPlayerInGame",
      args: [gameId, playerAddress],
    })

    return isInGame
  } catch (error) {
    console.error("Error checking if player is in game:", error)
    return false
  }
}

/**
 * Get basename for an address
 * @param {string} address - Wallet address
 * @returns {Promise<string|null>} - Basename or null if not found
 */
export const getBasenameForAddress = async (address) => {
  try {
    // Use the API to get the basename
    const basename = await api.getBasenameForAddress(address)
    return basename
  } catch (error) {
    console.error("Error getting basename for address:", error)
    return null
  }
}

/**
 * Set basename for an address
 * @param {object} walletClient - Wallet client
 * @param {string} address - Wallet address
 * @param {string} basename - Basename to set
 * @returns {Promise<boolean>} - Success status
 */
export const setBasenameForAddress = async (walletClient, address, basename) => {
  try {
    // This would typically call a smart contract function
    // For now, we'll just return true as we're using the API
    return true
  } catch (error) {
    console.error("Error setting basename for address:", error)
    return false
  }
}

/**
 * Calculate namehash for a basename
 * @param {string} basename - Basename (e.g., "user.base.eth")
 * @returns {Promise<string>} - Namehash
 */
export const calculateNamehash = async (basename) => {
  try {
    // Remove .base.eth if present
    const name = basename.endsWith(".base.eth") ? basename.slice(0, -9) : basename

    // Calculate namehash using ethers
    const labelHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name))
    const baseEthNamehash = ethers.utils.namehash("base.eth")
    const namehash = ethers.utils.keccak256(ethers.utils.concat([baseEthNamehash, labelHash]))

    return namehash
  } catch (error) {
    console.error("Error calculating namehash:", error)
    return null
  }
}

// Write functions (require wallet)
/**
 * Create a new game
 * @param {object} walletClient - Wallet client
 * @param {string} basenameNode - Basename node (namehash)
 * @param {Array<string>} questionRootHashes - Question root hashes
 * @param {number} duration - Game duration in seconds
 * @returns {Promise<string>} - Transaction hash
 */
export const createGame = async (walletClient, basenameNode, questionRootHashes, duration) => {
  try {
    // This would typically call a smart contract function
    // For now, we'll just return a mock transaction hash
    return (
      "0x" +
      Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")
    )
  } catch (error) {
    console.error("Error creating game:", error)
    throw error
  }
}

/**
 * Join a game
 * @param {object} walletClient - Wallet client
 * @param {string} gameId - Game ID
 * @param {string} signature - Signature from backend
 * @returns {Promise<string>} - Transaction hash
 */
export const joinGame = async (walletClient, gameId, signature) => {
  try {
    // This would typically call a smart contract function
    // For now, we'll just return a mock transaction hash
    return (
      "0x" +
      Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")
    )
  } catch (error) {
    console.error("Error joining game:", error)
    throw error
  }
}

/**
 * Submit answers for a game
 * @param {object} walletClient - Wallet client
 * @param {string} gameId - Game ID
 * @param {number} stage - Game stage
 * @param {Array<number>} answers - Answer indices
 * @returns {Promise<string>} - Transaction hash
 */
export const submitAnswers = async (walletClient, gameId, stage, answers) => {
  try {
    // This would typically call a smart contract function
    // For now, we'll just return a mock transaction hash
    return (
      "0x" +
      Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")
    )
  } catch (error) {
    console.error("Error submitting answers:", error)
    throw error
  }
}

export const stakeTokens = async (walletClient, gameId, amount) => {
  try {
    // First approve the staking contract to spend tokens
    const tokenContract = await getTokenContract()
    const stakingContract = await getStakingContract()
    const [address] = await walletClient.getAddresses()

    const amountInWei = parseEther(amount)

    const approvalHash = await walletClient.writeContract({
      ...tokenContract,
      functionName: "approve",
      args: [STAKING_CONTRACT_ADDRESS, amountInWei],
      account: address,
    })

    // Wait for approval transaction to be mined
    await publicClient.waitForTransactionReceipt({ hash: approvalHash })

    // Now stake the tokens
    const stakeHash = await walletClient.writeContract({
      ...stakingContract,
      functionName: "stake",
      args: [gameId, address, amountInWei],
      account: address,
    })

    return stakeHash
  } catch (error) {
    console.error("Error staking tokens:", error)
    throw error
  }
}

export const advanceStage = async (walletClient, gameId) => {
  try {
    const gameContract = await getGameContract()
    const [address] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...gameContract,
      functionName: "advanceStage",
      args: [gameId],
      account: address,
    })

    return hash
  } catch (error) {
    console.error("Error advancing stage:", error)
    throw error
  }
}

export const endGame = async (walletClient, gameId) => {
  try {
    const gameContract = await getGameContract()
    const [address] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...gameContract,
      functionName: "endGame",
      args: [gameId],
      account: address,
    })

    return hash
  } catch (error) {
    console.error("Error ending game:", error)
    throw error
  }
}

export const autoEndGame = async (walletClient, gameId) => {
  try {
    const gameContract = await getGameContract()
    const [address] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...gameContract,
      functionName: "autoEndGame",
      args: [gameId],
      account: address,
    })

    return hash
  } catch (error) {
    console.error("Error auto-ending game:", error)
    throw error
  }
}

export const refundPlayer = async (walletClient, gameId, playerAddress) => {
  try {
    const gameContract = await getGameContract()
    const [address] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...gameContract,
      functionName: "refundPlayer",
      args: [gameId, playerAddress],
      account: address,
    })

    return hash
  } catch (error) {
    console.error("Error refunding player:", error)
    throw error
  }
}

/**
 * Check if a player has a perfect score for a stage
 * @param {string} gameId - Game ID
 * @param {string} playerAddress - Player address
 * @param {number} stage - Game stage
 * @returns {Promise<boolean>} - True if player has perfect score
 */
export const isPerfectScore = async (gameId, playerAddress, stage) => {
  try {
    const gameContract = await getGameContract()
    const isPerfect = await publicClient.readContract({
      ...gameContract,
      functionName: "isPerfectScore",
      args: [gameId, playerAddress, stage],
    })

    return isPerfect
  } catch (error) {
    console.error("Error checking perfect score:", error)
    return false
  }
}

export const mintTokens = async (walletClient, amount) => {
  if (!TOKEN_CONTRACT_ADDRESS) {
    throw new Error("TOKEN_CONTRACT_ADDRESS is not set")
  }

  try {
    const tokenContract = await getTokenContract()
    const [address] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...tokenContract,
      functionName: "mint",
      args: [parseEther(amount.toString())],
      account: address,
    })

    return hash
  } catch (error) {
    console.error("Error minting tokens:", error)
    throw error
  }
}

export const hasSufficientBalance = async (address, stakeAmount) => {
  try {
    const balance = await getTokenBalance(address)
    return Number.parseFloat(balance) >= stakeAmount
  } catch (error) {
    console.error("Error checking sufficient balance:", error)
    return false
  }
}

export default {
  getTokenBalance,
  calculateNamehash,
  getBasenameForAddress,
  setBasenameForAddress,
  createGame,
  joinGame,
  submitAnswers,
}
