/**
 * Module 1 — PII Detection & Masking
 * Tool: Python Regex rules (replicated in TypeScript)
 * Train: No — pure rule-based regex
 *
 * Detects and masks: email, phone, card numbers, account numbers,
 * Aadhaar numbers, PAN numbers, UPI IDs before sending to any AI model.
 * This runs FIRST before any text leaves the server.
 */

interface PIIMatch {
  type: string
  original: string
  masked: string
  start: number
  end: number
}

interface PIIResult {
  sanitized: string
  matches: PIIMatch[]
  hasPII: boolean
}

const PII_PATTERNS: Array<{ type: string; regex: RegExp; mask: string }> = [
  // Email addresses
  {
    type: "EMAIL",
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    mask: "[EMAIL REDACTED]",
  },
  // Indian mobile numbers (10 digit, optional +91 or 0 prefix)
  {
    type: "PHONE",
    regex: /(?:\+91|91|0)?[6-9]\d{9}/g,
    mask: "[PHONE REDACTED]",
  },
  // Credit/debit card numbers (13-19 digits, optional spaces/dashes)
  {
    type: "CARD_NUMBER",
    regex: /\b(?:\d[ \-]?){13,19}\b/g,
    mask: "[CARD REDACTED]",
  },
  // Aadhaar numbers (12 digits, often written as XXXX XXXX XXXX)
  {
    type: "AADHAAR",
    regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
    mask: "[AADHAAR REDACTED]",
  },
  // PAN number (AAAAA0000A format)
  {
    type: "PAN",
    regex: /[A-Z]{5}[0-9]{4}[A-Z]/g,
    mask: "[PAN REDACTED]",
  },
  // UPI IDs (user@bank format)
  {
    type: "UPI_ID",
    regex: /[a-zA-Z0-9.\-_+]+@[a-zA-Z0-9]+/g,
    mask: "[UPI REDACTED]",
  },
  // Bank account numbers (9-18 digits)
  {
    type: "ACCOUNT_NUMBER",
    regex: /\baccount\s*(?:number|no|num|#)?\s*:?\s*(\d{9,18})\b/gi,
    mask: "[ACCOUNT REDACTED]",
  },
  // IFSC codes
  {
    type: "IFSC",
    regex: /[A-Z]{4}0[A-Z0-9]{6}/g,
    mask: "[IFSC REDACTED]",
  },
  // OTP patterns (mentioned in text)
  {
    type: "OTP",
    regex: /\b(?:otp|one.time.password)\s*(?:is|was|:)?\s*(\d{4,8})\b/gi,
    mask: "[OTP REDACTED]",
  },
]

export function detectAndMaskPII(text: string): PIIResult {
  let sanitized = text
  const matches: PIIMatch[] = []

  for (const pattern of PII_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.regex.lastIndex = 0

    const found = sanitized.match(pattern.regex)
    if (!found) continue

    for (const match of found) {
      matches.push({
        type:     pattern.type,
        original: match,
        masked:   pattern.mask,
        start:    sanitized.indexOf(match),
        end:      sanitized.indexOf(match) + match.length,
      })
    }

    sanitized = sanitized.replace(pattern.regex, pattern.mask)
    pattern.regex.lastIndex = 0
  }

  return {
    sanitized,
    matches,
    hasPII: matches.length > 0,
  }
}

/**
 * Mask PII in a text and return only the sanitized string.
 * Use this before sending any user text to Gemini or other external APIs.
 */
export function sanitizeForAI(text: string): string {
  return detectAndMaskPII(text).sanitized
}
