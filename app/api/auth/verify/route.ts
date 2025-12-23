import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    // Find user with this token
    const user = await db.user.findFirst({
      where: { verification_token: token },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Verify the user
    await db.user.update({
      where: { id: user.id },
      data: {
        email_verified: new Date(), // Set verified timestamp
        verification_token: null,   // Clear the token
      },
    })

    return NextResponse.json({ success: true, message: "Email verified successfully!" })

  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
