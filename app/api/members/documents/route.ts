import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

export async function GET(request: NextRequest) {
  try {
    await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const documents = await prisma.memberDocument.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ documents });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
