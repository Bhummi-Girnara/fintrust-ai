import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mb-4 text-gray-600">
          Last updated: {/* date */}
        </p>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Information We Collect</h2>
          <p className="text-gray-600">
            We collect personal information you provide directly (such as name, email, phone) and usage data
            (IP address, browser type, pages visited) to provide and improve our services.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">How We Use Your Information</h2>
          <p className="text-gray-600">
            To operate the platform, communicate with you, improve our services, and comply with legal obligations.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sharing and Disclosure</h2>
          <p className="text-gray-600">
            We do not sell your personal information. We may share data with trusted partners who assist in
            operating the platform, under strict confidentiality agreements.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Rights</h2>
          <p className="text-gray-600">
            You may request access, correction, or deletion of your personal data by contacting us at
            <a href="mailto:privacy@fintrust-ai.com" className="text-primary-600 underline">privacy@fintrust-ai.com</a>.
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