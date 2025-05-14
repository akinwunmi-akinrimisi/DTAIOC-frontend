"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { useWeb3 } from "@/contexts/web3-context"
import { WalletPrompt } from "@/components/wallet-prompt"

interface WalletGateProps {
  children: ReactNode
  message?: string
  showPromptOnly?: boolean
}

export function WalletGate({ children, message, showPromptOnly = false }: WalletGateProps) {
  const { isConnected } = useWeb3()
  const [showPrompt, setShowPrompt] = useState(false)

  // If connected, just show the children
  if (isConnected) {
    return <>{children}</>
  }

  // If not connected and showPromptOnly is true, show only the prompt
  if (showPromptOnly) {
    return <WalletPrompt message={message} />
  }

  // If not connected and showPromptOnly is false, wrap children in a click handler
  return (
    <>
      <div
        onClick={(e) => {
          // Only trigger for buttons and links
          if (
            e.target instanceof HTMLButtonElement ||
            e.target instanceof HTMLAnchorElement ||
            (e.target as HTMLElement).closest("button") ||
            (e.target as HTMLElement).closest("a")
          ) {
            e.preventDefault()
            e.stopPropagation()
            setShowPrompt(true)
          }
        }}
      >
        {children}
      </div>
      {showPrompt && <WalletPrompt message={message} onClose={() => setShowPrompt(false)} />}
    </>
  )
}
