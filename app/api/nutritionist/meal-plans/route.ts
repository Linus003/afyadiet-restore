import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const nutritionistId = parseInt(session.userId, 10);
    if (isNaN(nutritionistId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    // 1. Fetch Existing Meal Plans
    const plans = await db.mealPlan.findMany({
      where: { nutritionist_id: nutritionistId },
      include: {
        // Select 'name' (Prisma field) which maps to 'full_name' (DB column)
        client: { select: { id: true, name: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    })

    // 2. Fetch Clients
    const distinctClientIds = await db.appointment.findMany({
      where: { nutritionist_id: nutritionistId },
      distinct: ['client_id'],
      select: { client_id: true }
    })

    const clientIds = distinctClientIds.map(a => a.client_id)
    
    const clients = await db.user.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true, email: true }
    })

    // 3. Map data for Frontend
    const formattedPlans = plans.map(plan => ({
      ...plan,
      // Map 'content' -> 'instructions' for frontend compatibility if needed, 
      // or just send content directly. Let's send content.
      instructions: plan.content, 
      client: {
        ...plan.client,
        full_name: plan.client.name, 
      }
    }))

    const formattedClients = clients.map(client => ({
      ...client,
      full_name: client.name 
    }))

    return NextResponse.json({ plans: formattedPlans, clients: formattedClients })

  } catch (error: any) {
    console.error("Meal Plans GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ? FIX: Destructure 'content' instead of 'instructions'
    const { title, content, clientId } = await request.json()

    if (!title || !clientId) {
        return NextResponse.json({ error: "Title and Client are required" }, { status: 400 })
    }

    // Create the Meal Plan
    const newPlan = await db.mealPlan.create({
        data: {
            title,
            // ? FIX: Save to 'content' field in DB
            content: content, 
            nutritionist_id: parseInt(session.userId),
            client_id: parseInt(clientId),
        }
    })

    return NextResponse.json({ success: true, plan: newPlan })

  } catch (error: any) {
    console.error("Meal Plan POST Error:", error)
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 })
  }
}