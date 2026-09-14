import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border/200">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-center gap-6 mb-6 text-center md:text-left">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            <ShieldCheck className="h-5 w-5" />
            <span>Fintrust-AI</span>
          </Link>
          <div className="flex flex-wrap gap-4">
            <Link href="/about" className="text-base font-medium text-muted-foreground hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-base font-medium text-muted-foreground hover:text-primary-600 transition-colors">
              Contact
            </Link>
            <Link href="/privacy" className="text-base font-medium text-muted-foreground hover:text-primary-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-base font-medium text-muted-foreground hover:text-primary-600 transition-colors">
              Terms
            </Link>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Fintrust-AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}