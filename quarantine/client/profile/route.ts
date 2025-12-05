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
    const profile = await sql(
      `SELECT cp.*, u.full_name, u.email, u.avatar_url
      FROM client_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.user_id = $1`,
      [session.userId],
    )

    return NextResponse.json({
      profile: profile[0] || null,
    })
  } catch (error) {
    console.error("[v0] Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bio, goals, dietaryPreferences, healthConditions, location } = await request.json()

    const sql = getSql()
    const result = await sql(
      `UPDATE client_profiles 
      SET bio = $1, goals = $2, dietary_preferences = $3, health_conditions = $4, location = $5
      WHERE user_id = $6
      RETURNING *`,
      [bio, goals, dietaryPreferences, healthConditions, location, session.userId],
    )

    if (result.length === 0) {
      // Create if doesn't exist
      const created = await sql(
        `INSERT INTO client_profiles (user_id, bio, goals, dietary_preferences, health_conditions, location)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [session.userId, bio, goals, dietaryPreferences, healthConditions, location],
      )
      return NextResponse.json({ profile: created[0] }, { status: 201 })
    }

    return NextResponse.json({ profile: result[0] })
  } catch (error) {
    console.error("[v0] Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
