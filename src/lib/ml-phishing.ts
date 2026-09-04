/**
 * Module 6 — URL/QR Phishing Analysis
 * Tool: LogisticRegression via scikit-learn, served via FastAPI
 * Train: YES — trained on phishing URL datasets
 * Endpoint: POST /predict/phishing
 *
 * Features extracted from the URL before sending to the model:
 * - url_length
 * - has_ip_address (bool)
 * - num_dots
 * - num_hyphens
 * - num_at_symbols
 * - has_https (bool)
 * - num_subdomains
 * - has_suspicious_tld (bool — .tk, .ml, .ga, .cf, .gq etc.)
 * - has_url_shortener (bool — bit.ly, tinyurl etc.)
 * - num_special_chars
 * - has_redirect_pattern (bool — multiple http:// in one URL)
 * - domain_length
 */

export interface PhishingFeatures {
  url: string
}

export interface PhishingPrediction {
  verdict:       "SAFE" | "SUSPICIOUS" | "DANGEROUS"
  probability:   number          // probability of being phishing (0.0-1.0)
  is_phishing:   boolean
  features:      Record<string, number | boolean>
  model:         string
  source:        "ML_MODEL" | "FALLBACK"
  explanation:   string[]        // human-readable reasons
}

const SUSPICIOUS_TLDS    = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".click", ".link", ".work", ".party"]
const URL_SHORTENERS     = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "adf.ly", "short.io"]
const SUSPICIOUS_KEYWORDS = ["login", "verify", "account", "secure", "update", "confirm", "banking", "password", "otp", "kyc", "aadhaar"]

function extractURLFeatures(url: string): Record<string, number> {
  let cleanUrl = url
  try {
    cleanUrl = decodeURIComponent(url)
  } catch {}

  const urlLower   = cleanUrl.toLowerCase()
  let parsedUrl: URL | null = null
  try { parsedUrl = new URL(cleanUrl) } catch {}

  const domain        = parsedUrl?.hostname ?? ""
  const domainParts   = domain.split(".")
  const tld           = "." + (domainParts.at(-1) ?? "")
  const subdomains    = Math.max(0, domainParts.length - 2)

  return {
    url_length:             cleanUrl.length,
    has_ip_address:         /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain) ? 1 : 0,
    num_dots:               (cleanUrl.match(/\./g) ?? []).length,
    num_hyphens:            (cleanUrl.match(/-/g) ?? []).length,
    num_at_symbols:         (cleanUrl.match(/@/g) ?? []).length,
    has_https:              cleanUrl.startsWith("https") ? 1 : 0,
    num_subdomains:         subdomains,
    has_suspicious_tld:     SUSPICIOUS_TLDS.some(t => tld === t) ? 1 : 0,
    has_url_shortener:      URL_SHORTENERS.some(s => urlLower.includes(s)) ? 1 : 0,
    num_special_chars:      (cleanUrl.match(/[!@#$%^&*()=+[\]{};:'"<>,?]/g) ?? []).length,
    has_redirect_pattern:   (urlLower.match(/https?:\/\//g) ?? []).length > 1 ? 1 : 0,
    domain_length:          domain.length,
    has_suspicious_keyword: SUSPICIOUS_KEYWORDS.some(k => urlLower.includes(k)) ? 1 : 0,
  }
}

function buildExplanation(features: Record<string, number>): string[] {
  const reasons: string[] = []
  if (features.has_ip_address)          reasons.push("URL uses an IP address instead of a domain name")
  if (features.has_suspicious_tld)       reasons.push("Domain uses a free or suspicious TLD")
  if (features.has_url_shortener)        reasons.push("URL uses a shortening service that hides the real destination")
  if (features.has_redirect_pattern)     reasons.push("URL contains multiple redirect chains")
  if (features.num_subdomains > 3)       reasons.push("Excessive number of subdomains (common in phishing)")
  if (features.url_length > 75)          reasons.push("URL is unusually long")
  if (!features.has_https)               reasons.push("URL does not use HTTPS")
  if (features.num_hyphens > 4)          reasons.push("Multiple hyphens in the domain (common spoofing pattern)")
  if (features.has_suspicious_keyword)   reasons.push("URL contains sensitive keywords like login, verify, or kyc")
  if (features.num_at_symbols > 0)       reasons.push("URL contains @ symbol which can mask the real destination")
  return reasons
} 

export async function analyzePhishingURL(url: string): Promise<PhishingPrediction> {
  const baseUrl   = process.env.ML_PHISHING_ANALYSIS_URL
  const apiSecret = process.env.ML_API_SECRET
  const features  = extractURLFeatures(url)

  if (!baseUrl) {
    console.warn("[ml-phishing] ML_PHISHING_ANALYSIS_URL not set — using rule-based fallback")
    return phishingFallback(url, features)
  }

  try {
    const response = await fetch(`${baseUrl}/predict/phishing`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiSecret}`,
      },
      body:    JSON.stringify({ url, features }),
      signal:  AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`FastAPI error ${response.status}`)
    }

    const data = await response.json()

    const verdict: "SAFE" | "SUSPICIOUS" | "DANGEROUS" =
      data.probability > 0.7 ? "DANGEROUS" :
      data.probability > 0.4 ? "SUSPICIOUS" : "SAFE"

    return {
      verdict,
      probability:  data.probability,
      is_phishing:  data.is_phishing,
      features,
      model:        "LogisticRegression",
      source:       "ML_MODEL",
      explanation:  buildExplanation(features),
    }
  } catch (err) {
    console.error("[ml-phishing] FastAPI call failed, using fallback:", err)
    return phishingFallback(url, features)
  }
}

function phishingFallback(url: string, features: Record<string, number>): PhishingPrediction {
  let score = 0
  if (features.has_ip_address)        score += 3
  if (features.has_suspicious_tld)     score += 2
  if (features.has_url_shortener)      score += 2
  if (features.has_redirect_pattern)   score += 3
  if (features.num_subdomains > 3)     score += 2
  if (features.url_length > 75)        score += 1
  if (!features.has_https)             score += 1
  if (features.num_hyphens > 4)        score += 1
  if (features.has_suspicious_keyword) score += 2
  if (features.num_at_symbols > 0)     score += 2

  const probability = Math.min(score / 12, 1)
  const verdict     = probability > 0.6 ? "DANGEROUS" : probability > 0.3 ? "SUSPICIOUS" : "SAFE"

  return {
    verdict,
    probability,
    is_phishing: probability > 0.5,
    features,
    model:       "RuleBasedFallback",
    source:      "FALLBACK",
    explanation: buildExplanation(features),
  }
}
