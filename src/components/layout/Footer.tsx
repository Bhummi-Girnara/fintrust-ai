import Link from "next/link"

export default function Footer() {
  return (
    <footer className="flex flex-col items-center py-6 px-4 text-sm text-muted-foreground border-t border-border/50">
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <Link href="/" className="hover:underline">
          Fintrust-AI
        </Link>
        <Link href="/about" className="hover:underline">
          About
        </Link>
        <Link href="/contact" className="hover:underline">
          Contact
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>
      </div>
      <p className="text-center">
        &copy; {new Date().getFullYear()} Fintrust-AI. All rights reserved.
      </p>
    </footer>
  )
}