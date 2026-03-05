import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

const UNRESTRICTED_ROLES = ["ADMIN", "LEADERSHIP"];

export async function GET(request: NextRequest) {
  let member;
  try {
    member = await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allMembers = await prisma.member.findMany({
      where: {
        isActive: true,
        id: { not: member.id },
      },
      select: {
        id: true,
        displayName: true,
        role: true,
      },
      orderBy: { displayName: "asc" },
    });

    // Admins and leadership can see and message everyone
    if (UNRESTRICTED_ROLES.includes(member.role)) {
      return NextResponse.json({ members: allMembers });
    }

    // Regular wing members can only see: same role + admins + leadership
    const visible = allMembers.filter(
      (m) => m.role === member.role || UNRESTRICTED_ROLES.includes(m.role)
    );

    return NextResponse.json({ members: visible });
  } catch {
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
