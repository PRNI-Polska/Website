// file: app/api/admin/gallery/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { validateCsrf, csrfErrorResponse } from "@/lib/csrf";
import { z } from "zod";

const updateSchema = z.object({
  caption: z.string().max(500).optional(),
  captionEn: z.string().max(500).nullable().optional(),
  captionDe: z.string().max(500).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  eventDate: z.string().nullable().optional(),
  order: z.number().int().optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!validateCsrf(request)) return csrfErrorResponse();

    const { id } = await ctx.params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updated = await prisma.galleryImage.update({
      where: { id },
      data: {
        caption: data.caption?.trim(),
        captionEn: data.captionEn !== undefined ? (data.captionEn?.trim() || null) : undefined,
        captionDe: data.captionDe !== undefined ? (data.captionDe?.trim() || null) : undefined,
        location: data.location !== undefined ? (data.location?.trim() || null) : undefined,
        eventDate:
          data.eventDate !== undefined
            ? data.eventDate
              ? new Date(data.eventDate)
              : null
            : undefined,
        order: data.order,
        isPublic: data.isPublic,
      },
      select: { id: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "GalleryImage",
        entityId: updated.id,
        userId: user.id,
        details: JSON.stringify(data).slice(0, 500),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Gallery update error:", error);
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!validateCsrf(request)) return csrfErrorResponse();

    const { id } = await ctx.params;
    await prisma.galleryImage.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "GalleryImage",
        entityId: id,
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Gallery delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
