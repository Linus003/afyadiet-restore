import { getSessionFromCookie } from "@/lib/session"
import { getSql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getSql()
    const appointments = await sql(
      `SELECT a.*, u.full_name as nutritionist_name, u.avatar_url
       FROM appointments a
       JOIN users u ON a.nutritionist_id = u.id
       WHERE a.client_id = $1
       ORDER BY a.scheduled_at DESC`,
      [session.userId],
    )

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error("[v0] Appointments fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { nutritionistId, scheduledAt, durationMinutes, notes, price } = await request.json()

    if (!nutritionistId || !scheduledAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = getSql()
    const result = await sql(
      `INSERT INTO appointments (client_id, nutritionist_id, scheduled_at, duration_minutes, notes, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [session.userId, nutritionistId, scheduledAt, durationMinutes || 60, notes, price],
    )

    return NextResponse.json({ appointment: result[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Appointment creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
