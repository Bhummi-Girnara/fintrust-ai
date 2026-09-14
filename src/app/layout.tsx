import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/sonner"
import Footer from "@/components/layout/Footer"
import { FeedbackButton } from "@/components/layout/FeedbackButton"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FinTrust-AI — Digital Payment Redressal",
  description: "AI-powered dispute resolution and compliance tracking for digital payments",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-animate">
            {children}
            <Footer />
            <FeedbackButton />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
