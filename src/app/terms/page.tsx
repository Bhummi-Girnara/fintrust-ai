import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
            <CardDescription className="text-muted-foreground">
              Last updated: {/* date */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <section>
                <h2 className="font-semibold text-lg">Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using Fintrust‑AI, you agree to comply with these Terms.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Use of the Service</h2>
                <p className="text-muted-foreground">
                  You may use the service for lawful purposes only. You agree not to
                  violate any applicable laws or infringe third‑party rights.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Account Security</h2>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account
                  credentials and for all activities under your account.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Prohibited Conduct</h2>
                <p className="text-muted-foreground">
                  You may not use the platform to transmit any unlawful, harmful, or
                  infringing content, or to engage in fraudulent or abusive behavior.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Disclaimer of Warranties</h2>
                <p className="text-muted-foreground">
                  The service is provided “as is” and “as available” without warranties of
                  any kind, either express or implied.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, Fintrust‑AI shall not be liable
                  for indirect, incidental, special, consequential, or punitive damages.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed by the laws of {/* jurisdiction */},
                  without regard to conflict of law principles.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-lg">Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We may revise these terms from time to time. The effective date of
                  any changes will be posted on this page.
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