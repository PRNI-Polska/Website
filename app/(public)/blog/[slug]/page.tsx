import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostClient } from "./post-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const serialized = {
    title: post.title,
    titleEn: post.titleEn,
    titleDe: post.titleDe,
    excerpt: post.excerpt,
    excerptEn: post.excerptEn,
    excerptDe: post.excerptDe,
    content: post.content,
    contentEn: post.contentEn,
    contentDe: post.contentDe,
    authorName: post.authorName,
    authorRole: post.authorRole,
    category: post.category,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    featuredImage: post.featuredImage,
  };

  return <PostClient post={serialized} />;
}
