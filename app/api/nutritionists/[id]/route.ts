import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ? Await params for Next.js 15+
    const { id } = await params;
    
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const n = await db.nutritionist.findFirst({
      where: { userId: userId },
      include: {
        user: { select: { id: true, name: true, avatar_url: true, email: true } },
      },
    })

    if (!n) {
      return NextResponse.json({ error: "Nutritionist not found" }, { status: 404 })
    }

    // Fix: Convert specialty string to array
    let specs: string[] = []
    if (n.specialty) {
      specs = n.specialty.includes(',') 
        ? n.specialty.split(',').map(s => s.trim()) 
        : [n.specialty]
    }

    return NextResponse.json({ 
      nutritionist: {
        id: n.user.id,
        full_name: n.user.name,
        avatar_url: n.user.avatar_url,
        bio: n.bio,
        specializations: specs,
        hourly_rate: Number(n.hourly_rate),
        rating: Number(n.rating),
        total_reviews: n.total_reviews,
        is_verified: n.is_verified,
        years_experience: n.experience_years,
        certifications: n.certifications,
        meeting_link: "" 
      } 
    })

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}