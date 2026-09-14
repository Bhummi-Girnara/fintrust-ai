"use client"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLoading(false)
    toast.success("Your message has been sent! We'll get back to you soon.")
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="from-primary-50 min-h-screen bg-gradient-to-r to-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold">Contact Us</CardTitle>
            <CardDescription className="text-muted-foreground">
              Have questions, feedback, or need support? Reach out to us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">Name</label>
                <Input placeholder="Your full name" required disabled={loading} />
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">Email</label>
                <Input type="email" placeholder="you@example.com" required disabled={loading} />
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">Message</label>
                <Textarea
                  placeholder="How can we help you?"
                  required
                  disabled={loading}
                  className="h-48"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <>Sending…</> : <span>Send Message</span>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
