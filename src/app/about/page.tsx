import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold">About Fintrust‑AI</CardTitle>
            <CardDescription className="text-muted-foreground">
              Empowering digital payments with AI‑driven dispute resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Fintrust‑AI is an AI‑powered dispute resolution and compliance tracking platform for digital payments.
              We help banks, fintechs, and consumers resolve payment disputes faster and more transparently.
            </p>
            <p className="mb-4">
              Our mission is to bring trust and efficiency to the digital payments ecosystem through intelligent automation,
              secure data handling, and user‑centric design.
            </p>
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">How we work</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Users file a dispute through our secure portal.
                </li>
                <li>
                  Our AI engine classifies the issue, predicts fraud risk, and suggests the best routing authority.
                </li>
                <li>
                  Human jurors review complex cases, providing balanced verdicts.
                </li>
                <li>
                  Audit trails ensure transparency and compliance at every step.
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}