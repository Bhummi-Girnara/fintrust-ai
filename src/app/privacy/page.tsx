import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
            <CardDescription className="text-muted-foreground">
              Last updated: {/* date */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <section>
                <h2 className="font-semibold text-lg">Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect personal information you provide directly (such as name, email, phone) and usage data
                  (IP address, browser type, pages visited) to provide and improve our services.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">How We Use Your Information</h2>
                <p className="text-muted-foreground">
                  To operate the platform, communicate with you, improve our services, and comply with legal obligations.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Sharing and Disclosure</h2>
                <p className="text-muted-foreground">
                  We do not sell your personal information. We may share data with trusted partners who assist in
                  operating the platform, under strict confidentiality agreements.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Your Rights</h2>
                <p className="text-muted-foreground">
                  You may request access, correction, or deletion of your personal data by contacting us at
                  <a href="mailto:privacy@fintrust-ai.com" className="underline hover:text-primary-600">
                    privacy@fintrust-ai.com
                  </a>.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Data Security</h2>
                <p className="text-muted-foreground">
                  We employ industry‑standard technical and organizational measures to protect your data against
                  unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting
                  the new policy on this page.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}