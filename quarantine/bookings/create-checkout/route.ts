import { getSessionFromCookie } from "@/lib/session"
import { getSql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { nutritionistId, scheduledAt, durationMinutes, notes } = await request.json()

    if (!nutritionistId || !scheduledAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = getSql()

    // Get nutritionist hourly rate
    const nutritionist = await sql(`SELECT hourly_rate FROM nutritionist_profiles WHERE user_id = $1`, [nutritionistId])

    if (!nutritionist || nutritionist.length === 0) {
      return NextResponse.json({ error: "Nutritionist not found" }, { status: 404 })
    }

    const hourlyRate = nutritionist[0].hourly_rate
    const price = (hourlyRate * durationMinutes) / 60

    // Create pending appointment (payment will confirm it)
    const appointment = await sql(
      `INSERT INTO appointments (client_id, nutritionist_id, scheduled_at, duration_minutes, price, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id`,
      [session.userId, nutritionistId, scheduledAt, durationMinutes || 60, price, notes],
    )

    // In a full implementation, this would create a Stripe checkout session
    // For now, return the appointment ID and price for client-side Stripe integration
    return NextResponse.json({
      appointmentId: appointment[0].id,
      amount: Math.round(price * 100), // Convert to cents for Stripe
      clientSecret: `pi_${Math.random().toString(36).substr(2, 9)}`, // Placeholder
    })
  } catch (error) {
    console.error("[v0] Checkout creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
