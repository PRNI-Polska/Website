// file: app/admin/(dashboard)/events/page.tsx
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
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
import { DeleteButton } from "@/components/admin/delete-button";
import type { ContentStatus } from "@prisma/client";

const statusColors: Record<ContentStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-success/20 text-success",
  ARCHIVED: "bg-destructive/20 text-destructive",
};

async function getEvents() {
  return prisma.event.findMany({
    orderBy: { startDateTime: "desc" },
    include: {
      createdBy: {
        select: { name: true },
      },
    },
  });
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Events</h1>
          <p className="text-muted-foreground">Manage calendar events</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>{events.length} total events</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {event.title}
                        </Link>
                        {event.tags && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.tags.split(",").slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <div>{format(new Date(event.startDateTime), "MMM d, yyyy")}</div>
                        <div className="text-xs">
                          {format(new Date(event.startDateTime), "h:mm a")} -{" "}
                          {format(new Date(event.endDateTime), "h:mm a")}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {event.location}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            statusColors[event.status]
                          }`}
                        >
                          {event.status.toLowerCase()}
                        </span>
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
                              <Link href={`/admin/events/${event.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {event.status === "PUBLISHED" && (
                              <DropdownMenuItem asChild>
                                <Link href="/events" target="_blank">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Calendar
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DeleteButton
                              id={event.id}
                              title={event.title}
                              endpoint="/api/admin/events"
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
                No events yet. Create your first one!
              </p>
              <Button asChild>
                <Link href="/admin/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
