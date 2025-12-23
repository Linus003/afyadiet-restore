import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust path to your prisma instance

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const county = searchParams.get("county");

  try {
    // 1. Build the query filter
    const whereClause: any = {
      is_verified: true, // ONLY show verified nutritionists to the public
      // You can add more filters here later (e.g., rating > 4.0)
    };

    // 2. If a county is selected, add it to the filter
    if (county && county !== "All") {
      whereClause.county = county;
    }

    // 3. Fetch data
    const nutritionists = await prisma.nutritionist.findMany({
      where: whereClause,
      select: {
        id: true,
        specialty: true,
        rating: true,
        hourly_rate: true,
        county: true,
        user: {
          select: {
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    return NextResponse.json(nutritionists);
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Failed to fetch nutritionists" }, { status: 500 });
  }
}