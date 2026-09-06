/**
 * Module 5 — Fraud Detection & Risk Assessment
 * Model: RandomForestClassifier (scikit-learn) — pre-trained, served via FastAPI
 * Endpoint: POST /predict  (application/json — flat body, no wrapper)
 * Env var:  ML_FRAUD_DETECTION_URL
 *
 * All flags are derived from real case data — nothing is hardcoded.
 * Falls back to rule-based logic if FastAPI is unavailable.
 */

export interface FraudFeatures {
  // ── Core transaction ──────────────────────────────────
  amount:                       number
  disputeType?:                 string   // maps to issue_type
  transactionChannel?:          string   // UPI, NEFT, IMPS, CARD, NET_BANKING

  // ── Flags derived from user description (regex signals) ──
  suspicious_url_flag?:         number   // 1 if fraudLink was submitted
  qr_scam_flag?:                number   // 1 if QR code mentioned
  otp_shared_flag?:             number   // 1 if OTP was shared
  unauthorized_flag?:           number   // 1 if unauthorized transaction
  account_compromise_flag?:     number   // 1 if phishing / remote access

  // ── Flags from pattern detection (Module 7) ──────────
  pattern_flag?:                number   // 1 if Module 7 detected red flags
  repeated_complaints?:         number   // count of flags from Module 7

  // ── Mismatch signals ─────────────────────────────────
  device_mismatch?:             number   // 1 if device changed
  location_mismatch?:           number   // 1 if location changed
  cross_state_transaction?:     number   // 1 if cross-state

  // ── Behavioral signals ────────────────────────────────
  previous_failed_attempts?:    number
  transaction_frequency_today?: number
  is_new_recipient?:            boolean
  amount_to_account_ratio?:     number   // normalized amount (0.0-1.0)

  // ── Time signals ─────────────────────────────────────
  hour_of_day?:                 number   // 0-23
  day_of_week?:                 number   // 0-6
}

export interface FraudPrediction {
  fraud_probability: number              // 0.0 – 1.0
  risk_level:        "LOW" | "MEDIUM" | "HIGH"
  is_fraud:          boolean
  payload_sent:      Record<string, unknown>
  model:             string
  source:            "ML_MODEL" | "FALLBACK"
}

/**
 * Build the exact flat JSON body the FastAPI /predict endpoint expects.
 * Every field maps directly to a trained feature — derived from real case data.
 */
function buildPayload(f: FraudFeatures): Record<string, unknown> {
  const now    = new Date()
  const amount = f.amount ?? 0

  return {
    // String fields
    issue_type:                   f.disputeType          ?? "UNAUTHORIZED_PAYMENT",
    transaction_channel:          f.transactionChannel   ?? "UPI",

    // Amount fields
    transaction_amount:           amount,
    amount:                       amount,
    amount_to_account_ratio:      f.amount_to_account_ratio
                                    ?? parseFloat(Math.min(amount / 100000, 1).toFixed(4)),

    // Failed attempts
    failed_attempts:              f.previous_failed_attempts    ?? 0,
    previous_failed_attempts:     f.previous_failed_attempts    ?? 0,

    // Mismatch signals
    device_mismatch:              f.device_mismatch             ?? 0,
    location_mismatch:            f.location_mismatch           ?? 0,
    cross_state_transaction:      f.cross_state_transaction     ?? 0,

    // Recipient signals
    new_beneficiary:              f.is_new_recipient            ? 1 : 0,
    is_new_recipient:             f.is_new_recipient            ? 1 : 0,

    // Fraud type flags — derived from actual case description
    suspicious_url_flag:          f.suspicious_url_flag         ?? 0,
    qr_scam_flag:                 f.qr_scam_flag                ?? 0,
    otp_shared_flag:              f.otp_shared_flag             ?? 0,
    unauthorized_flag:            f.unauthorized_flag           ?? 0,
    account_compromise_flag:      f.account_compromise_flag     ?? 0,

    // Pattern detection signals — from Module 7 output
    pattern_flag:                 f.pattern_flag                ?? 0,
    repeated_complaints:          f.repeated_complaints         ?? 0,

    // Amount shape signal
    is_round_amount:              amount > 0 && amount % 1000 === 0 ? 1 : 0,

    // Time signals
    hour_of_day:                  f.hour_of_day                 ?? now.getHours(),
    day_of_week:                  f.day_of_week                 ?? now.getDay(),

    // Frequency
    transaction_frequency_today:  f.transaction_frequency_today ?? 1,
  }
}

export async function predictFraud(features: FraudFeatures): Promise<FraudPrediction> {
  const baseUrl   = process.env.ML_FRAUD_DETECTION_URL
  const apiSecret = process.env.ML_API_SECRET
  const payload   = buildPayload(features)

  if (!baseUrl) {
    console.warn("[ml-fraud] ML_FRAUD_DETECTION_URL not set — using rule-based fallback")
    return fraudFallback(features, payload)
  }

  try {
    const response = await fetch(`${baseUrl}/predict`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiSecret ? { "Authorization": `Bearer ${apiSecret}` } : {}),
      },
      // Flat JSON body — NOT nested under a "features" key
      body:   JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`FastAPI /predict returned ${response.status}: ${err}`)
    }

    const data = await response.json()

    // Normalize response — handle different possible field names
    const fraud_probability: number =
      data.fraud_probability   ??
      data.probability         ??
      data.fraud_score         ??
      data.risk_score          ??
      0.5

    const risk_level: "LOW" | "MEDIUM" | "HIGH" =
      data.risk_level   ??
      data.risk         ??
      (fraud_probability > 0.7 ? "HIGH" : fraud_probability > 0.4 ? "MEDIUM" : "LOW")

    const is_fraud: boolean =
      data.is_fraud   ??
      data.fraud      ??
      fraud_probability > 0.5

    return {
      fraud_probability,
      risk_level,
      is_fraud,
      payload_sent: payload,
      model:        "RandomForestClassifier",
      source:       "ML_MODEL",
    }
  } catch (err) {
    console.error("[ml-fraud] FastAPI call failed, using rule-based fallback:", err)
    return fraudFallback(features, payload)
  }
}

/**
 * Rule-based fallback — mirrors the approximate logic of the trained model.
 * Used when FastAPI is unavailable (Render cold start, network error, etc.)
 */
function fraudFallback(
  f:       FraudFeatures,
  payload: Record<string, unknown>
): FraudPrediction {
  let score = 0

  const amount = f.amount ?? 0
  if (amount > 50000)         score += 3
  else if (amount > 10000)    score += 1

  const hour = f.hour_of_day ?? new Date().getHours()
  if (hour >= 0 && hour <= 5) score += 2   // late-night transactions

  if ((f.otp_shared_flag         ?? 0) === 1) score += 3
  if ((f.account_compromise_flag ?? 0) === 1) score += 3
  if ((f.unauthorized_flag       ?? 0) === 1) score += 2
  if ((f.suspicious_url_flag     ?? 0) === 1) score += 2
  if ((f.qr_scam_flag            ?? 0) === 1) score += 2
  if ((f.pattern_flag            ?? 0) === 1) score += 2
  if (f.is_new_recipient)                      score += 1
  if ((f.previous_failed_attempts ?? 0) > 2)   score += 1

  const fraud_probability = parseFloat(Math.min(score / 15, 1).toFixed(4))
  const risk_level        = fraud_probability > 0.6 ? "HIGH"
                          : fraud_probability > 0.3 ? "MEDIUM"
                          : "LOW"

  return {
    fraud_probability,
    risk_level,
    is_fraud:     fraud_probability > 0.5,
    payload_sent: payload,
    model:        "RuleBasedFallback",
    source:       "FALLBACK",
  }
}
