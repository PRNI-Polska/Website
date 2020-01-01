import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

export async function GET(request: NextRequest) {
  let member;
  try {
    member = await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const members = await prisma.member.findMany({
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

    return NextResponse.json({ members });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
