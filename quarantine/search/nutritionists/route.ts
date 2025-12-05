import { getSql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 })
    }

    const sql = getSql()
    const results = await sql(
      `SELECT 
        u.id,
        u.full_name,
        u.avatar_url,
        np.bio,
        np.specializations,
        np.hourly_rate,
        np.rating,
        np.total_reviews
      FROM users u
      JOIN nutritionist_profiles np ON u.id = np.user_id
      WHERE u.role = 'nutritionist' AND np.is_verified = true
      AND (u.full_name ILIKE $1 OR np.bio ILIKE $1 OR np.specializations::text ILIKE $1)
      LIMIT 20`,
      [`%${query}%`],
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[v0] Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
