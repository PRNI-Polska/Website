import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const posts = await prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET blog posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      {
        status:
          error instanceof Error && error.message.includes("Unauthorized")
            ? 401
            : 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();

    const {
      title, slug, excerpt, content,
      titleEn, titleDe, excerptEn, excerptDe, contentEn, contentDe,
      authorName, authorRole, category, status, featuredImage,
    } = body;

    if (!title || !excerpt || !content || !authorName) {
      return NextResponse.json(
        { error: "Missing required fields: title, excerpt, content, authorName" },
        { status: 400 }
      );
    }

    const finalSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const existingSlug = await prisma.blogPost.findUnique({
      where: { slug: finalSlug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: "A blog post with this slug already exists" },
        { status: 400 }
      );
    }

    const finalStatus = status || "DRAFT";

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        excerpt,
        content,
        titleEn: titleEn || null,
        titleDe: titleDe || null,
        excerptEn: excerptEn || null,
        excerptDe: excerptDe || null,
        contentEn: contentEn || null,
        contentDe: contentDe || null,
        authorName,
        authorRole: authorRole || null,
        category: category || "OPINION",
        status: finalStatus,
        featuredImage: featuredImage || null,
        publishedAt: finalStatus === "PUBLISHED" ? new Date() : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "BlogPost",
        entityId: post.id,
        userId: user.id,
        details: JSON.stringify({ title: post.title }),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST blog post error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      {
        status:
          error instanceof Error && error.message.includes("Unauthorized")
            ? 401
            : 500,
      }
    );
  }
}
