import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// ? Helper to detect mime type manually (No external package needed)
function getContentType(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'gif') return 'image/gif'
  return 'application/octet-stream'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> } 
) {
  try {
    const { filename } = await params
    
    // 1. Define where your files live
    const filePath = path.join(process.cwd(), "public/uploads", filename)

    // 2. Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // 3. Read the file
    const fileBuffer = fs.readFileSync(filePath)

    // 4. Return it as a proper file response
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": getContentType(filename),
        "Content-Disposition": "inline", // 'inline' allows the browser to display PDFs
      },
    })
  } catch (error) {
    console.error("File serve error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}