import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET: List all pending verifications
export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const pending = await db.nutritionist.findMany({
      where: { verification_status: "submitted" },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({ pending })
  } catch (error) {
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 })
  }
}

// POST: Approve or Reject
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { nutritionistId, action } = await request.json()

    if (action === 'approve') {
      await db.nutritionist.update({
        where: { id: nutritionistId },
        data: { verification_status: "verified", is_verified: true }
      })
    } else if (action === 'reject') {
      await db.nutritionist.update({
        where: { id: nutritionistId },
        data: { verification_status: "rejected", is_verified: false }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
