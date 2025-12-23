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
    return decoded.role?.toUpperCase() === "ADMIN";
  } catch { return false; }
}

// GET: Fetch ALL settings (Combines Global Visuals + Legacy Text Settings)
export async function GET() {
  try {
    // 1. Fetch Global Visual/System Settings
    let globalSettings = await prisma.globalSettings.findFirst();
    if (!globalSettings) {
      globalSettings = await prisma.globalSettings.create({ data: {} });
    }

    // 2. Fetch Legacy Text Settings (Mission, Vision, etc.)
    const textSettings = await prisma.siteSetting.findMany();
    const formattedTextSettings = textSettings.reduce((acc: any, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    // 3. Merge them
    return NextResponse.json({
      ...globalSettings,
      ...formattedTextSettings
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST: Update Legacy Text Settings (Mission, Vision)
export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { key, value } = await request.json();

    if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });

    const updated = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// PATCH: Update Global Visual Settings
export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    
    const settings = await prisma.globalSettings.findFirst();

    const updated = await prisma.globalSettings.update({
      where: { id: settings?.id || 1 },
      data: {
        siteName: body.siteName,
        faviconUrl: body.faviconUrl,
        landingHeroImage: body.landingHeroImage,
        logoUrl: body.logoUrl, 
        phoneNumber: body.phoneNumber,
        supportEmail: body.supportEmail,
        primaryColor: body.primaryColor,
        maintenanceMode: body.maintenanceMode,
        mainMenu: body.mainMenu //
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Global Settings Update Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}