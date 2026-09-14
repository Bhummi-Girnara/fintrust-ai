import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") ?? "50")
    const offset = parseInt(searchParams.get("offset") ?? "0")

    const events = await prisma.auditEvent.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        caseId: true,
        eventType: true,
        data: true,
        hash: true,
        prevHash: true,
        actorId: true,
        createdAt: true,
      },
    })

    return NextResponse.json(events)
  } catch (err) {
    console.error("[GET /api/audit]", err)
    return NextResponse.json({ error: "Failed to fetch audit events" }, { status: 500 })
  }
}