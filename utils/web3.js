import Web3 from "web3"
import SafeAppsSDK from "@safe-global/safe-apps-sdk"
import { getContractAddresses, getTokenBalanceServer } from "@/app/actions/contract-actions"

// ABIs
import DTAIOCGameABI from "../abis/DTAIOCGame.json"
import DTAIOCTokenABI from "../abis/DTAIOCToken.json"
import DTAIOCStakingABI from "../abis/DTAIOCStaking.json"
import DTAIOCNFTABI from "../abis/DTAIOCNFT.json"
import IBasenameResolverABI from "../abis/IBasenameResolver.json"

/**
 * Calculate the namehash of a domain name
 * @param {string} name - Domain name (e.g., "user.base.eth")
 * @returns {string} - Namehash as a hex string
 */
function calculateNamehash(name) {
  // If the name is empty, return the zero hash
  if (!name || name === "") {
    return "0x0000000000000000000000000000000000000000000000000000000000000000"
  }

  // Split the name by dots
  const labels = name.split(".")

  // Start with the zero hash
  let result = "0x0000000000000000000000000000000000000000000000000000000000000000"

  // Process the labels from right to left
  for (let i = labels.length - 1; i >= 0; i--) {
    // Convert the label to bytes and hash it
    const labelHash = web3.utils.keccak256(web3.utils.utf8ToHex(labels[i]))

    // Concatenate the current result with the label hash and hash again
    // Using string concatenation of hex values without the 0x prefix
    const concatenated = result.slice(2) + labelHash.slice(2)
    result = web3.utils.keccak256("0x" + concatenated)
  }

  return result
}

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

// Initialize Web3 instance
let web3
let gameContract
let tokenContract
let stakingContract
let nftContract
let basenameResolverContract

// Initialize Safe SDK
const safeSDK = new SafeAppsSDK()

/**
 * Initialize Web3 with the provided provider
 * @param {Object} provider - Web3 provider (e.g., window.ethereum)
 */
export const initWeb3 = async (provider) => {
  // Ensure contract addresses are initialized
  if (!GAME_CONTRACT_ADDRESS) {
    await initContractAddresses()
  }

  web3 = new Web3(provider || BASE_RPC_URL)

  // Initialize contract instances
  if (GAME_CONTRACT_ADDRESS) {
    gameContract = new web3.eth.Contract(DTAIOCGameABI.abi, GAME_CONTRACT_ADDRESS)
  }

  if (TOKEN_CONTRACT_ADDRESS) {
    tokenContract = new web3.eth.Contract(DTAIOCTokenABI.abi, TOKEN_CONTRACT_ADDRESS)
  }

  if (STAKING_CONTRACT_ADDRESS) {
    stakingContract = new web3.eth.Contract(DTAIOCStakingABI.abi, STAKING_CONTRACT_ADDRESS)
  }

  if (NFT_CONTRACT_ADDRESS) {
    nftContract = new web3.eth.Contract(DTAIOCNFTABI.abi, NFT_CONTRACT_ADDRESS)
  }

  if (BASENAME_RESOLVER_ADDRESS) {
    basenameResolverContract = new web3.eth.Contract(IBasenameResolverABI.abi, BASENAME_RESOLVER_ADDRESS)
  }

  return web3
}

/**
 * Connect to MetaMask wallet
 * @returns {Promise<Object>} - Connected account info
 */
export const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask extension.")
  }

  try {
    // Initialize Web3 with MetaMask provider
    await initWeb3(window.ethereum)

    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" })

    // Get connected accounts
    const accounts = await web3.eth.getAccounts()

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your MetaMask wallet.")
    }

    // Get network ID to ensure we're on Base
    const networkId = await web3.eth.net.getId()

    return {
      type: "MetaMask",
      address: accounts[0],
      networkId,
    }
  } catch (error) {
    console.error("MetaMask connection error:", error)
    throw new Error(`Failed to connect to MetaMask: ${error.message}`)
  }
}

/**
 * Connect to Safe Wallet
 * @returns {Promise<Object>} - Connected Safe wallet info
 */
export const connectSafe = async () => {
  try {
    // Get Safe info
    const safeInfo = await safeSDK.safe.getInfo()

    // Initialize Web3 with Safe provider
    await initWeb3(window.ethereum) // Safe uses the injected provider

    return {
      type: "Safe",
      address: safeInfo.safeAddress,
      networkId: safeInfo.chainId,
    }
  } catch (error) {
    console.error("Safe wallet connection error:", error)
    throw new Error(`Failed to connect to Safe wallet: ${error.message}`)
  }
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
  if (!tokenContract) {
    await initWeb3(window.ethereum)
    if (!tokenContract) {
      throw new Error("Token contract not initialized")
    }
  }

  try {
    const amountWei = web3.utils.toWei(amount.toString(), "ether")
    const tx = await tokenContract.methods.mint(amountWei).send({ from: address })
    return tx
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
  if (!gameContract) {
    await initWeb3(window.ethereum)
    if (!gameContract) {
      throw new Error("Game contract not initialized")
    }
  }

  try {
    console.log("Creating game with basename:", basename)

    // Calculate the namehash directly
    const basenameNode = calculateNamehash(basename)
    console.log("Calculated namehash:", basenameNode)

    // Convert stake amount to wei
    const stakeAmountWei = web3.utils.toWei(stakeAmount.toString(), "ether")

    // Create game with all parameters
    const tx = await gameContract.methods.createGame(basenameNode).send({ from: address })

    return tx
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
  if (!gameContract) {
    await initWeb3(window.ethereum)
    if (!gameContract) {
      throw new Error("Game contract not initialized")
    }
  }

  try {
    const tx = await gameContract.methods.joinGame(gameId, basename, signature).send({ from: address })
    return tx
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
  if (!gameContract) {
    await initWeb3(window.ethereum)
    if (!gameContract) {
      throw new Error("Game contract not initialized")
    }
  }

  try {
    // Call advanceStage function instead of submitAnswers based on the actual contract
    const tx = await gameContract.methods.advanceStage(gameId).send({ from: address })
    return tx
  } catch (error) {
    console.error("Submit answers error:", error)
    throw new Error(`Failed to submit answers: ${error.message}`)
  }
}

/**
 * Get NFT metadata
 * @param {string} tokenId - NFT token ID
 * @returns {Promise<Object>} - NFT metadata
 */
export const getNFTMetadata = async (tokenId) => {
  if (!nftContract) {
    await initWeb3(window.ethereum)
    if (!nftContract) {
      throw new Error("NFT contract not initialized")
    }
  }

  try {
    const tokenURI = await nftContract.methods.tokenURI(tokenId).call()

    // If tokenURI is an IPFS URI, fetch the metadata
    if (tokenURI.startsWith("ipfs://")) {
      const ipfsHash = tokenURI.replace("ipfs://", "")
      const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`)
      return await response.json()
    }

    // If tokenURI is a direct JSON
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const base64Data = tokenURI.replace("data:application/json;base64,", "")
      const jsonString = atob(base64Data)
      return JSON.parse(jsonString)
    }

    // Otherwise, fetch the URI directly
    const response = await fetch(tokenURI)
    return await response.json()
  } catch (error) {
    console.error("Get NFT metadata error:", error)
    throw new Error(`Failed to get NFT metadata: ${error.message}`)
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
  if (!gameContract) {
    await initWeb3(window.ethereum)
    if (!gameContract) {
      throw new Error("Game contract not initialized")
    }
  }

  try {
    const playerData = await gameContract.methods.getPlayer(gameId, address).call()
    return {
      basename: playerData.basename,
      currentStage: Number(playerData.currentStage),
      score: Number(playerData.score),
      completionTime: Number(playerData.completionTime),
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
  if (!gameContract) {
    await initWeb3(window.ethereum)
    if (!gameContract) {
      throw new Error("Game contract not initialized")
    }
  }

  try {
    const gameData = await gameContract.methods.games(gameId).call()
    return {
      creator: gameData.creator,
      basenameNode: gameData.basenameNode,
      stage: Number(gameData.stage),
      playerCount: Number(gameData.playerCount),
      ended: gameData.ended,
    }
  } catch (error) {
    console.error("Get game data error:", error)
    throw new Error(`Failed to get game data: ${error.message}`)
  }
}

export default {
  initWeb3,
  connectMetaMask,
  connectSafe,
  getTokenBalance,
  mintTokens,
  createGame,
  joinGame,
  submitAnswers,
  getNFTMetadata,
  hasSufficientBalance,
  getPlayerData,
  getGameData,
}
