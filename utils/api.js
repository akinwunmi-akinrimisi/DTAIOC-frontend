import axios from "axios"

// API base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dtaioc-aimodel-1.onrender.com"

// Enable mock mode by default to handle missing endpoints
const MOCK_MODE = true // Set to true for mock data when API endpoints are not available

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
      errorMessage = error.response.data?.message || `Error: ${error.response.status}`
      console.error("API Error Response:", error.response.status, error.response.data)
    } else if (error.request) {
      // Request made but no response
      errorMessage = "No response from server. Please check your connection."
      console.error("API No Response:", error.request)
    } else {
      // Request setup error
      errorMessage = error.message
      console.error("API Request Error:", error.message)
    }

    // Create enhanced error object
    const enhancedError = new Error(errorMessage)
    enhancedError.originalError = error
    enhancedError.status = error.response ? error.response.status : null

    return Promise.reject(enhancedError)
  },
)

// Mock data for development
const mockGames = [
  {
    id: "1",
    creatorBasename: "creator1.base.eth",
    stakeAmount: 5,
    playerCount: 3,
    playerLimit: 10,
    duration: 24, // hours
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    endsAt: new Date(Date.now() + 86400000), // 24 hours from now
  },
  {
    id: "2",
    creatorBasename: "creator2.base.eth",
    stakeAmount: 10,
    playerCount: 8,
    playerLimit: 10,
    duration: 12, // hours
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    endsAt: new Date(Date.now() + 43200000), // 12 hours from now
  },
  {
    id: "3",
    creatorBasename: "creator3.base.eth",
    stakeAmount: 2,
    playerCount: 5,
    playerLimit: 20,
    duration: 48, // hours
    createdAt: new Date(Date.now() - 10800000), // 3 hours ago
    endsAt: new Date(Date.now() + 172800000), // 48 hours from now
  },
]

// Mock game data with questions
const mockGameData = {
  1: {
    id: "1",
    creatorBasename: "creator1.base.eth",
    stakeAmount: 5,
    playerCount: 3,
    playerLimit: 10,
    duration: 24,
    createdAt: new Date(Date.now() - 3600000),
    endsAt: new Date(Date.now() + 86400000),
    questions: Array(15)
      .fill(null)
      .map((_, i) => ({
        id: `q-${i + 1}`,
        text: `Sample question ${i + 1} about blockchain?`,
        options: [
          `Option A for question ${i + 1}`,
          `Option B for question ${i + 1}`,
          `Option C for question ${i + 1}`,
          `Option D for question ${i + 1}`,
        ],
      })),
  },
}

/**
 * Get token information
 */
export const getTokenInfo = async () => {
  if (MOCK_MODE) {
    return {
      name: "DTriviaAIOnChain",
      decimals: 18,
      maxSupply: "1000000000000000000000000",
    }
  }

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
  if (MOCK_MODE) {
    return "1000.0"
  }

  try {
    const response = await api.get(`/contract/0x8Bf1D7Cf18215572710B1F2e560d38397Fe9ed3c/balanceOf?owner=${address}`)
    return response.data
  } catch (error) {
    console.error("API get token balance error:", error)
    return "0.0"
  }
}

/**
 * Mint tokens
 */
export const mintTokens = async (address, amount) => {
  if (MOCK_MODE) {
    return { success: true, txHash: "0x" + Math.random().toString(16).substring(2, 66) }
  }

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
  if (MOCK_MODE) {
    console.log("Mock mode: Creating game", data)
    // Generate mock question hashes (15 hashes for 15 questions)
    const questionHashes = Array(15)
      .fill(0)
      .map(
        (_, i) =>
          `0x${Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")}`,
      )

    return {
      id: `${mockGames.length + 1}`,
      creatorBasename: data.basename,
      stakeAmount: data.stakeAmount,
      playerLimit: data.playerLimit,
      duration: data.duration / 3600, // Convert seconds to hours
      questionHashes: questionHashes,
    }
  }

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
  if (MOCK_MODE) {
    console.log("Mock mode: Getting games")
    return mockGames
  }

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
  if (MOCK_MODE) {
    console.log(`Mock mode: Getting game ${gameId}`)
    return (
      mockGameData[gameId] || {
        id: gameId,
        creatorBasename: "unknown.base.eth",
        stakeAmount: 5,
        playerCount: 3,
        playerLimit: 10,
        duration: 24,
        createdAt: new Date(Date.now() - 3600000),
        endsAt: new Date(Date.now() + 86400000),
        questions: Array(15)
          .fill(null)
          .map((_, i) => ({
            id: `q-${i + 1}`,
            text: `Sample question ${i + 1} about blockchain?`,
            options: [
              `Option A for question ${i + 1}`,
              `Option B for question ${i + 1}`,
              `Option C for question ${i + 1}`,
              `Option D for question ${i + 1}`,
            ],
          })),
      }
    )
  }

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
  if (MOCK_MODE) {
    console.log(`Mock mode: Joining game ${gameId}`, data)
    return {
      signature: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    }
  }

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
  if (MOCK_MODE) {
    console.log(`Mock mode: Submitting answers for game ${gameId}`, data)
    // Randomly determine if the answer is correct (80% chance of being correct)
    const isCorrect = Math.random() < 0.8
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
    }
  }

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
  if (MOCK_MODE) {
    console.log(`Mock mode: Getting leaderboard for game ${gameId}`)
    return Array(10)
      .fill(null)
      .map((_, i) => ({
        id: `player-${i + 1}`,
        basename: `user${Math.floor(Math.random() * 1000)}.base.eth`,
        stage: Math.min(3, Math.floor(Math.random() * 3) + 1),
        question: Math.floor(Math.random() * 5),
        completionTime: Math.floor(Math.random() * 300) + 60,
        rank: i < 3 ? i + 1 : undefined,
      }))
  }

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
  if (MOCK_MODE) {
    console.log("Mock mode: Linking basename", data)

    // In mock mode, just return a successful response with the basename
    const mockBasename = `${data.twitterUsername}.base.eth`

    // Store in localStorage for persistence
    try {
      const walletData = JSON.parse(localStorage.getItem("walletData") || "{}")
      walletData.basename = mockBasename
      localStorage.setItem("walletData", JSON.stringify(walletData))
    } catch (err) {
      console.error("Error storing basename in localStorage:", err)
    }

    return {
      address: data.address,
      twitterUsername: data.twitterUsername,
      basename: mockBasename,
    }
  }

  try {
    // Check if the endpoint exists by making a test request
    try {
      await api.options("/basenames/link")
    } catch (optionsError) {
      console.warn("Basename API endpoint may not exist, falling back to mock implementation")

      // Fall back to mock implementation
      const mockBasename = `${data.twitterUsername}.base.eth`

      // Store in localStorage for persistence
      try {
        const walletData = JSON.parse(localStorage.getItem("walletData") || "{}")
        walletData.basename = mockBasename
        localStorage.setItem("walletData", JSON.stringify(walletData))
      } catch (err) {
        console.error("Error storing basename in localStorage:", err)
      }

      return {
        address: data.address,
        twitterUsername: data.twitterUsername,
        basename: mockBasename,
      }
    }

    // If we get here, the endpoint exists
    const response = await api.post("/basenames/link", {
      address: data.address,
      twitterUsername: data.twitterUsername,
    })

    return response.data
  } catch (error) {
    console.error("API link basename error:", error)

    // Fall back to mock implementation on error
    const mockBasename = `${data.twitterUsername}.base.eth`

    // Store in localStorage for persistence
    try {
      const walletData = JSON.parse(localStorage.getItem("walletData") || "{}")
      walletData.basename = mockBasename
      localStorage.setItem("walletData", JSON.stringify(walletData))
    } catch (err) {
      console.error("Error storing basename in localStorage:", err)
    }

    return {
      address: data.address,
      twitterUsername: data.twitterUsername,
      basename: mockBasename,
    }
  }
}

/**
 * Create a new basename
 */
export const createBasename = async (data) => {
  if (MOCK_MODE) {
    console.log("Mock mode: Creating basename", data)

    // In mock mode, just return a successful response with the basename
    const mockBasename = `${data.basename}.base.eth`

    // Store in localStorage for persistence
    try {
      const walletData = JSON.parse(localStorage.getItem("walletData") || "{}")
      walletData.basename = mockBasename
      localStorage.setItem("walletData", JSON.stringify(walletData))
    } catch (err) {
      console.error("Error storing basename in localStorage:", err)
    }

    return {
      address: data.address,
      basename: mockBasename,
    }
  }

  try {
    // Check if the endpoint exists by making a test request
    try {
      await api.options("/basenames/create")
    } catch (optionsError) {
      console.warn("Basename API endpoint may not exist, falling back to mock implementation")

      // Fall back to mock implementation
      const mockBasename = `${data.basename}.base.eth`

      // Store in localStorage for persistence
      try {
        const walletData = JSON.parse(localStorage.getItem("walletData") || "{}")
        walletData.basename = mockBasename
        localStorage.setItem("walletData", JSON.stringify(walletData))
      } catch (err) {
        console.error("Error storing basename in localStorage:", err)
      }

      return {
        address: data.address,
        basename: mockBasename,
      }
    }

    // If we get here, the endpoint exists
    const response = await api.post("/basenames/create", {
      address: data.address,
      basename: data.basename,
    })

    return response.data
  } catch (error) {
    console.error("API create basename error:", error)

    // Fall back to mock implementation on error
    const mockBasename = `${data.basename}.base.eth`

    // Store in localStorage for persistence
    try {
      const walletData = JSON.parse(localStorage.getItem("walletData") || "{}")
      walletData.basename = mockBasename
      localStorage.setItem("walletData", JSON.stringify(walletData))
    } catch (err) {
      console.error("Error storing basename in localStorage:", err)
    }

    return {
      address: data.address,
      basename: mockBasename,
    }
  }
}

/**
 * Get basename for an address
 */
export const getBasenameForAddress = async (address) => {
  if (MOCK_MODE) {
    // Try to get from localStorage first
    try {
      const walletData = JSON.parse(localStorage.getItem("walletData") || "{}")
      if (walletData.basename) {
        return walletData.basename
      }
    } catch (err) {
      console.error("Error getting basename from localStorage:", err)
    }

    // Generate a mock basename if not found
    return `user${Math.floor(Math.random() * 10000)}.base.eth`
  }

  try {
    // Check if the endpoint exists by making a test request
    try {
      await api.options(`/basenames/address/${address}`)
    } catch (optionsError) {
      console.warn("Basename API endpoint may not exist, falling back to mock implementation")

      // Try to get from localStorage first
      try {
        const walletData = JSON.parse(localStorage.getItem("walletData") || "{}")
        if (walletData.basename) {
          return walletData.basename
        }
      } catch (err) {
        console.error("Error getting basename from localStorage:", err)
      }

      // Generate a mock basename if not found
      return `user${Math.floor(Math.random() * 10000)}.base.eth`
    }

    // If we get here, the endpoint exists
    const response = await api.get(`/basenames/address/${address}`)
    return response.data.basename
  } catch (error) {
    console.error("API get basename for address error:", error)

    // Try to get from localStorage first
    try {
      const walletData = JSON.parse(localStorage.getItem("walletData") || "{}")
      if (walletData.basename) {
        return walletData.basename
      }
    } catch (err) {
      console.error("Error getting basename from localStorage:", err)
    }

    // Return null if not found
    return null
  }
}

/**
 * Get address for a basename
 */
export const getAddressForBasename = async (basename) => {
  if (MOCK_MODE) {
    // Generate a mock address
    return `0x${Array(40)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`
  }

  try {
    // Check if the endpoint exists by making a test request
    try {
      await api.options(`/basenames/${basename}`)
    } catch (optionsError) {
      console.warn("Basename API endpoint may not exist, falling back to mock implementation")

      // Generate a mock address
      return `0x${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`
    }

    // If we get here, the endpoint exists
    const response = await api.get(`/basenames/${basename}`)
    return response.data.address
  } catch (error) {
    console.error("API get address for basename error:", error)

    // Return null if not found
    return null
  }
}

/**
 * Generate questions from Twitter username
 */
export const generateQuestions = async (twitterUsername) => {
  if (MOCK_MODE) {
    console.log("Mock mode: Generating questions for", twitterUsername)
    return Array(15)
      .fill(null)
      .map((_, i) => ({
        text: `Sample question ${i + 1} about ${twitterUsername}'s Twitter activity?`,
        options: [
          `Option A for question ${i + 1}`,
          `Option B for question ${i + 1}`,
          `Option C for question ${i + 1}`,
          `Option D for question ${i + 1}`,
        ],
        correctOption: Math.floor(Math.random() * 4),
      }))
  }

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
