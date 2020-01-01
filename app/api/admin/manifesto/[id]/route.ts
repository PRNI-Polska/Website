// file: app/api/admin/manifesto/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateManifestoSectionSchema } from "@/lib/validations";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const section = await prisma.manifestoSection.findUnique({ where: { id: params.id } });
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }
    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch section" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const body = await request.json();

    const parsed = updateManifestoSectionSchema.safeParse({ ...body, id: params.id });
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { id, ...data } = parsed.data;
    const existing = await prisma.manifestoSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.manifestoSection.findUnique({ where: { slug: data.slug } });
      if (slugExists) {
        return NextResponse.json({ error: "A section with this slug already exists" }, { status: 400 });
      }
    }

    const section = await prisma.manifestoSection.update({
      where: { id },
      data: { ...data, parentId: data.parentId || null },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "ManifestoSection",
        entityId: section.id,
        userId: user.id,
        details: JSON.stringify({ title: section.title }),
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const section = await prisma.manifestoSection.findUnique({ where: { id: params.id } });
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Delete children first
    await prisma.manifestoSection.deleteMany({ where: { parentId: params.id } });
    await prisma.manifestoSection.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "ManifestoSection",
        entityId: params.id,
        userId: user.id,
        details: JSON.stringify({ title: section.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
