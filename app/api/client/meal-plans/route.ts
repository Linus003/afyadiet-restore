import { getSessionFromCookie } from "@/lib/session"
import { getSql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getSql()
    const mealPlans = await sql(
      `SELECT mp.*, u.full_name as nutritionist_name, u.avatar_url
       FROM meal_plans mp
       JOIN users u ON mp.nutritionist_id = u.id
       WHERE mp.client_id = $1
       ORDER BY mp.created_at DESC`,
      [session.userId],
    )

    return NextResponse.json({ mealPlans })
  } catch (error) {
    console.error("[v0] Meal plans fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
