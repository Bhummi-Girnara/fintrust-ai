import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">About Fintrust‑AI</h1>
        <p className="mb-4 text-gray-600">
          Fintrust‑AI is an AI‑powered dispute resolution and compliance tracking platform for digital payments.
          We help banks, fintechs, and consumers resolve payment disputes faster and more transparently.
        </p>
        <p className="text-gray-600">
          Our mission is to bring trust and efficiency to the digital payments ecosystem through intelligent automation,
          secure data handling, and user‑centric design.
        </p>
        <div className="mt-8">
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}