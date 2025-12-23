import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    // ============================================================
    // 1. AUTHENTICATION CHECK (Fixed for 'session' cookie)
    // ============================================================
    const cookieStore = await cookies(); 
    let tokenValue: string | undefined;

    // A. Priority 1: Check Authorization Header (Bearer)
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      tokenValue = authHeader.split(" ")[1];
    }

    // B. Priority 2: Check the 'session' Cookie (Based on your Screenshot)
    if (!tokenValue) {
      // Your screenshots show the cookie is named "session"
      const sessionCookie = cookieStore.get("session");
      if (sessionCookie) {
        tokenValue = sessionCookie.value;
      } 
      // Fallback: Check 'auth_token' just in case
      else if (cookieStore.get("auth_token")) {
        tokenValue = cookieStore.get("auth_token")?.value;
      }
    }

    // C. If still missing, fail
    if (!tokenValue) {
      console.log("DEBUG: Auth failed. Cookies found:", cookieStore.getAll().map(c => c.name));
      return NextResponse.json(
        { error: "Unauthorized: No token found. (Looked for 'session' cookie)" }, 
        { status: 401 }
      );
    }

    let userId: number;
    try {
      const decoded: any = verify(tokenValue, process.env.JWT_SECRET || "secret");
      userId = parseInt(decoded.userId);
    } catch (e) {
      console.error("Token verification failed:", e);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // ============================================================
    // 2. PARSE FORM DATA
    // ============================================================
    const formData = await request.formData();
    const file = formData.get("kndi_document") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Please ensure you selected a PDF." }, 
        { status: 400 }
      );
    }

    // ============================================================
    // 3. SAVE FILE
    // ============================================================
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/\s+/g, "_");
    const filename = `kndi_${userId}_${Date.now()}_${safeName}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    try {
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
    } catch (fsError) {
      console.error("File System Error:", fsError);
      return NextResponse.json(
        { error: "Server failed to write file to disk." }, 
        { status: 500 }
      );
    }

    const fileUrl = `/uploads/${filename}`;

    // ============================================================
    // 4. UPDATE DATABASE
    // ============================================================
    await prisma.nutritionist.update({
      where: { userId: userId },
      data: {
        kndi_document_url: fileUrl,
        verification_status: "submitted",
        is_verified: false,
      },
    });

    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error: any) {
    console.error("Verification Route Crash:", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + error.message }, 
      { status: 500 }
    );
  }
}