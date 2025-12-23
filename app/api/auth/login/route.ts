import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken"
import { serialize } from "cookie"

const SECRET = process.env.JWT_SECRET || "super-secret-key"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check Verification
    if (!user.email_verified) {
      return NextResponse.json({ error: "Please verify your email address first." }, { status: 403 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create Token
    const token = sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      SECRET,
      { expiresIn: "7d" }
    )

    // 💡 FIX: Changed cookie name from "session_token" to "session"
    const cookie = serialize("session", token, {
      httpOnly: true,
      secure: true, // Revert to true since your domain is HTTPS
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      },
    })

    response.headers.set("Set-Cookie", cookie)
    return response

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
