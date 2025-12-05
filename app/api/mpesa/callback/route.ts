import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    console.log("------- MPESA CALLBACK RECEIVED -------")
    // Log the entire response so you can see it in 'pm2 logs'
    console.log(JSON.stringify(data, null, 2))

    const body = data.Body.stkCallback
    if (body.ResultCode === 0) {
      console.log("✅ Payment Successful!")
      // In the future, we will add code here to automatically mark the 
      // appointment as 'Paid' in your database.
    } else {
      console.log("❌ Payment Failed/Cancelled by User")
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: "Callback Error" }, { status: 500 })
  }
}