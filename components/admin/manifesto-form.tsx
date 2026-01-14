// file: components/admin/manifesto-form.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { toast } from "@/components/ui/use-toast";
import { createManifestoSectionSchema, type CreateManifestoSectionInput } from "@/lib/validations";
import { slugify, cn } from "@/lib/utils";
import type { ManifestoSection } from "@prisma/client";

// Type-safe status values
const STATUS_VALUES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type Status = (typeof STATUS_VALUES)[number];
const isStatus = (v: unknown): v is Status =>
  typeof v === "string" && (STATUS_VALUES as readonly string[]).includes(v);

interface ManifestoFormProps {
  section?: ManifestoSection;
  parentOptions?: { id: string; title: string }[];
}

export function ManifestoForm({ section, parentOptions = [] }: ManifestoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateManifestoSectionInput>({
    resolver: zodResolver(createManifestoSectionSchema),
    defaultValues: section
      ? {
          title: section.title,
          slug: section.slug,
          content: section.content,
          order: section.order,
          parentId: section.parentId,
          status: isStatus(section.status) ? section.status : "DRAFT",
        }
      : {
          title: "",
          slug: "",
          content: "",
          order: 0,
          parentId: null,
          status: "DRAFT",
        },
  });

  const content = watch("content");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);
    if (!section) {
      setValue("slug", slugify(newTitle));
    }
  };

  const onSubmit = async (data: CreateManifestoSectionInput) => {
    setIsSubmitting(true);
    try {
      const url = section ? `/api/admin/manifesto/${section.id}` : "/api/admin/manifesto";
      const method = section ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save");
      }

      toast({
        title: section ? "Updated" : "Created",
        description: `"${data.title}" has been ${section ? "updated" : "created"}.`,
      });

      router.push("/admin/manifesto");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save section",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Section Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title")} onChange={handleTitleChange} className={cn(errors.title && "border-destructive")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" {...register("slug")} className={cn(errors.slug && "border-destructive")} />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input id="order" type="number" {...register("order", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Parent Section</Label>
                  <Select defaultValue={section?.parentId || "none"} onValueChange={(v) => setValue("parentId", v === "none" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {parentOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Content</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="write">
                <TabsList className="mb-4">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4" />Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write">
                  <Textarea id="content" rows={20} {...register("content")} className={cn("font-mono text-sm", errors.content && "border-destructive")} />
                  {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
                </TabsContent>
                <TabsContent value="preview">
                  <div className="min-h-[400px] border rounded-lg p-4">
                    {content ? <MarkdownRenderer content={content} /> : <p className="text-muted-foreground">Nothing to preview...</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publish</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  defaultValue={isStatus(section?.status) ? section.status : "DRAFT"}
                  onValueChange={(value) => {
                    if (isStatus(value)) setValue("status", value);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4 flex flex-col gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />{section ? "Update" : "Create"}</>}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
