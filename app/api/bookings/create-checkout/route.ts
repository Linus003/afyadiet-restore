import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { stkPush } from "@/lib/mpesa"

export async function POST(req: Request) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const clientId = parseInt(session.userId, 10);
    const { nutritionistId, scheduledAt, durationMinutes, price, notes, phoneNumber } = await req.json()

    if (!nutritionistId || !scheduledAt || !durationMinutes || !price || !phoneNumber) {
      return NextResponse.json({ error: "Missing required booking or payment fields" }, { status: 400 })
    }
    
    // 1. Create the Appointment record with a 'pending' status
    const newAppointment = await db.appointment.create({
      data: {
        client_id: clientId,
        nutritionist_id: parseInt(nutritionistId),
        scheduled_at: new Date(scheduledAt),
        duration_minutes: durationMinutes,
        price: parseFloat(price),
        notes,
        status: "pending", // Always pending until payment is confirmed
      }
    })

    // Create a unique reference for the M-Pesa callback
    // Must be a string suitable for M-Pesa (max 12 characters usually, but we ensure it's simple)
    const accountReference = `APT${newAppointment.id}`;
    
    // 2. Trigger M-Pesa STK Push
    const mpesaResult = await stkPush(
      parseFloat(price), 
      phoneNumber, 
      accountReference
    )

    // Check if STK push was successfully initiated
    if (mpesaResult.ResponseCode === "0") {
      const checkoutId = mpesaResult.CheckoutRequestID;
      
      // 3. Save the M-Pesa tracking ID to the appointment record
      await db.appointment.update({
        where: { id: newAppointment.id },
        data: {
          mpesa_checkout_id: checkoutId,
        }
      })
      
      // Return success along with the Checkout ID for the frontend to track
      return NextResponse.json({ 
        success: true, 
        message: "Payment initiated. Check your phone.",
        checkoutId: checkoutId,
        appointmentId: newAppointment.id
      })
    } else {
      // M-Pesa initiation failed (e.g., Daraja API error)
      console.error("M-Pesa Init Error:", mpesaResult);
      // Clean up the pending appointment record 
      await db.appointment.delete({ where: { id: newAppointment.id } });

      return NextResponse.json({ 
        error: mpesaResult.CustomerMessage || mpesaResult.errorMessage || "Payment initiation failed."
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("Booking POST error:", error)
    return NextResponse.json({ error: "Failed to finalize booking: " + error.message }, { status: 500 })
  }
}