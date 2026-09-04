/**
 * Module 5 — Fraud Detection & Risk Assessment
 * Tool: RandomForestClassifier via scikit-learn, served via FastAPI
 * Train: YES — pre-trained model loaded at FastAPI startup
 * Endpoint: POST /predict/fraud
 *
 * Features sent to the model:
 * - amount (float)
 * - hour_of_day (0-23, extracted from transaction time)
 * - day_of_week (0-6)
 * - is_round_amount (bool — e.g. exactly 5000, 10000)
 * - amount_to_account_ratio (float — amount vs typical transaction size)
 * - previous_failed_attempts (int)
 * - transaction_frequency_today (int)
 * - is_new_recipient (bool)
 * - cross_state_transaction (bool)
 */

export interface FraudFeatures {
  amount:                     number
  hour_of_day?:               number   // extracted from timestamp if available
  day_of_week?:               number
  is_round_amount?:           boolean
  previous_failed_attempts?:  number
  transaction_frequency_today?: number
  is_new_recipient?:          boolean
}

export interface FraudPrediction {
  fraud_probability: number          // 0.0 – 1.0
  risk_level:        "LOW" | "MEDIUM" | "HIGH"
  is_fraud:          boolean
  features_used:     Record<string, number>
  model:             string          // "RandomForestClassifier"
  source:            "ML_MODEL" | "FALLBACK"
}

function extractFeatures(features: FraudFeatures): Record<string, number> {
  const now = new Date()
  return {
    amount:                      features.amount,
    hour_of_day:                 features.hour_of_day                ?? now.getHours(),
    day_of_week:                 features.day_of_week                ?? now.getDay(),
    is_round_amount:             features.is_round_amount            ? 1 : (features.amount % 100 === 0 ? 1 : 0),
    previous_failed_attempts:    features.previous_failed_attempts   ?? 0,
    transaction_frequency_today: features.transaction_frequency_today ?? 1,
    is_new_recipient:            features.is_new_recipient           ? 1 : 0,
  }
}

export async function predictFraud(features: FraudFeatures): Promise<FraudPrediction> {
  const baseUrl    = process.env.ML_FRAUD_DETECTION_URL
  const apiSecret  = process.env.ML_API_SECRET

  if (!baseUrl) {
    console.warn("[ml-fraud] ML_FRAUD_DETECTION_URL not set — using rule-based fallback")
    return fraudFallback(features)
  }

  try {
    const payload = extractFeatures(features)

    const response = await fetch(`${baseUrl}/predict/fraud`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiSecret}`,
      },
      body:    JSON.stringify({ features: payload }),
      signal:  AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`FastAPI error ${response.status}: ${err}`)
    }

    const data = await response.json()

    return {
      fraud_probability: data.fraud_probability,
      risk_level:        data.risk_level,
      is_fraud:          data.is_fraud,
      features_used:     payload,
      model:             "RandomForestClassifier",
      source:            "ML_MODEL",
    }
  } catch (err) {
    console.error("[ml-fraud] FastAPI call failed, using fallback:", err)
    return fraudFallback(features)
  }
}

/**
 * Rule-based fallback when the FastAPI server is unavailable.
 * Mirrors the rough logic of the trained model.
 */
function fraudFallback(features: FraudFeatures): FraudPrediction {
  let score = 0

  const amount = features.amount ?? 0
  if (amount > 50000) score += 3
  else if (amount > 10000) score += 1

  const hour = features.hour_of_day ?? new Date().getHours()
  if (hour >= 0 && hour <= 5) score += 2 // late night transactions

  if (features.previous_failed_attempts && features.previous_failed_attempts > 2) score += 2
  if (features.is_new_recipient) score += 1
  if (amount % 1000 === 0 && amount > 5000) score += 1 // suspiciously round amounts

  const probability = Math.min(score / 9, 1)
  const risk_level  = probability > 0.6 ? "HIGH" : probability > 0.3 ? "MEDIUM" : "LOW"

  return {
    fraud_probability: probability,
    risk_level,
    is_fraud:      probability > 0.6,
    features_used: extractFeatures(features),
    model:         "RuleBasedFallback",
    source:        "FALLBACK",
  }
}
