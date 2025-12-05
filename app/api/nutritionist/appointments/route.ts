import { getSessionFromCookie } from "@/lib/session"
import { getSql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    let query = `
      SELECT a.*, u.full_name as client_name, u.email as client_email
      FROM appointments a
      JOIN users u ON a.client_id = u.id
      WHERE a.nutritionist_id = $1
    `
    const params: (string | number)[] = [session.userId]

    if (status) {
      query += ` AND a.status = $${params.length + 1}`
      params.push(status)
    }

    query += ` ORDER BY a.scheduled_at DESC`

    const sql = getSql()
    const appointments = await sql(query, params)
    return NextResponse.json({ appointments })
  } catch (error) {
    console.error("[v0] Appointments fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { appointmentId, status } = await request.json()

    if (!appointmentId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = getSql()
    const result = await sql(
      `UPDATE appointments 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND nutritionist_id = $3
       RETURNING *`,
      [status, appointmentId, session.userId],
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json({ appointment: result[0] })
  } catch (error) {
    console.error("[v0] Appointment update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
