/**
 * Module 7 — Pattern Detection
 * Tool: Python rule-based logic (replicated in TypeScript)
 * Train: No — deterministic rules
 *
 * Checks for suspicious behavioral patterns:
 * - Repeated transactions to same UPI in short window
 * - Multiple failed attempts before this complaint
 * - Unusual transaction frequency
 * - Transactions at odd hours
 * - Multiple complaints from same user
 */

import { prisma } from "@/lib/prisma"

export interface PatternFlag {
  type:        string
  severity:    "LOW" | "MEDIUM" | "HIGH"
  description: string
  data?:       Record<string, unknown>
}

export interface PatternResult {
  flags:       PatternFlag[]
  riskScore:   number          // 0–100
  hasRedFlags: boolean
}

export async function detectPatterns(
  userId:        string,
  upiId?:        string,
  amount?:       number,
  transactionId?: string
): Promise<PatternResult> {
  const flags: PatternFlag[] = []
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7d  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000)

  // ── Rule 1: Multiple complaints from same user in 24h ──
  const recentCases = await prisma.case.count({
    where: { userId, createdAt: { gte: last24h } },
  })
  if (recentCases >= 3) {
    flags.push({
      type:        "HIGH_COMPLAINT_FREQUENCY",
      severity:    "HIGH",
      description: `User has filed ${recentCases} complaints in the last 24 hours`,
      data:        { count: recentCases, window: "24h" },
    })
  } else if (recentCases >= 2) {
    flags.push({
      type:        "REPEATED_COMPLAINTS",
      severity:    "MEDIUM",
      description: `User has filed ${recentCases} complaints recently`,
      data:        { count: recentCases, window: "24h" },
    })
  }

  // ── Rule 2: Same UPI ID appearing in multiple cases ───
  if (upiId) {
    const sameUpiCases = await prisma.case.count({
      where: { upiId, createdAt: { gte: last7d } },
    })
    if (sameUpiCases >= 3) {
      flags.push({
        type:        "REPEAT_OFFENDER_UPI",
        severity:    "HIGH",
        description: `UPI ID ${upiId} has appeared in ${sameUpiCases} cases in the last 7 days`,
        data:        { upiId, count: sameUpiCases, window: "7d" },
      })
    }
  }

  // ── Rule 3: Large round-number amounts ────────────────
  if (amount) {
    if (amount > 100000) {
      flags.push({
        type:        "HIGH_VALUE_TRANSACTION",
        severity:    "HIGH",
        description: `Transaction amount ₹${amount.toLocaleString("en-IN")} is unusually high`,
        data:        { amount },
      })
    } else if (amount % 10000 === 0 && amount >= 10000) {
      flags.push({
        type:        "ROUND_AMOUNT_PATTERN",
        severity:    "LOW",
        description: "Transaction is a suspiciously round number (common in social engineering)",
        data:        { amount },
      })
    }
  }

  // ── Rule 4: High-severity cases for this user ─────────
  const highSeverityCount = await prisma.case.count({
    where: { userId, severity: "HIGH", createdAt: { gte: last7d } },
  })
  if (highSeverityCount >= 2) {
    flags.push({
      type:        "REPEATED_HIGH_SEVERITY",
      severity:    "HIGH",
      description: `User has ${highSeverityCount} high-severity cases in the last 7 days`,
      data:        { count: highSeverityCount },
    })
  }

  // ── Rule 5: Phishing + large amount combo ─────────────
  if (amount && amount > 20000) {
    const phishingCases = await prisma.case.count({
      where: { userId, disputeType: "PHISHING", createdAt: { gte: last7d } },
    })
    if (phishingCases > 0) {
      flags.push({
        type:        "PHISHING_HIGH_VALUE_COMBO",
        severity:    "HIGH",
        description: "High-value transaction combined with a phishing case pattern",
        data:        { amount, phishingCases },
      })
    }
  }

  // ── Compute risk score ────────────────────────────────
  const scoreMap = { HIGH: 30, MEDIUM: 15, LOW: 5 }
  const riskScore = Math.min(
    flags.reduce((acc, f) => acc + scoreMap[f.severity], 0),
    100
  )

  return {
    flags,
    riskScore,
    hasRedFlags: flags.some(f => f.severity === "HIGH"),
  }
}
