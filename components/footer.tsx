import Link from "next/link"
import { Twitter, Github, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-game-dark-accent border-t border-game-dark-border w-full">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link href="https://twitter.com" className="text-gray-400 hover:text-game-primary transition-colors">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href="https://github.com" className="text-gray-400 hover:text-game-primary transition-colors">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </Link>
            <Link href="https://base.org" className="text-gray-400 hover:text-game-primary transition-colors">
              <span className="sr-only">Base Blockchain</span>
              <ExternalLink className="h-6 w-6" />
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} DTriviaAIOnChain. All rights reserved.
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-center md:justify-start space-x-6 text-sm text-gray-400">
          <Link href="/docs" className="hover:text-game-primary transition-colors">
            Documentation
          </Link>
          <Link href="/privacy" className="hover:text-game-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-game-primary transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  )
}
