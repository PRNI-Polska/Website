// file: app/api/admin/team/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateTeamMemberSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team member" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const parsed = updateTeamMemberSchema.safeParse({ ...body, id });
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", ...(process.env.NODE_ENV !== "production" && { details: parsed.error.flatten() }) }, { status: 400 });
    }

    const { id: parsedId, ...data } = parsed.data;
    const existing = await prisma.teamMember.findUnique({ where: { id: parsedId } });
    if (!existing) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    const member = await prisma.teamMember.update({
      where: { id: parsedId },
      data: {
        ...data,
        photoUrl: data.photoUrl || null,
        email: data.email || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "TeamMember",
        entityId: member.id,
        userId: user.id,
        details: JSON.stringify({ name: member.name }),
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    await prisma.teamMember.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "TeamMember",
        entityId: id,
        userId: user.id,
        details: JSON.stringify({ name: member.name }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
