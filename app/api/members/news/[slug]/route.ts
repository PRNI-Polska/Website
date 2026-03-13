import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        titleEn: true,
        titleDe: true,
        slug: true,
        excerpt: true,
        excerptEn: true,
        excerptDe: true,
        content: true,
        contentEn: true,
        contentDe: true,
        authorName: true,
        authorRole: true,
        category: true,
        publishedAt: true,
        featuredImage: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("GET member blog post error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
