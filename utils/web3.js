import { createPublicClient, createWalletClient, http, custom, parseEther, formatEther } from "viem"
import { base } from "viem/chains"
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

// Read functions
export const getTokenBalance = async (address) => {
  if (!address || !TOKEN_CONTRACT_ADDRESS) return "0"

  try {
    const tokenContract = await getTokenContract()
    const balance = await publicClient.readContract({
      ...tokenContract,
      functionName: "balanceOf",
      args: [address],
    })

    return formatEther(balance)
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

export const resolveBasename = async (basenameNode) => {
  try {
    const resolverContract = await getBasenameResolverContract()
    const address = await publicClient.readContract({
      ...resolverContract,
      functionName: "resolve",
      args: [basenameNode],
    })

    return address
  } catch (error) {
    console.error("Error resolving basename:", error)
    return null
  }
}

export const namehash = async (node) => {
  try {
    const resolverContract = await getBasenameResolverContract()
    const hash = await publicClient.readContract({
      ...resolverContract,
      functionName: "namehash",
      args: [node],
    })

    return hash
  } catch (error) {
    console.error("Error calculating namehash:", error)
    return null
  }
}

// Write functions (require wallet)
export const createGame = async (walletClient, basenameNode, questionRootHashes, gameDuration) => {
  try {
    const gameContract = await getGameContract()
    const [address] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...gameContract,
      functionName: "createGame",
      args: [basenameNode, questionRootHashes, gameDuration],
      account: address,
    })

    return hash
  } catch (error) {
    console.error("Error creating game:", error)
    throw error
  }
}

export const joinGame = async (walletClient, gameId, basename, signature) => {
  try {
    const gameContract = await getGameContract()
    const [address] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...gameContract,
      functionName: "joinGame",
      args: [gameId, basename, signature],
      account: address,
    })

    return hash
  } catch (error) {
    console.error("Error joining game:", error)
    throw error
  }
}

export const submitAnswers = async (walletClient, gameId, stage, answerHashes, score, signature) => {
  try {
    const gameContract = await getGameContract()
    const [address] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...gameContract,
      functionName: "submitAnswers",
      args: [gameId, stage, answerHashes, score, signature],
      account: address,
    })

    return hash
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

/**
 * Get basename for an address from the resolver
 * @param {string} address - Wallet address
 * @returns {Promise<string>} - Basename
 */
export const getBasenameForAddress = async (address) => {
  try {
    const resolverContract = await getBasenameResolverContract()
    const basename = await publicClient.readContract({
      ...resolverContract,
      functionName: "resolve",
      args: [address],
    })

    return basename
  } catch (error) {
    console.error("Error getting basename for address:", error)
    return null
  }
}

/**
 * Set basename for an address
 * @param {Object} walletClient - Wallet client
 * @param {string} address - Wallet address
 * @param {string} basename - Basename to set
 * @returns {Promise<string>} - Transaction hash
 */
export const setBasenameForAddress = async (walletClient, address, basename) => {
  try {
    const resolverContract = await getBasenameResolverContract()
    const [walletAddress] = await walletClient.getAddresses()

    const hash = await walletClient.writeContract({
      ...resolverContract,
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

/**
 * Calculate namehash for a basename
 * @param {string} basename - Basename
 * @returns {Promise<string>} - Namehash
 */
export const calculateNamehash = async (basename) => {
  try {
    const resolverContract = await getBasenameResolverContract()
    const hash = await publicClient.readContract({
      ...resolverContract,
      functionName: "namehash",
      args: [basename],
    })

    return hash
  } catch (error) {
    console.error("Error calculating namehash:", error)
    return null
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
