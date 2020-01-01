// file: components/admin/event-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { createEventSchema, type CreateEventInput } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { Event } from "@prisma/client";

// Type-safe status values
const STATUS_VALUES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type Status = (typeof STATUS_VALUES)[number];
const isStatus = (v: unknown): v is Status =>
  typeof v === "string" && (STATUS_VALUES as readonly string[]).includes(v);

const statuses = [
  { value: "DRAFT" as const, label: "Draft" },
  { value: "PUBLISHED" as const, label: "Published" },
  { value: "ARCHIVED" as const, label: "Archived" },
];

interface EventFormProps {
  event?: Event;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateTimeLocal = (date: Date) => {
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          startDateTime: formatDateTimeLocal(event.startDateTime),
          endDateTime: formatDateTimeLocal(event.endDateTime),
          location: event.location,
          rsvpLink: event.rsvpLink || "",
          organizerContact: event.organizerContact || "",
          tags: event.tags,
          status: isStatus(event.status) ? event.status : "DRAFT",
        }
      : {
          title: "",
          description: "",
          startDateTime: "",
          endDateTime: "",
          location: "",
          rsvpLink: "",
          organizerContact: "",
          tags: "",
          status: "DRAFT",
        },
  });

  const description = watch("description");

  const onSubmit = async (data: CreateEventInput) => {
    setIsSubmitting(true);

    try {
      const url = event
        ? `/api/admin/events/${event.id}`
        : "/api/admin/events";
      const method = event ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startDateTime: new Date(data.startDateTime).toISOString(),
          endDateTime: new Date(data.endDateTime).toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save");
      }

      toast({
        title: event ? "Updated" : "Created",
        description: `"${data.title}" has been ${event ? "updated" : "created"}.`,
      });

      router.push("/admin/events");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save event",
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
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  className={cn(errors.title && "border-destructive")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDateTime">Start Date & Time *</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
                    {...register("startDateTime")}
                    className={cn(errors.startDateTime && "border-destructive")}
                  />
                  {errors.startDateTime && (
                    <p className="text-sm text-destructive">{errors.startDateTime.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDateTime">End Date & Time *</Label>
                  <Input
                    id="endDateTime"
                    type="datetime-local"
                    {...register("endDateTime")}
                    className={cn(errors.endDateTime && "border-destructive")}
                  />
                  {errors.endDateTime && (
                    <p className="text-sm text-destructive">{errors.endDateTime.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Community Center, 123 Main St"
                  {...register("location")}
                  className={cn(errors.location && "border-destructive")}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="rally, community, policy (comma-separated)"
                  {...register("tags")}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of tags
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Description Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
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
                      id="description"
                      rows={12}
                      placeholder="Event description in Markdown..."
                      {...register("description")}
                      className={cn(
                        "font-mono text-sm",
                        errors.description && "border-destructive"
                      )}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="min-h-[200px] border rounded-lg p-4 bg-background">
                    {description ? (
                      <MarkdownRenderer content={description} />
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
                  defaultValue={isStatus(event?.status) ? event.status : "DRAFT"}
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
                      {event ? "Update" : "Create"}
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

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rsvpLink">RSVP Link</Label>
                <Input
                  id="rsvpLink"
                  type="url"
                  placeholder="https://..."
                  {...register("rsvpLink")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizerContact">Organizer Contact</Label>
                <Input
                  id="organizerContact"
                  type="email"
                  placeholder="organizer@example.com"
                  {...register("organizerContact")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
