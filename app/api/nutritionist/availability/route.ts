import { getSessionFromCookie } from "@/lib/session"
import { getSql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getSql()
    const slots = await sql(
      `SELECT * FROM availability_slots 
       WHERE nutritionist_id = $1 
       ORDER BY start_time ASC`,
      [session.userId],
    )

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("[v0] Availability fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { startTime, endTime, isAvailable } = await request.json()

    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = getSql()
    const result = await sql(
      `INSERT INTO availability_slots (nutritionist_id, start_time, end_time, is_available)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [session.userId, startTime, endTime, isAvailable !== false],
    )

    return NextResponse.json({ slot: result[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Availability creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
