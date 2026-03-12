import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateBlogPostSchema } from "@/lib/validations";
import { validateCsrf, csrfErrorResponse } from "@/lib/csrf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("GET blog post error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      {
        status:
          error instanceof Error && error.message.includes("Unauthorized")
            ? 401
            : 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();

    if (!validateCsrf(request)) return csrfErrorResponse();

    const { id } = await params;
    const rawBody = await request.json();

    const parsed = updateBlogPostSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    const existing = await prisma.blogPost.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A blog post with this slug already exists" },
          { status: 400 }
        );
      }
    }

    let publishedAt = existing.publishedAt;
    if (body.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      publishedAt = new Date();
    } else if (body.status && body.status !== "PUBLISHED") {
      publishedAt = null;
    }

    const ALLOWED_FIELDS = [
      "title", "slug", "excerpt", "content", "authorName", "authorRole",
      "category", "status", "featuredImage",
      "titleEn", "titleDe", "excerptEn", "excerptDe", "contentEn", "contentDe",
    ] as const;

    const sanitizedData: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        sanitizedData[key] = body[key] ?? null;
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...sanitizedData,
        featuredImage: body.featuredImage ?? existing.featuredImage,
        publishedAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "BlogPost",
        entityId: post.id,
        userId: user.id,
        details: JSON.stringify({ title: post.title }),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("PATCH blog post error:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      {
        status:
          error instanceof Error && error.message.includes("Unauthorized")
            ? 401
            : 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();

    if (!validateCsrf(request)) return csrfErrorResponse();

    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "BlogPost",
        entityId: id,
        userId: user.id,
        details: JSON.stringify({ title: post.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE blog post error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      {
        status:
          error instanceof Error && error.message.includes("Unauthorized")
            ? 401
            : 500,
      }
    );
  }
}
