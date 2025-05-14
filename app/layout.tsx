import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Web3Provider } from "@/contexts/web3-context"
import { Toaster } from "@/components/ui/toaster"
import { WalletGate } from "@/components/wallet-gate"
import { WagmiProvider } from "@/components/providers/wagmi-provider"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${inter.className} h-full bg-game-dark text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <WagmiProvider>
            <Web3Provider>
              <SidebarProvider>
                <div className="min-h-screen w-full bg-game-dark">
                  <WalletGate>{children}</WalletGate>
                </div>
              </SidebarProvider>
              <Toaster />
            </Web3Provider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
