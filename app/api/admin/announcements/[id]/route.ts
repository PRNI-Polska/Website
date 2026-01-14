// file: app/api/admin/announcements/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateAnnouncementSchema } from "@/lib/validations";

// GET - Get single announcement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("GET announcement error:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

// PATCH - Update announcement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const parsed = updateAnnouncementSchema.safeParse({ ...body, id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id: parsedId, ...data } = parsed.data;

    // Check if announcement exists
    const existing = await prisma.announcement.findUnique({
      where: { id: parsedId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.announcement.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "An announcement with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Handle publishing
    let publishedAt = existing.publishedAt;
    if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      publishedAt = new Date();
    } else if (data.status && data.status !== "PUBLISHED") {
      publishedAt = null;
    }

    const announcement = await prisma.announcement.update({
      where: { id: parsedId },
      data: {
        ...data,
        featuredImage: data.featuredImage || null,
        publishedAt,
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
        action: "UPDATE",
        entityType: "Announcement",
        entityId: announcement.id,
        userId: user.id,
        details: JSON.stringify({ title: announcement.title }),
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("PATCH announcement error:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

// DELETE - Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    await prisma.announcement.delete({
      where: { id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Announcement",
        entityId: id,
        userId: user.id,
        details: JSON.stringify({ title: announcement.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE announcement error:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
