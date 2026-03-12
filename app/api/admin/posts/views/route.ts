import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }

  try {
    const postId = request.nextUrl.searchParams.get("postId");
    if (!postId) {
      return NextResponse.json({ error: "postId parameter is required" }, { status: 400 });
    }

    const views = await prisma.postView.findMany({
      where: { postId },
      include: {
        member: {
          select: { displayName: true, role: true },
        },
      },
      orderBy: { viewedAt: "desc" },
    });

    return NextResponse.json({
      views: views.map((v) => ({
        memberName: v.member.displayName,
        role: v.member.role,
        viewedAt: v.viewedAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch views" }, { status: 500 });
  }
}
