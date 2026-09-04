import { NextResponse } from "next/server"
import { prisma }           from "@/lib/prisma"
import { requireAuth }      from "@/lib/auth-helpers"
import { appendAuditEvent } from "@/lib/case-audit"
import { createCaseSchema } from "@/types/case"

// ── All 8 ML/AI Modules ───────────────────────────────────
import { detectAndMaskPII }    from "@/lib/pii"              // Module 1
import { classifyCase }        from "@/lib/ai"               // Module 2 + 3 + 4
import { predictFraud }        from "@/lib/ml-fraud"         // Module 5 (FastAPI)
import { analyzePhishingURL }  from "@/lib/ml-phishing"      // Module 6 (FastAPI)
import { detectPatterns }      from "@/lib/pattern-detection"// Module 7
import { computeSmartRouting } from "@/lib/smart-routing"    // Module 8

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const body   = await req.json()
    const parsed = createCaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // ────────────────────────────────────────────────────
    // MODULE 1 — PII Detection & Masking
    // ────────────────────────────────────────────────────
    const piiResult = detectAndMaskPII(data.description)
    console.log(`[Module 1 PII] Found ${piiResult.matches.length} PII items, hasPII=${piiResult.hasPII}`)

    // ────────────────────────────────────────────────────
    // Run all ML/AI modules in parallel for speed
    // ────────────────────────────────────────────────────
    const [
      classification,   // Modules 2, 3, 4
      fraudResult,      // Module 5
      phishingResult,   // Module 6
      patternResult,    // Module 7
    ] = await Promise.allSettled([
      // Module 2 + 3 + 4 — Gemini classification
      classifyCase(data.description, data.amount).catch(err => {
        console.error("[Module 2/3/4]", err)
        return null
      }),

      // Module 5 — FastAPI fraud detection
      predictFraud({
        amount:                   data.amount ?? 0,
        previous_failed_attempts: 0,
        is_new_recipient:         !!data.upiId,
      }).catch(err => {
        console.error("[Module 5]", err)
        return null
      }),

      // Module 6 — FastAPI phishing analysis (only if link provided)
      data.fraudLink
        ? analyzePhishingURL(data.fraudLink).catch(err => {
            console.error("[Module 6]", err)
            return null
          })
        : Promise.resolve(null),

      // Module 7 — Pattern detection
      detectPatterns(auth.userId, data.upiId, data.amount, data.transactionId).catch(err => {
        console.error("[Module 7]", err)
        return { flags: [], riskScore: 0, hasRedFlags: false }
      }),
    ])

    const classificationData = classification.status === "fulfilled" ? classification.value : null
    const fraudData          = fraudResult.status    === "fulfilled" ? fraudResult.value    : null
    const phishingData       = phishingResult.status === "fulfilled" ? phishingResult.value : null
    const patternData        = patternResult.status  === "fulfilled" ? patternResult.value  : { flags: [], riskScore: 0, hasRedFlags: false }

    // ────────────────────────────────────────────────────
    // MODULE 8 — AI-Guided Routing (combines all signals)
    // ────────────────────────────────────────────────────
    const routingDecision = computeSmartRouting({
      disputeType:          classificationData?.disputeType      ?? "FAILED_TXN",
      severity:             classificationData?.severity          ?? "LOW",
      aiRoutingSuggestion:  classificationData?.routingSuggestion ?? "BANK",
      fraudProbability:     fraudData?.fraud_probability,
      fraudRiskLevel:       fraudData?.risk_level,
      phishingVerdict:      phishingData?.verdict,
      patternRiskScore:     patternData?.riskScore,
      hasRedFlags:          patternData?.hasRedFlags,
      amount:               data.amount,
    })

    console.log(`[Module 8 Routing] → ${routingDecision.authority} | Priority: ${routingDecision.priority} | SLA: ${routingDecision.slaDeadlineDays}d`)

    // ────────────────────────────────────────────────────
    // Save fraud check to DB if link was provided
    // ────────────────────────────────────────────────────
    let fraudCheckId: string | undefined
    if (data.fraudLink && phishingData) {
      const fraudRecord = await prisma.fraudCheck.create({
        data: {
          url:     data.fraudLink,
          verdict: phishingData.verdict,
          sources: {
            mlModel:     phishingData.model,
            probability: phishingData.probability,
            explanation: phishingData.explanation,
            features:    phishingData.features,
            source:      phishingData.source,
          },
        },
      })
      fraudCheckId = fraudRecord.id
    }

    // ────────────────────────────────────────────────────
    // Create the case
    // ────────────────────────────────────────────────────
    const slaDeadline = new Date()
    slaDeadline.setDate(slaDeadline.getDate() + routingDecision.slaDeadlineDays)

    const newCase = await prisma.case.create({
      data: {
        userId:        auth.userId,
        transactionId: data.transactionId,
        upiId:         data.upiId,
        amount:        data.amount,
        bankName:      data.bankName,
        appUsed:       data.appUsed,
        description:   data.description,   // store original (PII stored server-side only)
        disputeType:   classificationData?.disputeType ?? "FAILED_TXN",
        severity:      classificationData?.severity    ?? "LOW",
        status:        "CLASSIFIED",
        assignedTo:    routingDecision.authority,
        slaDeadline,
        aiSummary:     classificationData?.summary,
        evidenceUrls:  data.evidenceUrls ?? [],
        ...(fraudCheckId ? { fraudChecks: { connect: { id: fraudCheckId } } } : {}),
      },
    })

    // ────────────────────────────────────────────────────
    // Audit chain — record all module outputs
    // ────────────────────────────────────────────────────
    await appendAuditEvent(newCase.id, "CASE_FILED", {
      userId:    auth.userId,
      hasPII:    piiResult.hasPII,
      piiTypes:  piiResult.matches.map(m => m.type),
      timestamp: new Date().toISOString(),
    }, auth.userId)

    await appendAuditEvent(newCase.id, "AI_CLASSIFICATION", {
      module:      "2_3_4_Gemini",
      disputeType: classificationData?.disputeType,
      severity:    classificationData?.severity,
      confidence:  classificationData?.confidence,
      keyPoints:   classificationData?.keyPoints,
    }, "AI_ENGINE")

    await appendAuditEvent(newCase.id, "FRAUD_RISK_ASSESSMENT", {
      module:           "5_RandomForest",
      fraudProbability: fraudData?.fraud_probability,
      riskLevel:        fraudData?.risk_level,
      isFraud:          fraudData?.is_fraud,
      source:           fraudData?.source,
    }, "ML_ENGINE")

    if (phishingData) {
      await appendAuditEvent(newCase.id, "PHISHING_ANALYSIS", {
        module:      "6_LogisticRegression",
        verdict:     phishingData.verdict,
        probability: phishingData.probability,
        explanation: phishingData.explanation,
        source:      phishingData.source,
      }, "ML_ENGINE")
    }

    if (patternData.flags.length > 0) {
      await appendAuditEvent(newCase.id, "PATTERN_FLAGS_DETECTED", {
        module:    "7_RuleBased",
        flags:     patternData.flags,
        riskScore: patternData.riskScore,
      }, "PATTERN_ENGINE")
    }

    await appendAuditEvent(newCase.id, "SMART_ROUTING_DECISION", {
      module:     "8_AIGuidedRouting",
      authority:  routingDecision.authority,
      priority:   routingDecision.priority,
      slaDays:    routingDecision.slaDeadlineDays,
      reason:     routingDecision.reason,
    }, "ROUTING_ENGINE")

    // Generate complaint draft in background (non-blocking)
    generateDraftInBackground(newCase.id, {
      disputeType:   classificationData?.disputeType ?? "FAILED_TXN",
      amount:        data.amount,
      transactionId: data.transactionId,
      upiId:         data.upiId,
      description:   data.description,
      authority:     routingDecision.authority,
    })

    return NextResponse.json({
      caseId:          newCase.id,
      disputeType:     classificationData?.disputeType,
      severity:        classificationData?.severity,
      assignedTo:      routingDecision.authority,
      priority:        routingDecision.priority,
      slaDeadline,
      fraudRisk:       fraudData?.risk_level,
      phishingVerdict: phishingData?.verdict ?? null,
      patternFlags:    patternData.flags.length,
      routingReason:   routingDecision.reason,
      piiDetected:     piiResult.hasPII,
      message:         "Case filed, classified, and routed successfully.",
    }, { status: 201 })

  } catch (err) {
    console.error("[POST /api/cases]", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const page   = parseInt(searchParams.get("page") ?? "1")
    const limit  = 10

    const where = {
      userId: auth.userId,
      ...(status ? { status: status as any } : {}),
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
        select: {
          id: true, disputeType: true, severity: true, status: true,
          assignedTo: true, amount: true, description: true,
          slaDeadline: true, createdAt: true,
        },
      }),
      prisma.case.count({ where }),
    ])

    return NextResponse.json({
      cases,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error("[GET /api/cases]", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

async function generateDraftInBackground(caseId: string, data: {
  disputeType: string; amount?: number; transactionId?: string
  upiId?: string; description: string; authority: string
}) {
  try {
    const { generateComplaintDraft } = await import("@/lib/ai")
    const draft = await generateComplaintDraft(data)
    await prisma.case.update({ where: { id: caseId }, data: { draftComplaint: draft } })
  } catch (err) {
    console.error("[draft background]", err)
  }
}
