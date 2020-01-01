"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { formatDate } from "@/lib/utils";

interface Post {
  title: string;
  titleEn: string | null;
  titleDe: string | null;
  excerpt: string;
  excerptEn: string | null;
  excerptDe: string | null;
  content: string;
  contentEn: string | null;
  contentDe: string | null;
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

export function PostClient({ post }: { post: Post }) {
  const { locale } = useI18n();

  const backLabel = localized("Wróć do bloga", "Back to blog", "Zurück zum Blog", locale);

  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>

        <article>
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">
                {categoryLabels[post.category]?.[locale] || post.category}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-[var(--font-heading)] font-bold mb-4">
              {localized(post.title, post.titleEn, post.titleDe, locale)}
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
                <time dateTime={post.publishedAt}>
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
            <MarkdownRenderer
              content={localized(post.content, post.contentEn, post.contentDe, locale)}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
