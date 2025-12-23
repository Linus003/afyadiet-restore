import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Convert the session.userId (string) to a number
    const nutritionistId = parseInt(session.userId, 10);

    if (isNaN(nutritionistId)) {
        return NextResponse.json({ error: "Invalid User ID" }, { status: 400 })
    }

    // Fetch completed sessions
    const history = await db.appointment.findMany({
      where: {
        nutritionist_id: nutritionistId,
        status: 'completed'
      },
      include: {
        client: { select: { name: true, email: true } }
      },
      orderBy: { scheduled_at: 'desc' }
    })

    // FIX 1: Explicit types for reduce
    const totalEarned = history.reduce((sum: number, item: any) => sum + Number(item.price), 0)

    return NextResponse.json({ 
      // FIX 2: Explicit type "any" added here to fix the build error
      history: history.map((item: any) => ({
        id: item.id,
        date: item.scheduled_at,
        clientName: item.client.name,
        duration: `${item.duration_minutes} mins`,
        amount: Number(item.price),
        platformFee: Number(item.price) * 0.10,
        netEarnings: Number(item.price) * 0.90
      })),
      totalEarned
    })

  } catch (error) {
    console.error("Earnings history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
