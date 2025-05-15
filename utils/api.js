import axios from "axios"

// API base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dtaioc-aimodel-1.onrender.com"

// Mock mode for development when API is not available
const MOCK_MODE = false // Set to false to use the real API

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Format error message
    let errorMessage = "An unexpected error occurred"

    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data.message || `Error: ${error.response.status}`
    } else if (error.request) {
      // Request made but no response
      errorMessage = "No response from server. Please check your connection."
    } else {
      // Request setup error
      errorMessage = error.message
    }

    // Create enhanced error object
    const enhancedError = new Error(errorMessage)
    enhancedError.originalError = error
    enhancedError.status = error.response ? error.response.status : null

    return Promise.reject(enhancedError)
  },
)

/**
 * Get token information
 */
export const getTokenInfo = async () => {
  try {
    const [nameResponse, decimalsResponse, maxSupplyResponse] = await Promise.all([
      api.get("/contract/0x8Bf1D7Cf18215572710B1F2e560d38397Fe9ed3c/name"),
      api.get("/contract/0x8Bf1D7Cf18215572710B1F2e560d38397Fe9ed3c/decimals"),
      api.get("/contract/0x8Bf1D7Cf18215572710B1F2e560d38397Fe9ed3c/MAX_SUPPLY"),
    ])

    return {
      name: nameResponse.data,
      decimals: decimalsResponse.data,
      maxSupply: maxSupplyResponse.data,
    }
  } catch (error) {
    console.error("API get token info error:", error)
    throw error
  }
}

/**
 * Get token balance for an address
 */
export const getTokenBalance = async (address) => {
  try {
    const response = await api.get(`/contract/0x8Bf1D7Cf18215572710B1F2e560d38397Fe9ed3c/balanceOf?owner=${address}`)
    return response.data
  } catch (error) {
    console.error("API get token balance error:", error)
    throw error
  }
}

/**
 * Mint tokens
 */
export const mintTokens = async (address, amount) => {
  try {
    const response = await api.post("/contract/0x8Bf1D7Cf18215572710B1F2e560d38397Fe9ed3c/mint", {
      to: address,
      amount: amount,
    })
    return response.data
  } catch (error) {
    console.error("API mint tokens error:", error)
    throw error
  }
}

/**
 * Create a new game
 */
export const createGame = async (data) => {
  try {
    const response = await api.post("/games", {
      basename: data.basename,
      stakeAmount: data.stakeAmount,
      playerLimit: data.playerLimit,
      duration: data.duration,
      username: data.twitterUsername,
      questions: data.questions,
    })
    return response.data
  } catch (error) {
    console.error("API create game error:", error)
    throw error
  }
}

/**
 * Get list of games
 */
export const getGames = async (params = {}) => {
  try {
    const response = await api.get("/games", { params })
    return response.data
  } catch (error) {
    console.error("API get games error:", error)
    throw error
  }
}

/**
 * Get a specific game by ID
 */
export const getGame = async (gameId) => {
  try {
    const response = await api.get(`/games/${gameId}`)
    return response.data
  } catch (error) {
    console.error(`API get game ${gameId} error:`, error)
    throw error
  }
}

/**
 * Join a game
 */
export const joinGame = async (gameId, data) => {
  try {
    const response = await api.post(`/games/${gameId}/join`, {
      address: data.address,
      basename: data.basename,
    })
    return response.data
  } catch (error) {
    console.error(`API join game ${gameId} error:`, error)
    throw error
  }
}

/**
 * Submit answers for a game
 */
export const submitAnswers = async (gameId, data) => {
  try {
    const response = await api.post(`/games/${gameId}/submit`, {
      address: data.address,
      basename: data.basename,
      stage: data.stage,
      answers: data.answers,
    })
    return response.data
  } catch (error) {
    console.error(`API submit answers for game ${gameId} error:`, error)
    throw error
  }
}

/**
 * Get leaderboard for a game
 */
export const getLeaderboard = async (gameId) => {
  try {
    const response = await api.get(`/games/${gameId}/leaderboard`)
    return response.data
  } catch (error) {
    console.error(`API get leaderboard for game ${gameId} error:`, error)
    throw error
  }
}

/**
 * Link a basename to a wallet address
 */
export const linkBasename = async (data) => {
  try {
    const response = await api.post("/basenames/link", {
      address: data.address,
      twitterUsername: data.twitterUsername,
    })
    return response.data
  } catch (error) {
    console.error("API link basename error:", error)
    throw error
  }
}

/**
 * Create a new basename
 */
export const createBasename = async (data) => {
  try {
    const response = await api.post("/basenames/create", {
      address: data.address,
      basename: data.basename,
    })
    return response.data
  } catch (error) {
    console.error("API create basename error:", error)
    throw error
  }
}

/**
 * Get basename for an address
 */
export const getBasenameForAddress = async (address) => {
  try {
    const response = await api.get(`/basenames/address/${address}`)
    return response.data.basename
  } catch (error) {
    console.error("API get basename for address error:", error)
    throw error
  }
}

/**
 * Get address for a basename
 */
export const getAddressForBasename = async (basename) => {
  try {
    const response = await api.get(`/basenames/${basename}`)
    return response.data.address
  } catch (error) {
    console.error("API get address for basename error:", error)
    throw error
  }
}

/**
 * Generate questions from Twitter username
 */
export const generateQuestions = async (twitterUsername) => {
  try {
    const response = await api.post("/questions/generate", {
      username: twitterUsername,
    })
    return response.data
  } catch (error) {
    console.error("API generate questions error:", error)
    throw error
  }
}

export default {
  getTokenInfo,
  getTokenBalance,
  mintTokens,
  createGame,
  getGames,
  getGame,
  joinGame,
  submitAnswers,
  getLeaderboard,
  linkBasename,
  createBasename,
  getBasenameForAddress,
  getAddressForBasename,
  generateQuestions,
}

export { api }
