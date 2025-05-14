"use client"

import type { ReactNode } from "react"
import { WagmiConfig, createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a query client
const queryClient = new QueryClient()

// Get the Base RPC URL from environment variables
const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"

// Create a Wagmi config
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(baseRpcUrl),
  },
})

interface WagmiProviderProps {
  children: ReactNode
}

export function WagmiProvider({ children }: WagmiProviderProps) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  )
}
