import { clearSessionCookie } from "@/lib/session"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await clearSessionCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
