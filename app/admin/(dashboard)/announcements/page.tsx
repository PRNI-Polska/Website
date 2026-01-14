// file: app/admin/(dashboard)/announcements/page.tsx
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/admin/delete-button";
import type { AnnouncementCategory, ContentStatus } from "@/lib/types";

const categoryLabels: Record<AnnouncementCategory, string> = {
  NEWS: "News",
  PRESS_RELEASE: "Press Release",
  POLICY: "Policy",
  CAMPAIGN: "Campaign",
  COMMUNITY: "Community",
  OTHER: "Other",
};

const statusColors: Record<ContentStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-success/20 text-success",
  ARCHIVED: "bg-destructive/20 text-destructive",
};

async function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
}

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Manage news and announcements
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/announcements/new">
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>
            {announcements.length} total announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {announcements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Author</th>
                    <th className="text-left py-3 px-4 font-medium">Updated</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((announcement) => (
                    <tr key={announcement.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/announcements/${announcement.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {announcement.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {categoryLabels[announcement.category]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            statusColors[announcement.status]
                          }`}
                        >
                          {announcement.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {announcement.author?.name || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {formatDate(announcement.updatedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/announcements/${announcement.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {announcement.status === "PUBLISHED" && (
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/announcements/${announcement.slug}`}
                                  target="_blank"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Live
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DeleteButton
                              id={announcement.id}
                              title={announcement.title}
                              endpoint="/api/admin/announcements"
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No announcements yet. Create your first one!
              </p>
              <Button asChild>
                <Link href="/admin/announcements/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Announcement
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
