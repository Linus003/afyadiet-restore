import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface SessionPayload {
  userId: string
  email: string
  role: "client" | "nutritionist" | "admin";
}

export async function createSession(payload: SessionPayload): Promise<string> {
  // 💡 FIX: Spread payload into a new object to satisfy Type 'JWTPayload' requirements
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  return token
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as unknown as SessionPayload
  } catch (err) {
    return null
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: true,   // Note: This requires HTTPS. If on localhost/http, login might fail.
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })
}

export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value

    if (!token) return null

    return await verifySession(token)
  } catch (err) {
    return null
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}