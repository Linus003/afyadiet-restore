import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const specialty = searchParams.get("specialty")
    const minRating = searchParams.get("minRating")

    // 1. Build the Filter
    const whereClause: any = {
      is_verified: true, // Only verified nutritionists
      user: {
        role: 'nutritionist'
      }
    }

    // Filter by Specialty (Case insensitive search)
    if (specialty) {
      whereClause.specialty = {
        contains: specialty,
      }
    }

    // Filter by Rating
    if (minRating) {
      whereClause.rating = {
        gte: parseFloat(minRating),
      }
    }

    // 2. Fetch Data using Prisma
    const data = await db.nutritionist.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { total_reviews: 'desc' }
      ],
      take: 50,
    })

    // 3. Transform Data to Match Frontend Expectations
    const nutritionists = data.map((n) => {
      // FIX: Convert "General" (String) -> ["General"] (Array)
      // The frontend expects an array to loop through (map)
      let specs: string[] = []
      if (n.specialty) {
        // If it contains commas, split it. If not, wrap in array.
        specs = n.specialty.includes(',') 
          ? n.specialty.split(',').map(s => s.trim()) 
          : [n.specialty]
      }

      return {
        id: n.user.id,
        full_name: n.user.name,
        avatar_url: n.user.avatar_url,
        bio: n.bio,
        specializations: specs, // <--- This is the fix! Now it's an Array.
        hourly_rate: Number(n.hourly_rate),
        rating: Number(n.rating),
        total_reviews: n.total_reviews,
        is_verified: n.is_verified,
        years_experience: n.experience_years,
        certifications: n.certifications
      }
    })

    return NextResponse.json({ nutritionists })

  } catch (error) {
    console.error("[v0] Nutritionists fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch nutritionists" }, { status: 500 })
  }
}
