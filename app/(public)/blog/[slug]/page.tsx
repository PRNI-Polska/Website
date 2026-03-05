import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  OPINION: "Opinia",
  ANALYSIS: "Analiza",
  COMMENTARY: "Komentarz",
  REPORT: "Raport",
};

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

  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć do bloga
          </Link>
        </Button>

        <article>
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">
                {categoryLabels[post.category] || post.category}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-[var(--font-heading)] font-bold mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">
                  {post.authorName}
                </span>
                {post.authorRole && (
                  <span className="text-muted-foreground/70">
                    {" "}
                    — {post.authorRole}
                  </span>
                )}
              </div>
              <span>·</span>
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatDate(post.publishedAt)}
                </time>
              )}
            </div>
          </header>

          {post.featuredImage && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featuredImage}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="text-foreground/95 text-lg leading-relaxed">
            <MarkdownRenderer content={post.content} />
          </div>
        </article>
      </div>
    </div>
  );
}
