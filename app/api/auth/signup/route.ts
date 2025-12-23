import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/mail"

export async function POST(req: Request) {
  try {
    const { fullName, email, password, role } = await req.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Generate a random token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    await db.user.create({
      data: {
        name: fullName,
        email,
        password_hash: hashedPassword,
        role,
        verification_token: verificationToken,
        email_verified: null // Null means not verified
      },
    })

    // Send the email (don't await it to keep response fast)
    try {
        await sendVerificationEmail(email, verificationToken)
    } catch (emailError) {
        console.error("Failed to send email:", emailError)
        // We still return success for signup, user can request resend later if needed
    }

    return NextResponse.json({ 
      success: true, 
      message: "Account created! Please check your email to verify." 
    })

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
