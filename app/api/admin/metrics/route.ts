import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value || cookieStore.get("auth_token")?.value;
  if (!token) return false;
  try {
    const decoded: any = verify(token, process.env.JWT_SECRET || "secret");
    // FIX: Add .toUpperCase() to handle 'admin' vs 'ADMIN' mismatch
    return decoded.role?.toUpperCase() === "ADMIN";
  } catch { return false; }
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Basic Counts
    const totalUsers = await prisma.user.count();
    const totalNutritionists = await prisma.nutritionist.count();
    const totalAppointments = await prisma.appointment.count();

    // 2. Financials (Sum of confirmed/paid appointments)
    const revenueResult = await prisma.appointment.aggregate({
      _sum: { price: true },
      where: { status: { in: ['confirmed', 'completed', 'paid'] } }
    });
    const totalRevenue = revenueResult._sum.price || 0;

    // 3. Recent Transactions (Ledger)
    const recentTransactions = await prisma.appointment.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      where: { price: { gt: 0 } },
      include: { 
        client: { select: { name: true } },
        nutritionist: { select: { name: true } } // Direct relation to User
      }
    });

    return NextResponse.json({
      summary: {
        users: totalUsers,
        nutritionists: totalNutritionists,
        appointments: totalAppointments,
        revenue: totalRevenue,
      },
      transactions: recentTransactions,
    });

  } catch (error) {
    console.error("Metrics Error:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}