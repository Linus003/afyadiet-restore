import { NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

// Security Check
async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value || cookieStore.get("auth_token")?.value;
  if (!token) return false;
  try {
    const decoded: any = verify(token, process.env.JWT_SECRET || "secret");
    return decoded.role?.toUpperCase() === "ADMIN";
  } catch { return false; }
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Ensure filename is safe
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${Date.now()}-${filename}`;
    
    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    // Write file
    await writeFile(path.join(uploadDir, uniqueName), buffer);
    
    const fileUrl = `/uploads/${uniqueName}`;

    // Save to Media Library DB (Optional tracking)
    await prisma.mediaFile.create({
      data: {
        filename: uniqueName,
        url: fileUrl,
        mimeType: file.type,
        size: file.size
      }
    });

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}