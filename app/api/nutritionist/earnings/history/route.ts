import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 💡 FIX: Convert the session.userId (string) to a number
    const nutritionistId = parseInt(session.userId, 10);

    // Safety check to ensure the ID is valid
    if (isNaN(nutritionistId)) {
        return NextResponse.json({ error: "Invalid User ID" }, { status: 400 })
    }

    // Fetch completed sessions
    const history = await db.appointment.findMany({
      where: {
        nutritionist_id: nutritionistId, // Use the numeric ID here
        status: 'completed' // Only show earned money
      },
      include: {
        client: { select: { name: true, email: true } }
      },
      orderBy: { scheduled_at: 'desc' }
    })

    // Calculate Total
    const totalEarned = history.reduce((sum, item) => sum + Number(item.price), 0)

    return NextResponse.json({ 
      history: history.map(item => ({
        id: item.id,
        date: item.scheduled_at,
        clientName: item.client.name,
        duration: `${item.duration_minutes} mins`,
        amount: Number(item.price), // KSh
        platformFee: Number(item.price) * 0.10, // Example 10% fee log
        netEarnings: Number(item.price) * 0.90
      })),
      totalEarned
    })

  } catch (error) {
    console.error("Earnings history error:", error); // Helpful for debugging
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}