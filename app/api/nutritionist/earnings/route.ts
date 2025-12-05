import { getSessionFromCookie } from "@/lib/session"
import { getSql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getSql()
    const earnings = await sql(
      `SELECT 
        COUNT(*) as total_appointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_appointments,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as total_earnings,
        AVG(CASE WHEN status = 'completed' THEN price ELSE NULL END) as average_rate
       FROM appointments
       WHERE nutritionist_id = $1`,
      [session.userId],
    )

    const stats = earnings[0]

    return NextResponse.json({
      totalAppointments: Number.parseInt(stats.total_appointments) || 0,
      completedAppointments: Number.parseInt(stats.completed_appointments) || 0,
      totalEarnings: Number.parseFloat(stats.total_earnings) || 0,
      averageRate: Number.parseFloat(stats.average_rate) || 0,
    })
  } catch (error) {
    console.error("[v0] Earnings fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
