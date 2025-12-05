import { getSessionFromCookie } from "@/lib/session"
import { getSql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { appointmentId, paymentIntentId } = await request.json()

    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 })
    }

    const sql = getSql()

    // Update appointment status to confirmed
    const result = await sql(
      `UPDATE appointments 
       SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND client_id = $2
       RETURNING *`,
      [appointmentId, session.userId],
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json({ appointment: result[0] })
  } catch (error) {
    console.error("[v0] Booking confirmation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
