/**
 * Module 6 — URL/QR Phishing Analysis
 * Model: LogisticRegression (scikit-learn) — pre-trained, served via FastAPI
 * Endpoint: POST /analyze  (multipart/form-data — NOT JSON)
 * Env var:  ML_PHISHING_ANALYSIS_URL
 *
 * Request:  FormData { url: string, file?: File (QR image) }
 * Response: { input_type, analyzed_content, prediction, suspicious_probability }
 *
 * Falls back to rule-based feature extraction if FastAPI is unavailable.
 */

export interface PhishingPrediction {
  verdict:       "SAFE" | "SUSPICIOUS" | "DANGEROUS"
  probability:   number              // 0.0 – 1.0 (suspicious_probability from API)
  is_phishing:   boolean
  features:      Record<string, number>
  model:         string
  source:        "ML_MODEL" | "FALLBACK"
  explanation:   string[]
}

// ── Suspicious patterns for client-side feature extraction ──
// Used for: fallback logic + explanation generation
const SUSPICIOUS_TLDS     = [".tk",".ml",".ga",".cf",".gq",".xyz",".top",".click",".link",".work",".party"]
const URL_SHORTENERS      = ["bit.ly","tinyurl.com","t.co","goo.gl","ow.ly","is.gd","buff.ly","adf.ly","short.io"]
const SUSPICIOUS_KEYWORDS = ["login","verify","account","secure","update","confirm","banking","password","otp","kyc","aadhaar"]

function extractURLFeatures(url: string): Record<string, number> {
  let cleanUrl = url
  try { cleanUrl = decodeURIComponent(url) } catch {}

  const lower      = cleanUrl.toLowerCase()
  let parsed: URL | null = null
  try { parsed = new URL(cleanUrl) } catch {}

  const domain     = parsed?.hostname ?? ""
  const parts      = domain.split(".")
  const tld        = "." + (parts.at(-1) ?? "")
  const subdomains = Math.max(0, parts.length - 2)

  return {
    url_length:              cleanUrl.length,
    has_ip_address:          /^\d{1,3}(\.\d{1,3}){3}/.test(domain) ? 1 : 0,
    num_dots:                (cleanUrl.match(/\./g)  ?? []).length,
    num_hyphens:             (cleanUrl.match(/-/g)   ?? []).length,
    num_at_symbols:          (cleanUrl.match(/@/g)   ?? []).length,
    has_https:               cleanUrl.startsWith("https") ? 1 : 0,
    num_subdomains:          subdomains,
    has_suspicious_tld:      SUSPICIOUS_TLDS.some(t => tld === t)           ? 1 : 0,
    has_url_shortener:       URL_SHORTENERS.some(s => lower.includes(s))    ? 1 : 0,
    num_special_chars:       (cleanUrl.match(/[!@#$%^&*()=+[\]{};:'"<>,?]/g) ?? []).length,
    has_redirect_pattern:    (lower.match(/https?:\/\//g) ?? []).length > 1 ? 1 : 0,
    domain_length:           domain.length,
    has_suspicious_keyword:  SUSPICIOUS_KEYWORDS.some(k => lower.includes(k)) ? 1 : 0,
  }
}

function buildExplanation(f: Record<string, number>): string[] {
  const reasons: string[] = []
  if (f.has_ip_address)         reasons.push("URL uses an IP address instead of a domain name")
  if (f.has_suspicious_tld)     reasons.push("Domain uses a free or suspicious TLD")
  if (f.has_url_shortener)      reasons.push("URL uses a shortening service hiding the real destination")
  if (f.has_redirect_pattern)   reasons.push("URL contains multiple redirect chains")
  if (f.num_subdomains > 3)     reasons.push("Excessive subdomains — common phishing spoofing pattern")
  if (f.url_length > 75)        reasons.push("URL is unusually long")
  if (!f.has_https)             reasons.push("URL does not use HTTPS")
  if (f.num_hyphens > 4)        reasons.push("Multiple hyphens in domain — common spoofing pattern")
  if (f.has_suspicious_keyword) reasons.push("URL contains sensitive keywords like login, verify, or kyc")
  if (f.num_at_symbols > 0)     reasons.push("URL contains @ symbol which can mask the real destination")
  return reasons
}

export async function analyzePhishingURL(url: string): Promise<PhishingPrediction> {
  const baseUrl  = process.env.ML_PHISHING_ANALYSIS_URL
  const apiSecret = process.env.ML_API_SECRET
  const features = extractURLFeatures(url)

  if (!baseUrl) {
    console.warn("[ml-phishing] ML_PHISHING_ANALYSIS_URL not set — using rule-based fallback")
    return phishingFallback(url, features)
  }

  try {
    // API expects multipart/form-data with a "url" field — NOT JSON
    // Do NOT set Content-Type manually — fetch sets the correct multipart
    // boundary automatically when body is FormData
    const formData = new FormData()
    formData.append("url", url)
    // "file" field is optional — used for QR code image uploads
    // When evidence upload includes QR screenshots, append the file here

    const response = await fetch(`${baseUrl}/analyze`, {
      method: "POST",
      headers: {
        ...(apiSecret ? { "Authorization": `Bearer ${apiSecret}` } : {}),
        // NO Content-Type header — let fetch set it with the multipart boundary
      },
      body:   formData,
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`FastAPI /analyze returned ${response.status}: ${err}`)
    }

    const data = await response.json()

    // Response shape (confirmed via curl test):
    // {
    //   "input_type":             "url",
    //   "analyzed_content":       "http://...",
    //   "prediction":             "SAFE" | "SUSPICIOUS" | "DANGEROUS",
    //   "suspicious_probability": 0.0 – 1.0
    // }

    const probability: number =
      data.suspicious_probability ??
      data.probability            ??
      data.score                  ??
      (data.prediction === "DANGEROUS" ? 0.9 :
       data.prediction === "SUSPICIOUS" ? 0.6 : 0.1)

    const verdict: "SAFE" | "SUSPICIOUS" | "DANGEROUS" =
      data.prediction === "DANGEROUS"  ? "DANGEROUS"  :
      data.prediction === "SUSPICIOUS" ? "SUSPICIOUS" :
      data.prediction === "SAFE"       ? "SAFE"       :
      // fallback if prediction field missing — use probability
      probability > 0.7 ? "DANGEROUS" :
      probability > 0.4 ? "SUSPICIOUS" : "SAFE"

    const is_phishing = verdict !== "SAFE"

    console.log(`[ml-phishing] ML_MODEL verdict: ${verdict} (${(probability * 100).toFixed(0)}%) for ${url}`)

    return {
      verdict,
      probability,
      is_phishing,
      features,
      model:       "LogisticRegression",
      source:      "ML_MODEL",
      explanation: buildExplanation(features),
    }
  } catch (err) {
    console.error("[ml-phishing] FastAPI call failed, using rule-based fallback:", err)
    return phishingFallback(url, features)
  }
}

/**
 * Rule-based fallback — used when FastAPI is unavailable.
 * Based on the same features the LogisticRegression model was trained on.
 */
function phishingFallback(url: string, features: Record<string, number>): PhishingPrediction {
  let score = 0
  if (features.has_ip_address)        score += 3
  if (features.has_suspicious_tld)    score += 2
  if (features.has_url_shortener)     score += 2
  if (features.has_redirect_pattern)  score += 3
  if (features.num_subdomains > 3)    score += 2
  if (features.url_length > 75)       score += 1
  if (!features.has_https)            score += 1
  if (features.num_hyphens > 4)       score += 1
  if (features.has_suspicious_keyword) score += 2
  if (features.num_at_symbols > 0)    score += 2

  const probability = parseFloat(Math.min(score / 12, 1).toFixed(4))
  const verdict     = probability > 0.6 ? "DANGEROUS"
                    : probability > 0.3 ? "SUSPICIOUS"
                    : "SAFE"

  return {
    verdict,
    probability,
    is_phishing: verdict !== "SAFE",
    features,
    model:       "RuleBasedFallback",
    source:      "FALLBACK",
    explanation: buildExplanation(features),
  }
}
