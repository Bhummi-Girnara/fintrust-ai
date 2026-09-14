"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CheckCircle, Loader2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackFormValues {
  rating: number
  comment: string
  category: string
}

export function FeedbackButton() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FeedbackFormValues>({
    rating: 5,
    comment: "",
    category: "GENERAL",
  })

  const categories = [
    { label: "UI / UX", value: "UI" },
    { label: "Feature Request", value: "FEATURE_REQUEST" },
    { label: "Bug Report", value: "BUG" },
    { label: "General Feedback", value: "GENERAL" },
    { label: "Performance", value: "PERFORMANCE" },
    { label: "Other", value: "OTHER" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: form.rating,
          comment: form.comment.trim(),
          category: form.category,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to submit feedback")
      }
      toast.success("Thank you for your feedback!")
      setForm({ rating: 5, comment: "", category: "GENERAL" })
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-50 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
        aria-label="Open feedback form"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-md sm:max-w-lg">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold">We’d love your feedback</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Help us improve Fintrust‑AI by sharing your thoughts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rating</label>
              <div className="flex flex-row">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rating: r }))}
                    className={cn(
                      "flex-1 h-10 px-2 py-1 border border-gray-300 rounded-md",
                      form.rating >= r
                        ? "bg-primary-600 text-white"
                        : "bg-background hover:bg-muted"
                    )}
                    aria-label={`Rate ${r} stars`}
                  >
                    {[...Array(r)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400" />
                    ))}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category">{form.category}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Comment (optional)</label>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="What did you like or what could we improve?"
                className="h-32"
                disabled={loading}
              />
            </div>
          </form>

          <DialogFooter className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !user}
              className="ml-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Helper component for star rating
function Star({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 text-yellow-400", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}