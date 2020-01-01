// file: app/(public)/announcements/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import type { AnnouncementCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Stay updated with the latest news and announcements from our party.",
};

const ITEMS_PER_PAGE = 9;

const categoryLabels: Record<AnnouncementCategory, string> = {
  NEWS: "News",
  PRESS_RELEASE: "Press Release",
  POLICY: "Policy",
  CAMPAIGN: "Campaign",
  COMMUNITY: "Community",
  OTHER: "Other",
};

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

function SearchForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <form className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        name="search"
        placeholder="Search announcements..."
        defaultValue={defaultValue}
        className="pl-10"
      />
    </form>
  );
}

function CategoryFilter({ 
  categories, 
  activeCategory 
}: { 
  categories: { category: string; _count: number }[];
  activeCategory?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/announcements">
        <Badge variant={!activeCategory ? "default" : "outline"} className="cursor-pointer">
          All
        </Badge>
      </Link>
      {categories.map(({ category, _count }) => (
        <Link key={category} href={`/announcements?category=${category}`}>
          <Badge 
            variant={activeCategory === category ? "default" : "outline"} 
            className="cursor-pointer"
          >
            {categoryLabels[category as AnnouncementCategory]} ({_count})
          </Badge>
        </Link>
      ))}
    </div>
  );
}

function Pagination({ 
  currentPage, 
  totalPages,
  searchParams,
}: { 
  currentPage: number; 
  totalPages: number;
  searchParams: { category?: string; search?: string };
}) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.search) params.set("search", searchParams.search);
    params.set("page", page.toString());
    return `/announcements?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)}>Previous</Link>
        ) : (
          <span>Previous</span>
        )}
      </Button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            asChild={page !== currentPage}
          >
            {page !== currentPage ? (
              <Link href={createPageUrl(page)}>{page}</Link>
            ) : (
              <span>{page}</span>
            )}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)}>Next</Link>
        ) : (
          <span>Next</span>
        )}
      </Button>
    </div>
  );
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
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
          Announcements
        </h1>
        <p className="text-muted-foreground">
          Stay updated with the latest news and announcements from our party.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Suspense fallback={<div className="h-10 w-full max-w-md bg-muted animate-pulse rounded-md" />}>
          <SearchForm defaultValue={search} />
        </Suspense>
        <CategoryFilter categories={categories} activeCategory={category} />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-6">
        Showing {announcements.length} of {total} announcements
        {search && ` for "${search}"`}
        {category && ` in ${categoryLabels[category as AnnouncementCategory]}`}
      </p>

      {/* Announcements Grid */}
      {announcements.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="card-hover">
              {announcement.featuredImage && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={announcement.featuredImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {categoryLabels[announcement.category as AnnouncementCategory]}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">
                  <Link 
                    href={`/announcements/${announcement.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {announcement.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {announcement.publishedAt && formatDate(announcement.publishedAt)}
                  {announcement.author?.name && ` • ${announcement.author.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {announcement.excerpt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No announcements found.
              {(search || category) && " Try adjusting your filters."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        searchParams={{ category, search }}
      />
    </div>
  );
}
