// file: app/(public)/announcements/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import type { AnnouncementCategory } from "@prisma/client";

const categoryLabels: Record<AnnouncementCategory, string> = {
  NEWS: "News",
  PRESS_RELEASE: "Press Release",
  POLICY: "Policy",
  CAMPAIGN: "Campaign",
  COMMUNITY: "Community",
  OTHER: "Other",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getAnnouncement(slug: string) {
  const announcement = await prisma.announcement.findUnique({
    where: { 
      slug,
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });

  return announcement;
}

async function getRelatedAnnouncements(category: AnnouncementCategory, excludeId: string) {
  return prisma.announcement.findMany({
    where: {
      status: "PUBLISHED",
      category,
      NOT: { id: excludeId },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const announcement = await getAnnouncement(slug);
  
  if (!announcement) {
    return { title: "Announcement Not Found" };
  }

  return {
    title: announcement.title,
    description: announcement.excerpt,
    openGraph: {
      title: announcement.title,
      description: announcement.excerpt,
      type: "article",
      publishedTime: announcement.publishedAt?.toISOString(),
      ...(announcement.featuredImage && { images: [announcement.featuredImage] }),
    },
  };
}

export default async function AnnouncementPage({ params }: PageProps) {
  const { slug } = await params;
  const announcement = await getAnnouncement(slug);

  if (!announcement) {
    notFound();
  }

  const relatedAnnouncements = await getRelatedAnnouncements(
    announcement.category,
    announcement.id
  );

  return (
    <article className="container-custom py-12">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/announcements">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Announcements
        </Link>
      </Button>

      {/* Header */}
      <header className="max-w-3xl mb-8">
        <Badge variant="secondary" className="mb-4">
          {categoryLabels[announcement.category]}
        </Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          {announcement.title}
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          {announcement.excerpt}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {announcement.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={announcement.publishedAt.toISOString()}>
                {formatDate(announcement.publishedAt)}
              </time>
            </div>
          )}
          {announcement.author?.name && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{announcement.author.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>{categoryLabels[announcement.category]}</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {announcement.featuredImage && (
        <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={announcement.featuredImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl">
        <MarkdownRenderer content={announcement.content} />
      </div>

      {/* Related Announcements */}
      {relatedAnnouncements.length > 0 && (
        <>
          <Separator className="my-12" />
          <section>
            <h2 className="text-2xl font-heading font-semibold mb-6">
              Related Announcements
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedAnnouncements.map((related) => (
                <Link
                  key={related.id}
                  href={`/announcements/${related.slug}`}
                  className="block p-6 border rounded-lg hover:border-primary transition-colors"
                >
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {related.excerpt}
                  </p>
                  {related.publishedAt && (
                    <time className="text-xs text-muted-foreground">
                      {formatDate(related.publishedAt)}
                    </time>
                  )}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </article>
  );
}
