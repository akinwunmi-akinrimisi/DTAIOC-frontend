"use server"

import { ethers } from "ethers"
import DTAIOCTokenABI from "@/abis/DTAIOCToken.json"

// Contract addresses from environment variables (server-side only)
// Using non-public environment variables for sensitive data
const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS
const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS
const BASENAME_RESOLVER_ADDRESS = process.env.BASENAME_RESOLVER_ADDRESS
const BASE_RPC_URL = process.env.BASE_RPC_URL || "https://sepolia.base.org"

// Get contract addresses (safe to expose)
export async function getContractAddresses() {
  return {
    gameContractAddress: GAME_CONTRACT_ADDRESS,
    tokenContractAddress: TOKEN_CONTRACT_ADDRESS,
    stakingContractAddress: STAKING_CONTRACT_ADDRESS,
    nftContractAddress: NFT_CONTRACT_ADDRESS,
    basenameResolverAddress: BASENAME_RESOLVER_ADDRESS,
    baseRpcUrl: BASE_RPC_URL,
  }
}

// Get token balance (server-side)
export async function getTokenBalanceServer(address: string) {
  if (!TOKEN_CONTRACT_ADDRESS || !address) return "0"

  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL)
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, DTAIOCTokenABI.abi, provider)
    const balance = await tokenContract.balanceOf(address)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error("Get token balance error:", error)
    return "0"
  }
}

// Other server-side contract interactions can be added here as needed
