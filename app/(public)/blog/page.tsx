import { prisma } from "@/lib/db";
import { BlogClient } from "./blog-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Opinie, analizy i komentarze na temat bieżących wydarzeń politycznych i społecznych.",
};

async function getPublishedPosts() {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      titleEn: true,
      titleDe: true,
      slug: true,
      excerpt: true,
      excerptEn: true,
      excerptDe: true,
      authorName: true,
      authorRole: true,
      category: true,
      publishedAt: true,
      featuredImage: true,
    },
  });
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  const serialized = posts.map((post) => ({
    ...post,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  }));

  return <BlogClient posts={serialized} />;
}
