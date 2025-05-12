import { createPublicClient, http, createWalletClient, custom, parseEther } from "viem"
import { baseSepolia } from "viem/chains"
import { getContractAddresses, getTokenBalanceServer } from "@/app/actions/contract-actions"

// ABIs
import DTAIOCGameABI from "../abis/DTAIOCGame.json"
import DTAIOCTokenABI from "../abis/DTAIOCToken.json"

// Contract addresses will be fetched from server
let GAME_CONTRACT_ADDRESS
let TOKEN_CONTRACT_ADDRESS
let STAKING_CONTRACT_ADDRESS
let NFT_CONTRACT_ADDRESS
let BASENAME_RESOLVER_ADDRESS
let BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org"

// Initialize contract addresses
const initContractAddresses = async () => {
  const addresses = await getContractAddresses()
  GAME_CONTRACT_ADDRESS = addresses.gameContractAddress
  TOKEN_CONTRACT_ADDRESS = addresses.tokenContractAddress
  STAKING_CONTRACT_ADDRESS = addresses.stakingContractAddress
  NFT_CONTRACT_ADDRESS = addresses.nftContractAddress
  BASENAME_RESOLVER_ADDRESS = addresses.basenameResolverAddress

  // Only update RPC URL if we got one from the server
  if (addresses.baseRpcUrl) {
    BASE_RPC_URL = addresses.baseRpcUrl
  }
}

// Initialize clients
let publicClient
let walletClient

/**
 * Calculate the namehash of a domain name
 * @param {string} name - Domain name (e.g., "user.base.eth")
 * @returns {string} - Namehash as a hex string
 */
function calculateNamehash(name) {
  if (!name || name === "") {
    return "0x0000000000000000000000000000000000000000000000000000000000000000"
  }

  // Split the name by dots
  const labels = name.split(".")

  // Start with the zero hash
  let result = "0x0000000000000000000000000000000000000000000000000000000000000000"

  // Process the labels from right to left
  for (let i = labels.length - 1; i >= 0; i--) {
    // Hash the label
    const labelHash = publicClient.keccak256({ value: labels[i] })

    // Concatenate and hash again
    const concatenated = result.slice(2) + labelHash.slice(2)
    result = publicClient.keccak256({ value: "0x" + concatenated })
  }

  return result
}

/**
 * Initialize Web3 with the provided provider
 * @param {Object} provider - Web3 provider (e.g., window.ethereum)
 */
export const initWeb3 = async (provider) => {
  // Ensure contract addresses are initialized
  if (!GAME_CONTRACT_ADDRESS) {
    await initContractAddresses()
  }

  // Create public client
  publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(BASE_RPC_URL),
  })

  // Create wallet client if provider is available
  if (provider) {
    walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom(provider),
    })
  }

  return { publicClient, walletClient }
}

/**
 * Get token balance for an address
 * @param {string} address - Wallet address
 * @returns {Promise<string>} - Token balance in DTAIOC
 */
export const getTokenBalance = async (address) => {
  try {
    // Use server action to get token balance
    return await getTokenBalanceServer(address)
  } catch (error) {
    console.error("Get token balance error:", error)
    throw new Error(`Failed to get token balance: ${error.message}`)
  }
}

/**
 * Mint DTAIOC tokens
 * @param {string} address - Wallet address
 * @param {number} amount - Amount to mint in DTAIOC
 * @returns {Promise<Object>} - Transaction receipt
 */
export const mintTokens = async (address, amount) => {
  if (!walletClient || !publicClient) {
    await initWeb3(window.ethereum)
    if (!walletClient || !publicClient) {
      throw new Error("Wallet client or public client not initialized")
    }
  }

  try {
    const amountWei = parseEther(amount.toString())

    // Prepare the transaction
    const { request } = await publicClient.simulateContract({
      address: TOKEN_CONTRACT_ADDRESS,
      abi: DTAIOCTokenABI.abi,
      functionName: "mint",
      args: [amountWei],
      account: address,
    })

    // Send the transaction
    const hash = await walletClient.writeContract(request)

    // Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    return receipt
  } catch (error) {
    console.error("Mint tokens error:", error)
    throw new Error(`Failed to mint tokens: ${error.message}`)
  }
}

/**
 * Create a new game
 * @param {string} address - Creator wallet address
 * @param {string} basename - Creator basename
 * @param {Array} questionHashes - Array of question hashes
 * @param {number} stakeAmount - Stake amount in DTAIOC
 * @param {number} playerLimit - Maximum number of players
 * @param {number} duration - Game duration in seconds
 * @returns {Promise<Object>} - Transaction receipt
 */
export const createGame = async (address, basename, questionHashes, stakeAmount, playerLimit, duration) => {
  if (!walletClient || !publicClient) {
    await initWeb3(window.ethereum)
    if (!walletClient || !publicClient) {
      throw new Error("Wallet client or public client not initialized")
    }
  }

  try {
    console.log("Creating game with basename:", basename)

    // Calculate the namehash
    const basenameNode = calculateNamehash(basename)
    console.log("Calculated namehash:", basenameNode)

    // Prepare the transaction
    const { request } = await publicClient.simulateContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: DTAIOCGameABI.abi,
      functionName: "createGame",
      args: [basenameNode],
      account: address,
    })

    // Send the transaction
    const hash = await walletClient.writeContract(request)

    // Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    return receipt
  } catch (error) {
    console.error("Create game error:", error)
    throw new Error(`Failed to create game: ${error.message}`)
  }
}

/**
 * Join a game
 * @param {string} address - Player wallet address
 * @param {string} gameId - Game ID
 * @param {string} basename - Player basename
 * @param {string} signature - Backend-generated signature
 * @returns {Promise<Object>} - Transaction receipt
 */
export const joinGame = async (address, gameId, basename, signature) => {
  if (!walletClient || !publicClient) {
    await initWeb3(window.ethereum)
    if (!walletClient || !publicClient) {
      throw new Error("Wallet client or public client not initialized")
    }
  }

  try {
    // Prepare the transaction
    const { request } = await publicClient.simulateContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: DTAIOCGameABI.abi,
      functionName: "joinGame",
      args: [gameId, basename, signature],
      account: address,
    })

    // Send the transaction
    const hash = await walletClient.writeContract(request)

    // Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    return receipt
  } catch (error) {
    console.error("Join game error:", error)
    throw new Error(`Failed to join game: ${error.message}`)
  }
}

/**
 * Submit answers for a game
 * @param {string} address - Player wallet address
 * @param {string} gameId - Game ID
 * @param {number} stage - Current stage (1-3)
 * @param {Array} scores - Array of scores
 * @returns {Promise<Object>} - Transaction receipt
 */
export const submitAnswers = async (address, gameId, stage, scores) => {
  if (!walletClient || !publicClient) {
    await initWeb3(window.ethereum)
    if (!walletClient || !publicClient) {
      throw new Error("Wallet client or public client not initialized")
    }
  }

  try {
    // Prepare the transaction
    const { request } = await publicClient.simulateContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: DTAIOCGameABI.abi,
      functionName: "advanceStage",
      args: [gameId],
      account: address,
    })

    // Send the transaction
    const hash = await walletClient.writeContract(request)

    // Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    return receipt
  } catch (error) {
    console.error("Submit answers error:", error)
    throw new Error(`Failed to submit answers: ${error.message}`)
  }
}

/**
 * Check if user has sufficient token balance to join a game
 * @param {string} address - Wallet address
 * @param {number} requiredAmount - Required token amount
 * @returns {Promise<boolean>} - True if sufficient balance
 */
export const hasSufficientBalance = async (address, requiredAmount) => {
  try {
    const balance = await getTokenBalance(address)
    return Number.parseFloat(balance) >= requiredAmount
  } catch (error) {
    console.error("Balance check error:", error)
    return false
  }
}

/**
 * Get player data for a game
 * @param {string} gameId - Game ID
 * @param {string} address - Player address
 * @returns {Promise<Object>} - Player data
 */
export const getPlayerData = async (gameId, address) => {
  if (!publicClient) {
    await initWeb3()
    if (!publicClient) {
      throw new Error("Public client not initialized")
    }
  }

  try {
    const playerData = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: DTAIOCGameABI.abi,
      functionName: "getPlayer",
      args: [gameId, address],
    })

    return {
      basename: playerData[0],
      currentStage: Number(playerData[1]),
      score: Number(playerData[2]),
      completionTime: Number(playerData[3]),
    }
  } catch (error) {
    console.error("Get player data error:", error)
    throw new Error(`Failed to get player data: ${error.message}`)
  }
}

/**
 * Get game data
 * @param {string} gameId - Game ID
 * @returns {Promise<Object>} - Game data
 */
export const getGameData = async (gameId) => {
  if (!publicClient) {
    await initWeb3()
    if (!publicClient) {
      throw new Error("Public client not initialized")
    }
  }

  try {
    const gameData = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: DTAIOCGameABI.abi,
      functionName: "games",
      args: [gameId],
    })

    return {
      creator: gameData[0],
      basenameNode: gameData[1],
      stage: Number(gameData[2]),
      playerCount: Number(gameData[3]),
      ended: gameData[4],
    }
  } catch (error) {
    console.error("Get game data error:", error)
    throw new Error(`Failed to get game data: ${error.message}`)
  }
}

export default {
  initWeb3,
  getTokenBalance,
  mintTokens,
  createGame,
  joinGame,
  submitAnswers,
  hasSufficientBalance,
  getPlayerData,
  getGameData,
}
