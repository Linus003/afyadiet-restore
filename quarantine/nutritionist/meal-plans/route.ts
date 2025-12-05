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
    const plans = await sql(
      `SELECT mp.*, u.full_name as client_name
       FROM meal_plans mp
       JOIN users u ON mp.client_id = u.id
       WHERE mp.nutritionist_id = $1
       ORDER BY mp.created_at DESC`,
      [session.userId],
    )

    return NextResponse.json({ mealPlans: plans })
  } catch (error) {
    console.error("[v0] Meal plans fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clientId, title, content, fileUrl } = await request.json()

    if (!clientId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = getSql()
    const result = await sql(
      `INSERT INTO meal_plans (nutritionist_id, client_id, title, content, file_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [session.userId, clientId, title, content, fileUrl],
    )

    return NextResponse.json({ mealPlan: result[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Meal plan creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
