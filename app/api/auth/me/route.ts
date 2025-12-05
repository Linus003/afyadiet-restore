import { getSessionFromCookie } from "@/lib/session"
import { getUserById } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserById(session.userId)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
