import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createBlogPostSchema } from "@/lib/validations";
import { validateCsrf, csrfErrorResponse } from "@/lib/csrf";

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

    if (!validateCsrf(request)) return csrfErrorResponse();

    const body = await request.json();

    const parsed = createBlogPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const finalSlug =
      data.slug ||
      data.title
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

    const finalStatus = data.status || "DRAFT";

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt,
        content: data.content,
        titleEn: data.titleEn || null,
        titleDe: data.titleDe || null,
        excerptEn: data.excerptEn || null,
        excerptDe: data.excerptDe || null,
        contentEn: data.contentEn || null,
        contentDe: data.contentDe || null,
        authorName: data.authorName,
        authorRole: data.authorRole || null,
        category: data.category || "OPINION",
        status: finalStatus,
        featuredImage: data.featuredImage || null,
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
