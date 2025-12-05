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
    const profile = await sql(
      `SELECT np.*, u.full_name, u.email, u.avatar_url
      FROM nutritionist_profiles np
      JOIN users u ON np.user_id = u.id
      WHERE np.user_id = $1`,
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
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bio, specializations, certifications, yearsExperience, hourlyRate } = await request.json()

    const sql = getSql()
    const result = await sql(
      `UPDATE nutritionist_profiles 
      SET bio = $1, specializations = $2, certifications = $3, years_experience = $4, hourly_rate = $5, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $6
      RETURNING *`,
      [bio, specializations, certifications, yearsExperience, hourlyRate, session.userId],
    )

    if (result.length === 0) {
      const created = await sql(
        `INSERT INTO nutritionist_profiles (user_id, bio, specializations, certifications, years_experience, hourly_rate)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [session.userId, bio, specializations, certifications, yearsExperience, hourlyRate],
      )
      return NextResponse.json({ profile: created[0] }, { status: 201 })
    }

    return NextResponse.json({ profile: result[0] })
  } catch (error) {
    console.error("[v0] Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
