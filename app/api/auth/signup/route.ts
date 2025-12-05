import { createUser, getUserByEmail } from "@/lib/auth"
import { createSession, setSessionCookie } from "@/lib/session"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role } = await request.json()

    // Validation
    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Create user
    const user = await createUser(email, password, fullName, role)

    // Create session
    const token = await createSession({
      // 💡 Fix 1: Convert ID to string
      userId: user.id.toString(),
      email: user.email,
      // 💡 Fix 2: Cast role to specific union type
      role: user.role as "client" | "nutritionist" | "admin",
    })

    await setSessionCookie(token)

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          // 💡 Fix 3: Use 'name' instead of 'full_name' to match your schema
          fullName: user.name, 
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}