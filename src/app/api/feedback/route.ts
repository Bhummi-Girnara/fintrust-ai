import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

/**
 * POST /api/feedback
 * Submit user feedback (requires authentication)
 */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req)
    // Allow anonymous feedback? We'll still require auth to avoid spam.
    // If you want to allow anonymous, remove the requireAuth and handle userId optional.
    if (auth instanceof NextResponse) return auth

    const { rating, comment, category } = await req.json()

    // Validate rating
    if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      )
    }

    // Validate comment length (optional)
    if (comment && typeof comment !== "string") {
      return NextResponse.json(
        { error: "Comment must be a string" },
        { status: 400 }
      )
    }

    // Validate category
    const MAX_COMMENT_LENGTH = 1000
    //    if (comment && comment.length > MAX_COMMENT_LENGTH) {
    //      return NextResponse.json(
    //        { error: `Comment must be less than ${MAX_COMMENT_LENGTH} characters` },
    //        { status: 400 }
    //      )
    //    }

    // Validate category (optional, default GENERAL)
    const validCategories = ["UI", "FEATURE_REQUEST", "BUG", "GENERAL", "PERFORMANCE", "OTHER"]
    if (category && typeof category !== "string") {
      return NextResponse.json(
        { error: "Category must be a string" },
        { status: 400 }
      )
    }
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(", ")}` },
        { status: 400 }
      )
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: auth.userId,
        rating,
        comment: comment?.trim() ?? null,
        category: category ?? "GENERAL",
        status: "NEW",
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (err) {
    console.error("[POST /api/feedback]", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

/**
 * GET /api/feedback
 * Retrieve feedback (admin only)
 */
export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req, ["ADMIN"]) // only admins can list feedback
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "20")
    const status = searchParams.get("status")

    const where = status ? { status } : {}

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          userId: true,
          rating: true,
          comment: true,
          category: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.feedback.count({ where }),
    ])

    return NextResponse.json({
      feedbacks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error("[GET /api/feedback]", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}