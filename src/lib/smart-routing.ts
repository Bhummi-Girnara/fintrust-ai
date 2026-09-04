/**
 * Module 8 — AI-Guided Routing
 * Tool: Python decision engine (replicated as TypeScript)
 * Train: No — deterministic decision tree combining all signal inputs
 *
 * Combines:
 * - Module 2 output: disputeType + routingSuggestion
 * - Module 3 output: severity
 * - Module 5 output: fraud probability + risk level
 * - Module 6 output: phishing verdict
 * - Module 7 output: pattern flags
 *
 * → Decides the correct authority + priority + SLA
 */

import { Authority } from "@prisma/client"

export interface RoutingSignals {
  disputeType:       string
  severity:          "LOW" | "MEDIUM" | "HIGH"
  aiRoutingSuggestion: string
  fraudProbability?: number
  fraudRiskLevel?:   "LOW" | "MEDIUM" | "HIGH"
  phishingVerdict?:  "SAFE" | "SUSPICIOUS" | "DANGEROUS"
  patternRiskScore?: number
  hasRedFlags?:      boolean
  amount?:           number
}

export interface RoutingDecision {
  authority:      Authority
  priority:       "NORMAL" | "HIGH" | "CRITICAL"
  slaDeadlineDays: number
  reason:         string
  signals:        RoutingSignals
}

const SLA_DAYS: Record<Authority, number> = {
  BANK:           7,
  NPCI:           30,
  RBI_OMBUDSMAN:  30,
  CYBERCRIME:     14,
  CONSUMER_FORUM: 45,
}

export function computeSmartRouting(signals: RoutingSignals): RoutingDecision {
  let authority: Authority = signals.aiRoutingSuggestion as Authority
  let priority:  "NORMAL" | "HIGH" | "CRITICAL" = "NORMAL"
  const reasons: string[] = []

  // ── Rule 1: Phishing/fraud → always CYBERCRIME ─────────
  if (
    signals.phishingVerdict === "DANGEROUS" ||
    signals.disputeType    === "PHISHING"
  ) {
    authority = "CYBERCRIME"
    priority  = "CRITICAL"
    reasons.push("Phishing detected — routed to cybercrime cell")
  }

  // ── Rule 2: High fraud probability → escalate ──────────
  if (signals.fraudProbability && signals.fraudProbability > 0.7) {
    if (authority !== "CYBERCRIME") authority = "CYBERCRIME"
    priority = "CRITICAL"
    reasons.push(`High fraud probability (${(signals.fraudProbability * 100).toFixed(0)}%) detected by ML model`)
  }

  // ── Rule 3: High pattern risk → escalate priority ──────
  if (signals.hasRedFlags || (signals.patternRiskScore && signals.patternRiskScore > 60)) {
    priority = priority === "NORMAL" ? "HIGH" : priority
    reasons.push("Suspicious behavioral patterns detected")
  }

  // ── Rule 4: High severity + large amount → Ombudsman ───
  if (
    signals.severity === "HIGH" &&
    signals.amount   && signals.amount > 50000 &&
    authority === "BANK"
  ) {
    authority = "RBI_OMBUDSMAN"
    priority  = "HIGH"
    reasons.push("High severity + large amount — escalated to RBI Ombudsman")
  }

  // ── Rule 5: Suspicious phishing (not confirmed) → BANK with HIGH priority
  if (signals.phishingVerdict === "SUSPICIOUS" && priority === "NORMAL") {
    priority = "HIGH"
    reasons.push("Suspicious URL pattern detected — elevated priority")
  }

  // ── Rule 6: High fraud risk level from ML model ────────
  if (signals.fraudRiskLevel === "HIGH" && priority === "NORMAL") {
    priority = "HIGH"
    reasons.push("ML fraud risk model flagged this transaction as high risk")
  }

  // Reduce SLA for critical/high priority
  let slaDeadlineDays = SLA_DAYS[authority]
  if (priority === "CRITICAL") slaDeadlineDays = Math.min(slaDeadlineDays, 7)
  else if (priority === "HIGH") slaDeadlineDays = Math.min(slaDeadlineDays, 14)

  if (reasons.length === 0) {
    reasons.push(`Standard routing based on dispute type: ${signals.disputeType}`)
  }

  return {
    authority,
    priority,
    slaDeadlineDays,
    reason:  reasons.join(". "),
    signals,
  }
}
