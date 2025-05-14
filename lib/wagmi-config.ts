"use client"

import { http, createConfig } from "wagmi"
import { base } from "wagmi/chains"

// Create a Wagmi config with the Base chain
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"),
  },
})
