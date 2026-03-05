// file: app/api/admin/manifesto/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createManifestoSectionSchema } from "@/lib/validations";

// GET - List all manifesto sections
export async function GET() {
  try {
    await requireAdmin();

    const sections = await prisma.manifestoSection.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("GET manifesto error:", error);
    return NextResponse.json(
      { error: "Failed to fetch manifesto sections" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

// POST - Create new manifesto section
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();

    const parsed = createManifestoSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check slug uniqueness
    const existingSlug = await prisma.manifestoSection.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: "A section with this slug already exists" },
        { status: 400 }
      );
    }

    const section = await prisma.manifestoSection.create({
      data: {
        ...data,
        parentId: data.parentId || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "ManifestoSection",
        entityId: section.id,
        userId: user.id,
        details: JSON.stringify({ title: section.title }),
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("POST manifesto error:", error);
    return NextResponse.json(
      { error: "Failed to create manifesto section" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
