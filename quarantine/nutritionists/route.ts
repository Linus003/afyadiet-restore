import { getSql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const sql = getSql()

    const nutritionist = await sql(
      `SELECT 
        u.id,
        u.full_name,
        u.avatar_url,
        u.created_at,
        np.bio,
        np.specializations,
        np.hourly_rate,
        np.rating,
        np.total_reviews,
        np.is_verified,
        np.years_experience,
        np.certifications
      FROM users u
      JOIN nutritionist_profiles np ON u.id = np.user_id
      WHERE u.id = $1 AND u.role = 'nutritionist'`,
      [id],
    )

    if (!nutritionist || nutritionist.length === 0) {
      return NextResponse.json({ error: "Nutritionist not found" }, { status: 404 })
    }

    const reviews = await sql(
      `SELECT r.rating, r.comment, r.created_at, u.full_name
       FROM reviews r
       JOIN users u ON r.client_id = u.id
       WHERE r.nutritionist_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id],
    )

    return NextResponse.json({
      nutritionist: nutritionist[0],
      reviews,
    })
  } catch (error) {
    console.error("[v0] Nutritionist detail error:", error)
    return NextResponse.json({ error: "Failed to fetch nutritionist" }, { status: 500 })
  }
}
