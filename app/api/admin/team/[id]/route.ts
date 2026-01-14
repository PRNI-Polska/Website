// file: app/api/admin/team/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateTeamMemberSchema } from "@/lib/validations";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const member = await prisma.teamMember.findUnique({ where: { id: params.id } });
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team member" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const body = await request.json();

    const parsed = updateTeamMemberSchema.safeParse({ ...body, id: params.id });
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { id, ...data } = parsed.data;
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    const member = await prisma.teamMember.update({
      where: { id },
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const member = await prisma.teamMember.findUnique({ where: { id: params.id } });
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    await prisma.teamMember.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "TeamMember",
        entityId: params.id,
        userId: user.id,
        details: JSON.stringify({ name: member.name }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
