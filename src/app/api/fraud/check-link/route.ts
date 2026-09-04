import { NextResponse }       from "next/server"
import { requireAuth }        from "@/lib/auth-helpers"
import { analyzePhishingURL } from "@/lib/ml-phishing"   // Module 6
import { checkUrl }           from "@/lib/fraud"          // Google Safe Browsing + VirusTotal
import { fraudLimiter }       from "@/lib/ratelimit"
import { getClientIp }        from "@/lib/session"
import { z }                  from "zod"

const schema = z.object({ url: z.string().url("Enter a valid URL") })

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const ip = getClientIp(req)
    const { success } = await fraudLimiter.limit(`${auth.userId}:${ip}`)
    if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid URL" }, { status: 400 })

    const { url } = parsed.data

    // Run ML model + Google Safe Browsing in parallel
    const [mlResult, apiResult] = await Promise.allSettled([
      analyzePhishingURL(url),   // Module 6 — trained LogisticRegression
      checkUrl(url),             // Google Safe Browsing + VirusTotal
    ])

    const ml  = mlResult.status  === "fulfilled" ? mlResult.value  : null
    const api = apiResult.status === "fulfilled" ? apiResult.value : null

    // Merge verdicts — take the worst (most severe) verdict
    const verdicts = [ml?.verdict, api?.verdict].filter(Boolean)
    const finalVerdict =
      verdicts.includes("DANGEROUS")  ? "DANGEROUS"  :
      verdicts.includes("SUSPICIOUS") ? "SUSPICIOUS" : "SAFE"

    return NextResponse.json({
      verdict:     finalVerdict,
      checkedAt:   new Date().toISOString(),
      sources: [
        ...(api?.sources ?? []),
        ml ? {
          name:        `ML Model (${ml.model})`,
          flagged:     ml.is_phishing,
          probability: ml.probability,
          detail:      ml.source === "ML_MODEL"
            ? `LogisticRegression: ${(ml.probability * 100).toFixed(0)}% phishing probability`
            : `Rule-based fallback: ${(ml.probability * 100).toFixed(0)}% risk score`,
          explanation: ml.explanation,
        } : null,
      ].filter(Boolean),
    })
  } catch (err) {
    console.error("[POST /api/fraud/check-link]", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
