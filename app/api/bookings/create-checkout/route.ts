import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { nutritionistId, scheduledAt, durationMinutes, notes } = body

    // LOGGING (Check your PM2 logs if this fails!)
    console.log("[Booking Debug] Request received:", { 
      clientId: session.userId, 
      nutritionistId, 
      typeOfId: typeof nutritionistId 
    })

    if (!nutritionistId) {
      return NextResponse.json({ error: "Missing Nutritionist ID" }, { status: 400 })
    }

    // 1. Get Nutritionist Rate (In KSh)
    // We use findFirst to be safe, searching the PROFILES table by USER ID
    const nutritionist = await db.nutritionist.findFirst({
      where: { userId: Number(nutritionistId) }
    })

    if (!nutritionist) {
      console.error("[Booking Error] Nutritionist not found for ID:", nutritionistId)
      return NextResponse.json({ error: "Nutritionist not found in database" }, { status: 404 })
    }

    // Calculate Price
    const rate = Number(nutritionist.hourly_rate) || 0
    const duration = durationMinutes || 60
    const price = (rate / 60) * duration

    // 2. Create Appointment
    const appointment = await db.appointment.create({
      data: {
        client_id: Number(session.userId),
        nutritionist_id: Number(nutritionistId),
        scheduled_at: new Date(scheduledAt),
        duration_minutes: duration,
        price: price,
        notes: notes,
        status: 'pending',
        meeting_link: null
      }
    })

    return NextResponse.json({
      appointmentId: appointment.id,
      amount: Math.round(price),
      currency: "KES",
      message: "Booking created."
    })

  } catch (error) {
    console.error("[Booking Critical Error]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
