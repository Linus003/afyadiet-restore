import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    
    // 💡 Fix 1: Cast role to string to avoid TypeScript error 
    // because "admin" isn't in your strict role definition yet.
    if (!session || (session.role as string) !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Fetch Counts
    const totalClients = await db.user.count({ where: { role: 'client' } })
    const totalNutritionists = await db.nutritionist.count()
    const pendingVerifications = await db.nutritionist.count({ where: { verification_status: 'submitted' } })
    
    // 2. Calculate Revenue (Sum of all completed appointments)
    const earnings = await db.appointment.aggregate({
      where: { status: 'completed' },
      _sum: { price: true }
    })

    // 3. Fetch Recent Activity (Last 5 Bookings)
    const recentBookings = await db.appointment.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        client: { select: { name: true } },
        // 💡 Fix 2: 'nutritionist' relates to User directly, so we select 'name' directly.
        // Removed the nested { user: ... } wrapper.
        nutritionist: { select: { name: true } }
      }
    })

    // 4. Mock System Load (Since we can't read actual VPS CPU from Node easily)
    const systemHealth = {
      status: 'Healthy',
      uptime: process.uptime(),
      dbConnection: 'Active'
    }

    return NextResponse.json({
      stats: {
        clients: totalClients,
        nutritionists: totalNutritionists,
        pending: pendingVerifications,
        revenue: earnings._sum.price || 0,
      },
      recentActivity: recentBookings,
      system: systemHealth
    })

  } catch (error) {
    console.error("Admin Stats Error:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}