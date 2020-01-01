"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const categories = [
  { value: "OPINION", label: "Opinion" },
  { value: "ANALYSIS", label: "Analysis" },
  { value: "COMMENTARY", label: "Commentary" },
  { value: "REPORT", label: "Report" },
];

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    authorName: "",
    authorRole: "",
    category: "OPINION",
    status: "DRAFT",
    featuredImage: "",
  });

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug === generateSlug(prev.title) || prev.slug === ""
        ? generateSlug(title)
        : prev.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }

      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">New Blog Post</h1>
          <p className="text-muted-foreground">Create a new blog post or opinion piece</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>Write your blog post content in Markdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Post title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="auto-generated-from-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    value={form.excerpt}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                    }
                    placeholder="Brief summary of the post"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content (Markdown) *</Label>
                  <Textarea
                    id="content"
                    value={form.content}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Write your post content in Markdown..."
                    rows={16}
                    className="font-mono text-sm"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="authorName">Author Name *</Label>
                  <Input
                    id="authorName"
                    value={form.authorName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        authorName: e.target.value,
                      }))
                    }
                    placeholder="Author name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authorRole">Author Role</Label>
                  <Input
                    id="authorRole"
                    value={form.authorRole}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        authorRole: e.target.value,
                      }))
                    }
                    placeholder="e.g. Political Analyst"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featuredImage">Featured Image URL</Label>
                  <Input
                    id="featuredImage"
                    value={form.featuredImage}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        featuredImage: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
