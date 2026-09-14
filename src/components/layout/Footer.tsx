import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-background border-border/40 mt-auto w-full border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Brand Section */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2 transition-colors duration-300">
                <ShieldCheck className="text-primary h-5 w-5" />
              </div>
              <span className="text-foreground text-xl font-bold tracking-tight">Fintrust-AI</span>
            </Link>
            <p className="text-muted-foreground max-w-xs text-center text-sm md:text-left">
              Secure, AI-driven insights and trust management for modern finance.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:justify-end">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors duration-200"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors duration-200"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </nav>
        </div>

        {/* Divider & Copyright */}
        <div className="border-border/40 mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-center text-xs md:text-left">
            &copy; {new Date().getFullYear()} Fintrust-AI. All rights reserved.
          </p>

          {/* Optional: Status or System Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="text-muted-foreground text-xs font-medium">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
