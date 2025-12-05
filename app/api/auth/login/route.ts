import { getUserByEmail, verifyPassword } from "@/lib/auth"
import { createSession, setSessionCookie } from "@/lib/session"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const passwordValid = await verifyPassword(password, user.password_hash)
    if (!passwordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // ✅ Correct: Force TypeScript to treat it as a valid role
const token = await createSession({
  userId: user.id.toString(),
  email: user.email,
  role: user.role as "client" | "nutritionist" | "admin",
})
    

    await setSessionCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
