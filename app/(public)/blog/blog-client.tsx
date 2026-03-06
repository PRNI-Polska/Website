"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  titleEn: string | null;
  titleDe: string | null;
  slug: string;
  excerpt: string;
  excerptEn: string | null;
  excerptDe: string | null;
  authorName: string;
  authorRole: string | null;
  category: string;
  publishedAt: string | null;
  featuredImage: string | null;
}

const categoryLabels: Record<string, Record<string, string>> = {
  OPINION: { pl: "Opinia", en: "Opinion", de: "Meinung" },
  ANALYSIS: { pl: "Analiza", en: "Analysis", de: "Analyse" },
  COMMENTARY: { pl: "Komentarz", en: "Commentary", de: "Kommentar" },
  REPORT: { pl: "Raport", en: "Report", de: "Bericht" },
};

function localized(pl: string, en: string | null, de: string | null, locale: string): string {
  if (locale === "en" && en) return en;
  if (locale === "de" && de) return de;
  return pl;
}

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  const { locale } = useI18n();

  const emptyLabel = localized(
    "Brak wpisów na blogu. Wróć wkrótce!",
    "No blog posts yet. Check back soon!",
    "Noch keine Blogbeiträge. Schauen Sie bald wieder vorbei!",
    locale
  );

  const pageTitle = localized(
    "Blog",
    "Blog",
    "Blog",
    locale
  );

  const pageSubtitle = localized(
    "Opinie, analizy i komentarze naszych ekspertów.",
    "Opinions, analyses and commentary from our experts.",
    "Meinungen, Analysen und Kommentare unserer Experten.",
    locale
  );

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-[var(--font-heading)] font-bold mb-2">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground">{pageSubtitle}</p>
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
                    {categoryLabels[post.category]?.[locale] || post.category}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {localized(post.title, post.titleEn, post.titleDe, locale)}
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
                  {localized(post.excerpt, post.excerptEn, post.excerptDe, locale)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{emptyLabel}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
