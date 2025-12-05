import { getSessionFromCookie } from "@/lib/session"
import { getSql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const sql = getSql()
    const appointment = await sql(
      `SELECT a.*, 
        client.full_name as client_name, client.email as client_email,
        nutritionist.full_name as nutritionist_name, nutritionist.email as nutritionist_email
       FROM appointments a
       JOIN users client ON a.client_id = client.id
       JOIN users nutritionist ON a.nutritionist_id = nutritionist.id
       WHERE a.id = $1 AND (a.client_id = $2 OR a.nutritionist_id = $2)`,
      [id, session.userId],
    )

    if (!appointment || appointment.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json({ appointment: appointment[0] })
  } catch (error) {
    console.error("[v0] Appointment fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
