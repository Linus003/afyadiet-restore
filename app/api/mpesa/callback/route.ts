import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Log the full response to track transactions
    console.log("------- MPESA CALLBACK RECEIVED -------")
    console.log(JSON.stringify(data, null, 2))

    const body = data.Body.stkCallback
    const resultCode = body.ResultCode
    const checkoutId = body.CheckoutRequestID
    const accountReference = body.MerchantRequestID; // This is often the Merchant ID, not AccountRef

    // 1. Find the corresponding appointment using the CheckoutRequestID
    const appointment = await db.appointment.findFirst({
        where: { mpesa_checkout_id: checkoutId }
    })

    if (!appointment) {
        console.error("Callback Error: Appointment not found for CheckoutID:", checkoutId);
        return NextResponse.json({ message: "Appointment not tracked." }, { status: 404 });
    }

    if (resultCode === 0) {
      // PAYMENT SUCCESSFUL
      const meta = body.CallbackMetadata.Item
      const mpesaReceipt = meta.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value
      // const amount = meta.find((i: any) => i.Name === "Amount")?.Value 

      console.log(`✅ Payment SUCCESS for Appointment ${appointment.id}. Receipt: ${mpesaReceipt}`);
      
      // 2. Update Appointment status to 'confirmed'
      await db.appointment.update({
          where: { id: appointment.id },
          data: {
              status: "confirmed",
              mpesa_receipt_number: mpesaReceipt as string,
          }
      })
    } else {
      // PAYMENT FAILED or CANCELLED
      console.log(`❌ Payment FAILED for Appointment ${appointment.id}. Result Code: ${resultCode}`);
      
      // 3. Mark the appointment as 'cancelled' (or 'failed')
      await db.appointment.update({
          where: { id: appointment.id },
          data: {
              status: "cancelled", // Let the client re-book the slot
          }
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Global Callback Error:", error);
    return NextResponse.json({ error: "Callback processing failed" }, { status: 500 })
  }
}
