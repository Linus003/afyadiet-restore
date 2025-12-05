import { getSessionFromCookie } from "@/lib/session"
import { getSql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { nutritionistId, rating, comment } = await request.json()

    if (!nutritionistId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const sql = getSql()

    // Create review
    const result = await sql(
      `INSERT INTO reviews (client_id, nutritionist_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [session.userId, nutritionistId, rating, comment],
    )

    // Update nutritionist rating
    const ratingUpdate = await sql(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
       FROM reviews WHERE nutritionist_id = $1`,
      [nutritionistId],
    )

    await sql(
      `UPDATE nutritionist_profiles 
       SET rating = $1, total_reviews = $2
       WHERE user_id = $3`,
      [
        Math.round(Number.parseFloat(ratingUpdate[0].avg_rating) * 100) / 100,
        Number.parseInt(ratingUpdate[0].total_reviews),
        nutritionistId,
      ],
    )

    return NextResponse.json({ review: result[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Review creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const nutritionistId = searchParams.get("nutritionistId")

    if (!nutritionistId) {
      return NextResponse.json({ error: "Missing nutritionistId" }, { status: 400 })
    }

    const sql = getSql()

    const reviews = await sql(
      `SELECT r.*, u.full_name
       FROM reviews r
       JOIN users u ON r.client_id = u.id
       WHERE r.nutritionist_id = $1
       ORDER BY r.created_at DESC
       LIMIT 50`,
      [nutritionistId],
    )

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("[v0] Reviews fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
