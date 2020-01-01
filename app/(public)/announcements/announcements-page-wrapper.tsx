// file: app/(public)/announcements/announcements-page-wrapper.tsx
"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { AnnouncementCategory } from "@/lib/types";

interface Announcement {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  publishedAt: Date | null;
  featuredImage: string | null;
  author: { name: string | null } | null;
}

interface CategoryCount {
  category: string;
  _count: number;
}

interface AnnouncementsPageWrapperProps {
  announcements: Announcement[];
  total: number;
  totalPages: number;
  categories: CategoryCount[];
  currentPage: number;
  activeCategory?: string;
  search?: string;
}

export function AnnouncementsPageWrapper({
  announcements,
  total,
  totalPages,
  categories,
  currentPage,
  activeCategory,
  search,
}: AnnouncementsPageWrapperProps) {
  const { t } = useI18n();

  const getCategoryLabel = (category: string): string => {
    const key = `category.${category}`;
    return t(key);
  };

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
          {t("announcements.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("announcements.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Suspense fallback={<div className="h-10 w-full max-w-md bg-muted animate-pulse rounded-md" />}>
          <SearchForm defaultValue={search} placeholder={t("announcements.search")} />
        </Suspense>
        <CategoryFilter 
          categories={categories} 
          activeCategory={activeCategory} 
          getCategoryLabel={getCategoryLabel}
          allLabel={t("announcements.all")}
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-6">
        {t("announcements.showing")} {announcements.length} {t("announcements.of")} {total}
        {search && ` ${t("announcements.for")} "${search}"`}
        {activeCategory && ` ${t("announcements.in")} ${getCategoryLabel(activeCategory)}`}
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
                    {getCategoryLabel(announcement.category)}
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
              {t("announcements.none")}
              {(search || activeCategory) && ` ${t("announcements.adjustFilters")}`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        searchParams={{ category: activeCategory, search }}
        previousLabel={t("announcements.previous")}
        nextLabel={t("announcements.next")}
      />
    </div>
  );
}

function SearchForm({ defaultValue, placeholder }: { defaultValue?: string; placeholder: string }) {
  return (
    <form className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        name="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="pl-10"
      />
    </form>
  );
}

function CategoryFilter({ 
  categories, 
  activeCategory,
  getCategoryLabel,
  allLabel,
}: { 
  categories: CategoryCount[];
  activeCategory?: string;
  getCategoryLabel: (category: string) => string;
  allLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/announcements">
        <Badge variant={!activeCategory ? "default" : "outline"} className="cursor-pointer">
          {allLabel}
        </Badge>
      </Link>
      {categories.map(({ category, _count }) => (
        <Link key={category} href={`/announcements?category=${category}`}>
          <Badge 
            variant={activeCategory === category ? "default" : "outline"} 
            className="cursor-pointer"
          >
            {getCategoryLabel(category)} ({_count})
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
  previousLabel,
  nextLabel,
}: { 
  currentPage: number; 
  totalPages: number;
  searchParams: { category?: string; search?: string };
  previousLabel: string;
  nextLabel: string;
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
          <Link href={createPageUrl(currentPage - 1)}>{previousLabel}</Link>
        ) : (
          <span>{previousLabel}</span>
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
          <Link href={createPageUrl(currentPage + 1)}>{nextLabel}</Link>
        ) : (
          <span>{nextLabel}</span>
        )}
      </Button>
    </div>
  );
}
