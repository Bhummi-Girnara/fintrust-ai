import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mb-4 text-gray-600">
          Last updated: {/* date */}
        </p>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Acceptance of Terms</h2>
          <p className="text-gray-600">
            By accessing or using Fintrust‑AI, you agree to comply with these Terms.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Use of the Service</h2>
          <p className="text-gray-600">
            You may use the service for lawful purposes only. You agree not to
            violate any applicable laws or infringe third‑party rights.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Account Security</h2>
          <p className="text-gray-600">
            You are responsible for maintaining the confidentiality of your account
            credentials and for all activities under your account.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Limitation of Liability</h2>
          <p className="text-gray-600">
            To the maximum extent permitted by law, Fintrust‑AI shall not be liable
            for indirect, incidental, special, consequential, or punitive damages.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Governing Law</h2>
          <p className="text-gray-600">
            These Terms shall be governed by the laws of {/* jurisdiction */},
            without regard to conflict of law principles.
          </p>
        </section>
        <div className="mt-8">
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}