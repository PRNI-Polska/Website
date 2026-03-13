"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, FileText, Calendar, ChevronRight, Eye } from "lucide-react";
import { useMemberLang } from "@/lib/members/LangContext";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName?: string;
  category: string;
  publishedAt: string;
  type: "blog" | "announcement";
}

export default function MembersDashboard() {
  const { t } = useMemberLang();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  const fetchViewCounts = useCallback(async (postIds: string[]) => {
    if (postIds.length === 0) return;
    try {
      const res = await fetch(`/api/members/posts/views?postIds=${postIds.join(",")}`);
      if (res.ok) {
        const data = await res.json();
        setViewCounts(data.viewCounts || {});
      }
    } catch { /* ignore */ }
  }, []);

  function trackView(postId: string) {
    fetch("/api/members/posts/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    }).catch(() => {});
    setViewCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  }

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch("/api/members/news");
        if (!res.ok) throw new Error("Failed to fetch news");
        const data = await res.json();

        const blogPosts: Post[] = (data.posts || [])
          .map((p: Record<string, string>) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt || "",
            authorName: p.authorName,
            category: p.category,
            publishedAt: p.publishedAt || p.createdAt,
            type: "blog" as const,
          }));

        const announcements: Post[] = (data.announcements || [])
          .map((a: Record<string, string>) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt || "",
            category: a.category,
            publishedAt: a.publishedAt || a.createdAt,
            type: "announcement" as const,
          }));

        const all = [...blogPosts, ...announcements].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        setPosts(all);
        fetchViewCounts(all.map((p) => p.id));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [fetchViewCounts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("home.title")}</h1>
        <p className="text-[#888] text-sm mt-1">{t("home.subtitle")}</p>
      </div>

      {posts.length === 0 && (
        <div className="text-center py-16 border border-[#1a1a1a] rounded-xl">
          <FileText className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-[#666] text-sm">{t("home.noPosts")}</p>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <a
            key={`${post.type}-${post.id}`}
            href={post.type === "blog" ? `/members/blog/${post.slug}` : `/announcements/${post.slug}`}
            onClick={() => trackView(post.id)}
            className="block border border-[#1a1a1a] rounded-xl p-5 hover:border-[#333] transition bg-[#0d0d0d] group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {post.type === "blog" ? (
                    <span className="text-[10px] uppercase tracking-wider font-medium text-blue-400/70 bg-blue-400/10 px-2 py-0.5 rounded">{t("home.blog")}</span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider font-medium text-amber-400/70 bg-amber-400/10 px-2 py-0.5 rounded">{t("home.announcement")}</span>
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-[#555]">{post.category}</span>
                </div>
                <h3 className="font-semibold text-[#e8e8e8] text-base leading-tight group-hover:text-white transition">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-[#888] text-sm mt-1.5 line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-[#555]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.publishedAt).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  {post.authorName && <span>· {post.authorName}</span>}
                  {(viewCounts[post.id] || 0) > 0 && (
                    <span className="flex items-center gap-1">
                      · <Eye className="h-3 w-3" /> {viewCounts[post.id]} {t("home.views")}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#333] group-hover:text-[#888] transition shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
