import axios from "axios"

// API base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dtaioc-aimodel-1.onrender.com"

// Add this at the top of the file, after the imports
// Mock data for development when API is not available
const MOCK_MODE = true // Set to false when API is working

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
 * Create a new game
 * @param {Object} data - Game creation data
 * @returns {Promise<Object>} - Created game data
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
    })
    return response.data
  } catch (error) {
    console.error("API create game error:", error)
    throw error
  }
}

/**
 * Get list of games
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} - List of games
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
 * @param {string} gameId - Game ID
 * @returns {Promise<Object>} - Game data
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
 * @param {string} gameId - Game ID
 * @param {Object} data - Join data (address, basename)
 * @returns {Promise<Object>} - Join response with signature
 */
export const joinGame = async (gameId, data) => {
  if (MOCK_MODE) {
    console.log(`Mock mode: Joining game ${gameId}`, data)
    return {
      signature: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    }
  }

  try {
    const response = await api.post(`/games/${gameId}/join`, data)
    return response.data
  } catch (error) {
    console.error(`API join game ${gameId} error:`, error)
    throw error
  }
}

/**
 * Submit answers for a game
 * @param {string} gameId - Game ID
 * @param {Object} data - Answer data (stage, answerHashes)
 * @returns {Promise<Object>} - Submission response with score
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
      stage: data.stage,
      answerHashes: [data.selectedOption], // Convert to array of answer hashes
    })
    return response.data
  } catch (error) {
    console.error(`API submit answers for game ${gameId} error:`, error)
    throw error
  }
}

/**
 * Get leaderboard for a game
 * @param {string} gameId - Game ID
 * @returns {Promise<Array>} - Leaderboard data
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
 * @param {Object} data - Basename data (address, twitterUsername, basename)
 * @returns {Promise<Object>} - Link response
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
    // In a real implementation, this would call the API to link the basename
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
 * @param {Object} data - Basename data (address, basename)
 * @returns {Promise<Object>} - Creation response
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
    // In a real implementation, this would call the API to create the basename
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
 * Generate questions from Twitter username
 * @param {string} twitterUsername - Twitter username
 * @returns {Promise<Array>} - Generated questions
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
    // First, we need to authenticate the user with Twitter
    window.location.href = `${API_URL}/auth/login?username=${twitterUsername}`

    // This will redirect to Twitter for authentication
    // After authentication, the user will be redirected back to the callback URL
    // The questions will be generated server-side

    // Since this is a redirect, we don't return anything here
    return new Promise(() => {}) // Never resolves since we're redirecting
  } catch (error) {
    console.error("API generate questions error:", error)
    throw error
  }
}

export const createBasenameOld = async (data) => {
  if (MOCK_MODE) {
    console.log("Mock mode: Creating basename", data)
    return {
      address: data.address,
      basename: `${data.basename}.base.eth`,
    }
  }

  try {
    // In a real implementation, this would call the Base Registrar API
    // For now, we'll redirect to the Base Registrar website
    window.open(`https://www.basename.app/register?name=${data.basename}`, "_blank")

    // Return a mock response
    return {
      address: data.address,
      basename: `${data.basename}.base.eth`,
    }
  } catch (error) {
    console.error("API create basename error:", error)
    throw error
  }
}

export default {
  createGame,
  getGames,
  getGame,
  joinGame,
  submitAnswers,
  getLeaderboard,
  linkBasename,
  generateQuestions,
  createBasename,
}
