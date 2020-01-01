import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VALID_ROLES = ["ADMIN", "LEADERSHIP", "MAIN_WING", "INTERNATIONAL", "FEMALE_WING", "MEMBER"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    } else if (!body.role && !body.displayName && Object.keys(body).length === 0) {
      data.isActive = !member.isActive;
    }

    if (typeof body.role === "string" && VALID_ROLES.includes(body.role)) {
      data.role = body.role;
    }

    if (typeof body.displayName === "string" && body.displayName.trim().length >= 2) {
      data.displayName = body.displayName.trim();
    }

    if (typeof body.fullName === "string") {
      data.fullName = body.fullName.trim() || null;
    }

    if (typeof body.location === "string") {
      data.location = body.location.trim() || null;
    }

    const updated = await prisma.member.update({
      where: { id },
      data,
      select: { id: true, email: true, displayName: true, fullName: true, location: true, role: true, isActive: true },
    });

    return NextResponse.json({ member: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.member.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}
