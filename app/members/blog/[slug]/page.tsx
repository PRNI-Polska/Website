"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, User } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { useMemberLang } from "@/lib/members/LangContext";

interface Post {
  id: string;
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
  INTERVIEW: { pl: "Wywiad", en: "Interview", de: "Interview" },
  OTHER: { pl: "Inne", en: "Other", de: "Sonstiges" },
};

function localized(pl: string, en: string | null, de: string | null, lang: string): string {
  if (lang === "en" && en) return en;
  if (lang === "de" && de) return de;
  return pl;
}

export default function MemberBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { lang, t } = useMemberLang();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/members/news/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setPost(data.post);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/members")}
          className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("home.title")}
        </button>
        <div className="text-center py-16 border border-[#1a1a1a] rounded-xl">
          <p className="text-[#666] text-sm">
            {lang === "de" ? "Beitrag nicht gefunden." : lang === "en" ? "Post not found." : "Nie znaleziono wpisu."}
          </p>
        </div>
      </div>
    );
  }

  const title = localized(post.title, post.titleEn, post.titleDe, lang);
  const content = localized(post.content, post.contentEn, post.contentDe, lang);
  const catLabel = categoryLabels[post.category]?.[lang] || post.category;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/members")}
        className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("home.title")}
      </button>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-wider font-medium text-blue-400/70 bg-blue-400/10 px-2 py-0.5 rounded">
              {catLabel}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
            {title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-[#888]">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span className="text-[#ccc]">{post.authorName}</span>
              {post.authorRole && (
                <span className="text-[#555]">— {post.authorRole}</span>
              )}
            </span>
            {post.publishedAt && (
              <>
                <span className="text-[#333]">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.publishedAt).toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </header>

        {post.featuredImage && (
          <div className="aspect-video w-full overflow-hidden rounded-xl mb-8 border border-[#1a1a1a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featuredImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-invert prose-sm max-w-none text-[#ccc] leading-relaxed">
          <MarkdownRenderer content={content} />
        </div>
      </article>
    </div>
  );
}
