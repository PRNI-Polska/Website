import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

export async function POST(request: NextRequest) {
  let member;
  try {
    member = await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const postId = typeof body.postId === "string" ? body.postId.trim() : "";

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    await prisma.postView.upsert({
      where: { postId_memberId: { postId, memberId: member.id } },
      create: { postId, memberId: member.id },
      update: { viewedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const postIds = request.nextUrl.searchParams.get("postIds");
    if (!postIds) {
      return NextResponse.json({ error: "postIds parameter is required" }, { status: 400 });
    }

    const ids = postIds.split(",").filter(Boolean);

    const counts = await prisma.postView.groupBy({
      by: ["postId"],
      where: { postId: { in: ids } },
      _count: { id: true },
    });

    const viewCounts: Record<string, number> = {};
    for (const c of counts) {
      viewCounts[c.postId] = c._count.id;
    }

    return NextResponse.json({ viewCounts });
  } catch {
    return NextResponse.json({ error: "Failed to fetch view counts" }, { status: 500 });
  }
}
