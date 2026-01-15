// file: app/(public)/announcements/page.tsx
import { prisma } from "@/lib/db";
import { AnnouncementsPageWrapper } from "./announcements-page-wrapper";
import type { Metadata } from "next";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Komunikaty",
  description: "Bądź na bieżąco z najnowszymi wiadomościami i komunikatami naszej partii.",
};

const ITEMS_PER_PAGE = 9;

interface PageProps {
  searchParams: Promise<{ 
    page?: string; 
    category?: string;
    search?: string;
  }>;
}

async function getAnnouncements(page: number, category?: string, search?: string) {
  const where = {
    status: "PUBLISHED" as const,
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { excerpt: { contains: search, mode: "insensitive" as const } },
        { content: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [announcements, total, categories] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        publishedAt: true,
        featuredImage: true,
        author: {
          select: { name: true },
        },
      },
    }),
    prisma.announcement.count({ where }),
    prisma.announcement.groupBy({
      by: ["category"],
      where: { status: "PUBLISHED" },
      _count: true,
    }),
  ]);

  return {
    announcements,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    categories,
  };
}

export default async function AnnouncementsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const category = resolvedSearchParams.category;
  const search = resolvedSearchParams.search;

  const { announcements, total, totalPages, categories } = await getAnnouncements(
    page,
    category,
    search
  );

  return (
    <AnnouncementsPageWrapper
      announcements={announcements}
      total={total}
      totalPages={totalPages}
      categories={categories}
      currentPage={page}
      activeCategory={category}
      search={search}
    />
  );
}
