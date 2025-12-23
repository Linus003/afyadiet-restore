import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

// Helper: Check Admin Auth
async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value || cookieStore.get("auth_token")?.value;
  if (!token) return false;
  try {
    const decoded: any = verify(token, process.env.JWT_SECRET || "secret");
    const role = decoded.role?.toUpperCase();
    return role === "ADMIN";
  } catch { return false; }
}

// 1. GET: Fetch Pending Verifications
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pendingNutritionists = await prisma.nutritionist.findMany({
      where: {
        OR: [
          { verification_status: "submitted" },
          { verification_status: "pending" }
        ]
      },
      include: {
        user: {
          select: { name: true, email: true, avatar_url: true }
        }
      },
      orderBy: { updated_at: 'desc' }
    });
    return NextResponse.json(pendingNutritionists);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// 2. PATCH: Approve or Reject
export async function PATCH(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, action } = body; // action = 'approve' or 'reject'

  if (!id || !action) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  try {
    if (action === "approve") {
      await prisma.nutritionist.update({
        where: { id: parseInt(id) },
        data: {
          is_verified: true,
          verification_status: "verified"
        }
      });
    } else if (action === "reject") {
      await prisma.nutritionist.update({
        where: { id: parseInt(id) },
        data: {
          is_verified: false,
          verification_status: "rejected"
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}