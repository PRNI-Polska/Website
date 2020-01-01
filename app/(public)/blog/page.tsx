import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Opinie, analizy i komentarze na temat bieżących wydarzeń politycznych i społecznych.",
};

const categoryLabels: Record<string, string> = {
  OPINION: "Opinia",
  ANALYSIS: "Analiza",
  COMMENTARY: "Komentarz",
  REPORT: "Raport",
};

async function getPublishedPosts() {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
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

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-[var(--font-heading)] font-bold mb-2">
          Blog
        </h1>
        <p className="text-muted-foreground">
          Opinie, analizy i komentarze naszych ekspertów.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="card-hover">
              {post.featuredImage && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.featuredImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {categoryLabels[post.category] || post.category}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {post.publishedAt && formatDate(post.publishedAt)}
                  {post.authorName && ` · ${post.authorName}`}
                  {post.authorRole && (
                    <span className="text-muted-foreground/70">
                      {" "}
                      — {post.authorRole}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Brak wpisów na blogu. Wróć wkrótce!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
