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

// GET: Fetch a single page details with sections
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = await prisma.dynamicPage.findUnique({
    where: { id: params.id },
    include: { sections: { orderBy: { order: 'asc' } } }
  });

  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  return NextResponse.json(page);
}

// PATCH: Update page content (Save changes)
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FIX: Changed 'req' to 'request' to match the function argument above
  const body = await request.json();

  try {
    // 1. Update basic info
    await prisma.dynamicPage.update({
      where: { id: params.id },
      data: {
        title: body.title,
        slug: body.slug,
        isPublished: body.isPublished,
        description: body.description
      }
    });

    // 2. Update Sections (Delete old, create new - simplified approach for consistency)
    // First, delete existing sections for this page
    await prisma.pageSection.deleteMany({ where: { pageId: params.id } });

    // Then re-create them in the new order
    if (body.sections && Array.isArray(body.sections)) {
      for (const [index, section] of body.sections.entries()) {
        await prisma.pageSection.create({
          data: {
            pageId: params.id,
            type: section.type,
            order: index,
            content: section.content
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save Error:", error);
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 });
  }
}