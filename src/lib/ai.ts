/**
 * Modules 2, 3, 4 — Gemini-powered AI modules
 *
 * Module 2: AI/NLP Case Understanding — classify dispute type + extract key info
 * Module 3: Severity Detection — classify severity using full case context
 * Module 4: Key-Point Summarization — extract important facts from complaint text
 *
 * PII masking (Module 1) is applied to ALL text before sending to Gemini.
 */

import { GoogleGenerativeAI } from "@google/generative-ai"
import { sanitizeForAI } from "@/lib/pii"

function getModel() {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error("GEMINI_API_KEY is not set")
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-2.5-flash" })
}

function parseJSON<T>(text: string): T {
  // Strip markdown code fences if present
  const clean = text.replace(/```json|```/g, "").trim()
  return JSON.parse(clean) as T
}

// ─────────────────────────────────────────────────────────
// MODULE 2 — AI/NLP Case Understanding
// ─────────────────────────────────────────────────────────

export interface ClassificationResult {
  disputeType: "FAILED_TXN" | "UNAUTHORIZED_PAYMENT" | "REFUND_DELAY" | "MERCHANT_SCAM" | "PHISHING"
  severity: "LOW" | "MEDIUM" | "HIGH"
  summary: string
  routingSuggestion: "BANK" | "NPCI" | "RBI_OMBUDSMAN" | "CYBERCRIME" | "CONSUMER_FORUM"
  keyPoints: string[] // Module 4 output bundled in same call
  confidence: number // 0.0 – 1.0
}

export async function classifyCase(
  description: string,
  amount?: number
): Promise<ClassificationResult> {
  // Module 1: Strip PII before sending to Gemini
  const sanitized = sanitizeForAI(description)

  const model = getModel()

  const prompt = `You are an expert financial dispute analyst for UPI and digital payments in India.
Analyze the complaint below and respond ONLY with a valid JSON object — no markdown, no explanation.

Complaint: "${sanitized}"
${amount ? `Amount involved: ₹${amount}` : ""}

Return exactly this JSON:
{
  "disputeType": one of ["FAILED_TXN","UNAUTHORIZED_PAYMENT","REFUND_DELAY","MERCHANT_SCAM","PHISHING"],
  "severity": one of ["LOW","MEDIUM","HIGH"],
  "summary": "2-3 sentence plain English summary",
  "routingSuggestion": one of ["BANK","NPCI","RBI_OMBUDSMAN","CYBERCRIME","CONSUMER_FORUM"],
  "keyPoints": ["fact 1", "fact 2", "fact 3"],
  "confidence": 0.0 to 1.0
}

Severity guide:
- LOW: failed transaction < ₹5000, refund delay < ₹2000
- MEDIUM: unauthorized payment, refund > ₹5000, merchant scam < ₹20000
- HIGH: phishing/account takeover, amount > ₹20000, criminal intent

Routing guide:
- BANK: failed transactions, refund delays, standard disputes
- NPCI: UPI network issues, interbank failures
- RBI_OMBUDSMAN: bank unresponsive > 30 days, systemic issues
- CYBERCRIME: phishing, account takeover, fraud with criminal intent
- CONSUMER_FORUM: merchant scams, e-commerce fraud`

  const result = await model.generateContent(prompt)
  return parseJSON<ClassificationResult>(result.response.text())
}

// ─────────────────────────────────────────────────────────
// MODULE 3 — Severity Detection (standalone, with full context)
// ─────────────────────────────────────────────────────────

export interface SeverityResult {
  severity: "LOW" | "MEDIUM" | "HIGH"
  reason: string
  urgencyScore: number // 1-10
}

export async function detectSeverity(
  description: string,
  amount?: number,
  disputeType?: string
): Promise<SeverityResult> {
  const sanitized = sanitizeForAI(description)
  const model = getModel()

  const prompt = `You are a financial dispute severity classifier for India's digital payment ecosystem.
Respond ONLY with valid JSON.

Complaint: "${sanitized}"
${amount ? `Amount: ₹${amount}` : ""}
${disputeType ? `Type: ${disputeType}` : ""}

Return exactly:
{
  "severity": one of ["LOW","MEDIUM","HIGH"],
  "reason": "one sentence explaining the severity rating",
  "urgencyScore": integer 1-10
}

HIGH: phishing, account takeover, > ₹20000 lost, criminal elements
MEDIUM: unauthorized payments, > ₹5000, no immediate criminal element
LOW: failed transactions < ₹5000, minor refund delays`

  const result = await model.generateContent(prompt)
  return parseJSON<SeverityResult>(result.response.text())
}

// ─────────────────────────────────────────────────────────
// MODULE 4 — Key-Point Summarization
// ─────────────────────────────────────────────────────────

export interface SummaryResult {
  summary: string
  keyPoints: string[]
  timeline: string[] // chronological events extracted from the complaint
  actionable: string[] // what the user should do next
}

export async function summarizeCase(description: string): Promise<SummaryResult> {
  const sanitized = sanitizeForAI(description)
  const model = getModel()

  const prompt = `You are a financial dispute analyst. Analyze this payment complaint and extract structured information.
Respond ONLY with valid JSON.

Complaint: "${sanitized}"

Return exactly:
{
  "summary": "2-3 sentence objective summary",
  "keyPoints": ["key fact 1", "key fact 2", "key fact 3"],
  "timeline": ["earliest event", "next event", "most recent event"],
  "actionable": ["step 1 the user can take", "step 2", "step 3"]
}`

  const result = await model.generateContent(prompt)
  return parseJSON<SummaryResult>(result.response.text())
}

// ─────────────────────────────────────────────────────────
// Juror bilateral summary (existing, with PII masking added)
// ─────────────────────────────────────────────────────────

export async function generateJurorSummary(
  description: string,
  officerNotes?: string
): Promise<string> {
  const sanitized = sanitizeForAI(description)
  const model = getModel()

  const prompt = `Summarize the following payment dispute for an independent reviewer. Present both sides objectively. Under 200 words. Plain text only.

User's complaint: "${sanitized}"
${officerNotes ? `Authority's response: "${sanitizeForAI(officerNotes)}"` : "No authority response recorded yet."}`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

// ─────────────────────────────────────────────────────────
// Complaint draft generation (existing, with PII masking)
// ─────────────────────────────────────────────────────────

export async function generateComplaintDraft(data: {
  disputeType: string
  amount?: number
  transactionId?: string
  upiId?: string
  description: string
  authority: string
}): Promise<string> {
  const sanitized = sanitizeForAI(data.description)
  const model = getModel()

  const prompt = `Write a formal complaint letter for a digital payment dispute in India.
Authority: ${data.authority}
Dispute type: ${data.disputeType}
${data.transactionId ? `Transaction ID: ${data.transactionId}` : ""}
${data.upiId ? `UPI ID: ${data.upiId}` : ""}
${data.amount ? `Amount: ₹${data.amount}` : ""}
Issue: ${sanitized}

Write a concise, professional complaint in plain text (no markdown). Include: subject line, salutation, body with facts, and a formal closing. Keep it under 300 words.`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}
