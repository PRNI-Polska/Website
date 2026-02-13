// file: app/api/admin/team/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createTeamMemberSchema } from "@/lib/validations";

export async function GET() {
  try {
    await requireAdmin();
    const members = await prisma.teamMember.findMany({
      orderBy: [{ isLeadership: "desc" }, { order: "asc" }],
    });
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();

    const parsed = createTeamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", ...(process.env.NODE_ENV !== "production" && { details: parsed.error.flatten() }) }, { status: 400 });
    }

    const member = await prisma.teamMember.create({
      data: {
        ...parsed.data,
        photoUrl: parsed.data.photoUrl || null,
        email: parsed.data.email || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "TeamMember",
        entityId: member.id,
        userId: user.id,
        details: JSON.stringify({ name: member.name }),
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
