import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== "nutritionist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("kndi_document") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Prepare file path
    const buffer = Buffer.from(await file.arrayBuffer())
    // Create a unique filename
    const filename = `kndi_${session.userId}_${Date.now()}.pdf`
    
    // Save to public/uploads folder
    const uploadDir = path.join(process.cwd(), "public/uploads")
    await mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, filename)

    // Write file to disk
    await writeFile(filePath, buffer)
    const fileUrl = `/uploads/${filename}`

    // Update Database Status
    await db.nutritionist.update({
      where: { userId: parseInt(session.userId) },
      data: {
        kndi_document_url: fileUrl,
        verification_status: "submitted"
      }
    })

    return NextResponse.json({ success: true, url: fileUrl })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
