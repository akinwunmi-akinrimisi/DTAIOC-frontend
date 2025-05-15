"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWeb3 } from "@/contexts/web3-context"
import { WalletPrompt } from "@/components/wallet-prompt"

interface WalletGateProps {
  children: ReactNode
  message?: string
  showPromptOnly?: boolean
  requireWallet?: boolean
}

export function WalletGate({ children, message, showPromptOnly = false, requireWallet = true }: WalletGateProps) {
  const { isConnected } = useWeb3()
  const [showPrompt, setShowPrompt] = useState(false)
  const router = useRouter()

  // If not requiring wallet connection, just show the children
  if (!requireWallet) {
    return <>{children}</>
  }

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
          // Find the closest anchor or button element
          const target = e.target as HTMLElement
          const clickableElement =
            target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")

          if (clickableElement) {
            e.preventDefault()
            e.stopPropagation()

            // Get the href if it's an anchor
            const href =
              clickableElement.tagName === "A"
                ? (clickableElement as HTMLAnchorElement).href
                : clickableElement.closest("a")
                  ? (clickableElement.closest("a") as HTMLAnchorElement).href
                  : null

            // Store the intended destination for after wallet connection
            if (href) {
              try {
                const url = new URL(href)
                if (url.origin === window.location.origin) {
                  localStorage.setItem("dtaioc_intended_route", url.pathname)
                }
              } catch (err) {
                console.error("Error parsing URL:", err)
              }
            }

            setShowPrompt(true)
          }
        }}
      >
        {children}
      </div>
      {showPrompt && (
        <WalletPrompt
          message={message || "Please connect your wallet to continue"}
          onClose={() => setShowPrompt(false)}
          onConnect={() => {
            // After successful connection, navigate to the intended route if any
            const intendedRoute = localStorage.getItem("dtaioc_intended_route")
            if (intendedRoute) {
              localStorage.removeItem("dtaioc_intended_route")
              router.push(intendedRoute)
            }
          }}
        />
      )}
    </>
  )
}
