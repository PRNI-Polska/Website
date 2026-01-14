// file: components/admin/announcement-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { toast } from "@/components/ui/use-toast";
import { createAnnouncementSchema, type CreateAnnouncementInput } from "@/lib/validations";
import { slugify, cn } from "@/lib/utils";
import type { Announcement } from "@prisma/client";

// Type-safe category values
const CATEGORY_VALUES = ["NEWS", "PRESS_RELEASE", "POLICY", "CAMPAIGN", "COMMUNITY", "OTHER"] as const;
type Category = (typeof CATEGORY_VALUES)[number];
const isCategory = (v: unknown): v is Category =>
  typeof v === "string" && (CATEGORY_VALUES as readonly string[]).includes(v);

// Type-safe status values
const STATUS_VALUES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type Status = (typeof STATUS_VALUES)[number];
const isStatus = (v: unknown): v is Status =>
  typeof v === "string" && (STATUS_VALUES as readonly string[]).includes(v);

const categories = [
  { value: "NEWS" as const, label: "News" },
  { value: "PRESS_RELEASE" as const, label: "Press Release" },
  { value: "POLICY" as const, label: "Policy" },
  { value: "CAMPAIGN" as const, label: "Campaign" },
  { value: "COMMUNITY" as const, label: "Community" },
  { value: "OTHER" as const, label: "Other" },
];

const statuses = [
  { value: "DRAFT" as const, label: "Draft" },
  { value: "PUBLISHED" as const, label: "Published" },
  { value: "ARCHIVED" as const, label: "Archived" },
];

interface AnnouncementFormProps {
  announcement?: Announcement;
}

export function AnnouncementForm({ announcement }: AnnouncementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAnnouncementInput>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: announcement
      ? {
          title: announcement.title,
          slug: announcement.slug,
          excerpt: announcement.excerpt,
          content: announcement.content,
          category: isCategory(announcement.category) ? announcement.category : "NEWS",
          featuredImage: announcement.featuredImage || "",
          status: isStatus(announcement.status) ? announcement.status : "DRAFT",
        }
      : {
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          category: "NEWS",
          featuredImage: "",
          status: "DRAFT",
        },
  });

  const title = watch("title");
  const content = watch("content");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);
    // Auto-generate slug from title if slug is empty or matches old slug
    if (!announcement) {
      setValue("slug", slugify(newTitle));
    }
  };

  const onSubmit = async (data: CreateAnnouncementInput) => {
    setIsSubmitting(true);

    try {
      const url = announcement
        ? `/api/admin/announcements/${announcement.id}`
        : "/api/admin/announcements";
      const method = announcement ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save");
      }

      toast({
        title: announcement ? "Updated" : "Created",
        description: `"${data.title}" has been ${announcement ? "updated" : "created"}.`,
      });

      router.push("/admin/announcements");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save announcement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  onChange={handleTitleChange}
                  className={cn(errors.title && "border-destructive")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  className={cn(errors.slug && "border-destructive")}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier. Auto-generated from title.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  rows={3}
                  placeholder="Brief summary shown in listings..."
                  {...register("excerpt")}
                  className={cn(errors.excerpt && "border-destructive")}
                />
                {errors.excerpt && (
                  <p className="text-sm text-destructive">{errors.excerpt.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Editor with Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="write">
                <TabsList className="mb-4">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="write">
                  <div className="space-y-2">
                    <Textarea
                      id="content"
                      rows={20}
                      placeholder="Write your content in Markdown..."
                      {...register("content")}
                      className={cn(
                        "font-mono text-sm",
                        errors.content && "border-destructive"
                      )}
                    />
                    {errors.content && (
                      <p className="text-sm text-destructive">{errors.content.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Supports Markdown: **bold**, *italic*, # headings, - lists, [links](url)
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="min-h-[400px] border rounded-lg p-4 bg-background">
                    {content ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <p className="text-muted-foreground">
                        Nothing to preview yet...
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue={isStatus(announcement?.status) ? announcement.status : "DRAFT"}
                  onValueChange={(value) => {
                    if (isStatus(value)) setValue("status", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  defaultValue={isCategory(announcement?.category) ? announcement.category : "NEWS"}
                  onValueChange={(value) => {
                    if (isCategory(value)) setValue("category", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {announcement ? "Update" : "Create"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="featuredImage">Image URL</Label>
                <Input
                  id="featuredImage"
                  type="url"
                  placeholder="https://..."
                  {...register("featuredImage")}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL to an image (e.g., from Cloudinary, Unsplash)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
