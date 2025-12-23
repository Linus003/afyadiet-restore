import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// ? HELPER: Convert Base64 String to a Physical File
const saveFile = (base64String: string, userId: number) => {
  try {
    // 1. If it's already a URL (not base64), just return it
    if (!base64String || !base64String.startsWith("data:")) return base64String; 

    // 2. Parse the Base64 data
    const match = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!match) throw new Error("Invalid file data");

    const mimeType = match[1];
    const base64Data = match[2];
    
    // Determine extension (pdf or image)
    const ext = mimeType.includes("pdf") ? "pdf" : "png";

    // 3. Create a unique filename
    const fileName = `kndi_${userId}_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    // 4. Ensure the 'public/uploads' folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 5. Write the file to disk
    fs.writeFileSync(path.join(uploadDir, fileName), base64Data, "base64");

    // 6. Return the clean URL for the database
    return `/uploads/${fileName}`;
  } catch (e) {
    console.error("File save error:", e);
    return null;
  }
};

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const userId = parseInt(session.userId, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid User ID in session" }, { status: 400 })
    }

    const profile = await db.nutritionist.findUnique({
      where: { userId: userId },
      include: {
        user: { select: { name: true, email: true, avatar_url: true } }
      }
    })

    if (!profile) {
      return NextResponse.json({ profile: null })
    }

    return NextResponse.json({
      profile: {
        ...profile,
        full_name: profile.user.name,
        email: profile.user.email,
        avatar_url: profile.user.avatar_url, 
        years_experience: profile.experience_years,
        // Send expiry date to frontend
        license_expires_at: profile.license_expires_at,
        // ? NEW: Send the saved county back to the frontend
        county: profile.county 
      }
    })
  } catch (error: any) {
    console.error("[v0] Profile GET error:", error)
    return NextResponse.json({ error: "Failed to load profile. " + error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const userId = parseInt(session.userId, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid User ID" }, { status: 400 })
    }

    const body = await request.json()
    // ? NEW: Extract 'county' from the incoming request
    const { bio, specializations, certifications, yearsExperience, hourlyRate, avatarUrl, kndiDocumentUrl, licenseExpiresAt, county } = body

    if (!bio || bio.length < 10) {
      return NextResponse.json({ error: "Bio is too short. Please write at least 10 characters." }, { status: 400 })
    }
    
    // Convert the Base64 doc to a File URL
    const cleanDocUrl = kndiDocumentUrl ? saveFile(kndiDocumentUrl, userId) : null;

    const specialtyString = Array.isArray(specializations) 
      ? specializations.join(", ") 
      : (specializations || "");

    const result = await db.$transaction(async (tx) => {
      
      if (avatarUrl) {
        await tx.user.update({
          where: { id: userId },
          data: { avatar_url: avatarUrl }
        })
      }

      const updatedProfile = await tx.nutritionist.upsert({
        where: { userId: userId },
        update: {
          bio,
          specialty: specialtyString,
          certifications,
          experience_years: parseInt(yearsExperience || 0), 
          hourly_rate: parseFloat(hourlyRate || 0),
          // ? NEW: Update the County field
          county: county || null,
          
          kndi_document_url: cleanDocUrl,
          license_expires_at: licenseExpiresAt ? new Date(licenseExpiresAt) : null,
          verification_status: cleanDocUrl ? "submitted" : "pending"
        },
        create: {
          userId: userId,
          bio,
          specialty: specialtyString || 'General',
          certifications,
          experience_years: parseInt(yearsExperience || 0), 
          hourly_rate: parseFloat(hourlyRate || 0),
          is_verified: false,
          // ? NEW: Save the County field on creation
          county: county || null,

          kndi_document_url: cleanDocUrl,
          license_expires_at: licenseExpiresAt ? new Date(licenseExpiresAt) : null,
          verification_status: cleanDocUrl ? "submitted" : "pending"
        }
      })

      return updatedProfile
    })

    return NextResponse.json({ success: true, profile: result })

  } catch (error: any) {
    console.error("[v0] Profile PUT error:", error)
    return NextResponse.json({ error: "Save failed: " + error.message }, { status: 500 })
  }
}