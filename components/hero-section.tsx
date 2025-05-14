"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"
import { BasenameModal } from "@/components/basename-modal"
import { Trophy, Brain, Coins, Twitter, ChevronRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [isConnected, setIsConnected] = useState(false)
  const [showBasenameModal, setShowBasenameModal] = useState(false)
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleConnect = ({ address, basename }: { address: string; basename?: string }) => {
    setIsConnected(true)
    if (!basename) {
      setShowBasenameModal(true)
    }
  }

  return (
    <div className="relative overflow-hidden bg-game-dark min-h-[calc(100vh-4rem)]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-game-primary opacity-10 rounded-full filter blur-3xl animate-float"></div>
        <div
          className="absolute top-20 -left-20 w-60 h-60 bg-game-secondary opacity-10 rounded-full filter blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-10 right-10 w-40 h-40 bg-game-accent opacity-10 rounded-full filter blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 flex flex-col lg:flex-row items-center">
        <div
          className={`w-full lg:w-1/2 transition-all duration-1000 transform ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="block text-white">Play Trivia,</span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary">
              Earn NFTs!
            </span>
          </h1>

          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            DTriviaAIOnChain is a Web3-based trivia game that generates personalized questions from your Twitter
            activity. Stake tokens, answer questions, and win NFT rewards on the Base blockchain!
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            {!isConnected ? (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-game-primary to-game-secondary rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                <WalletConnect />
              </div>
            ) : (
              <Button
                onClick={() => router.push("/marketplace")}
                className="bg-gradient-to-r from-game-primary to-game-secondary hover:shadow-neon text-white font-medium py-6 px-8 rounded-lg transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Gamepad2 className="mr-2 h-5 w-5" />
                Explore Games
              </Button>
            )}
            <Button
              variant="outline"
              className="border-game-dark-border bg-game-dark-lighter hover:bg-game-dark-accent text-white py-6 px-8 rounded-lg"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-game-primary/20 flex items-center justify-center">
                <Twitter className="h-4 w-4 text-game-primary" />
              </div>
              <span>Twitter-Based Questions</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-game-secondary/20 flex items-center justify-center">
                <Brain className="h-4 w-4 text-game-secondary" />
              </div>
              <span>AI-Powered Trivia</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-game-accent/20 flex items-center justify-center">
                <Coins className="h-4 w-4 text-game-accent" />
              </div>
              <span>Token Staking</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-game-highlight/20 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-game-highlight" />
              </div>
              <span>NFT Rewards</span>
            </div>
          </div>
        </div>

        <div
          className={`w-full lg:w-1/2 mt-12 lg:mt-0 transition-all duration-1000 transform ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r from-game-primary to-game-secondary rounded-2xl blur-xl opacity-20 animate-pulse-slow"></div>
            <div className="relative bg-game-dark-card border border-game-dark-border rounded-2xl shadow-game-card overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Featured Game</h3>
                  <div className="bg-game-dark-accent px-2 py-1 rounded-md text-xs font-medium text-gray-300">
                    Live Now
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-game-primary to-game-secondary flex items-center justify-center">
                        <span className="text-white font-bold">CB</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Crypto Basics</p>
                        <p className="text-xs text-gray-400">by crypto_master.base.eth</p>
                      </div>
                    </div>
                    <div className="bg-game-dark-lighter px-2 py-1 rounded-md text-xs font-medium text-white">
                      5 DTAIOC
                    </div>
                  </div>

                  <div className="bg-game-dark-lighter rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Players</span>
                      <span className="text-sm font-medium text-white">12/30</span>
                    </div>
                    <div className="w-full bg-game-dark-accent rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-game-primary to-game-secondary h-2 rounded-full"
                        style={{ width: "40%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Clock className="h-4 w-4 text-game-secondary" />
                      <span>Ends in 2h 45m</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Trophy className="h-4 w-4 text-game-primary" />
                      <span>Top 3 win NFTs</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-gradient-to-r from-game-primary to-game-secondary hover:shadow-neon text-white font-medium rounded-lg transition-all duration-300 hover:scale-105"
                  onClick={() => router.push("/marketplace")}
                >
                  Join Game
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="bg-game-dark-accent border-t border-game-dark-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-game-primary to-game-secondary p-0.5"
                      >
                        <div className="w-full h-full rounded-full bg-game-dark-accent flex items-center justify-center">
                          <span className="text-xs font-medium text-white">{String.fromCharCode(65 + i)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-game-dark-lighter flex items-center justify-center text-xs font-medium text-white">
                      +8
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">12 players active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBasenameModal && <BasenameModal onClose={() => setShowBasenameModal(false)} />}
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-game-dark-card border border-game-dark-border p-4 rounded-lg shadow-game-card hover:shadow-neon transition-all duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-game-dark-lighter flex items-center justify-center mb-3">{icon}</div>
        <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
    </div>
  )
}

function Clock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function Gamepad2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <rect x="2" y="6" width="20" height="12" rx="2" />
    </svg>
  )
}
