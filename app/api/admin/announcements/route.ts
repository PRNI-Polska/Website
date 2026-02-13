// file: app/api/admin/announcements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createAnnouncementSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

// GET - List all announcements
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const announcements = await prisma.announcement.findMany({
      where: {
        ...(status && { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }),
        ...(category && { category: category as any }),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("GET announcements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

// POST - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();

    // Validate input
    const parsed = createAnnouncementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", ...(process.env.NODE_ENV !== "production" && { details: parsed.error.flatten() }) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Auto-generate slug if not provided
    const slug = data.slug || slugify(data.title);

    // Check if slug is unique
    const existingSlug = await prisma.announcement.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: "An announcement with this slug already exists" },
        { status: 400 }
      );
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        ...data,
        slug,
        featuredImage: data.featuredImage || null,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        authorId: user.id,
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "Announcement",
        entityId: announcement.id,
        userId: user.id,
        details: JSON.stringify({ title: announcement.title }),
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("POST announcement error:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
