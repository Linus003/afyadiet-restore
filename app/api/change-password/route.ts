import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { compare, hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    // 1. Verify User is Logged In
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value || cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verify(token, process.env.JWT_SECRET || "secret");
    const userId = decoded.userId; // Ensure your JWT payload uses 'userId' or 'id'

    // 2. Get Input Data
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both fields are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }

    // 3. Fetch User from DB
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 4. Verify Old Password
    const isValid = await compare(currentPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
    }

    // 5. Hash New Password & Update
    const hashedPassword = await hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });

  } catch (error) {
    console.error("Password Change Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}