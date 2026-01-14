// file: app/admin/(dashboard)/page.tsx
import Link from "next/link";
import { FileText, Calendar, Book, Users, TrendingUp, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

async function getDashboardStats() {
  const [
    announcementCount,
    eventCount,
    manifestoCount,
    teamCount,
    recentAnnouncements,
    upcomingEvents,
  ] = await Promise.all([
    prisma.announcement.count(),
    prisma.event.count(),
    prisma.manifestoSection.count(),
    prisma.teamMember.count(),
    prisma.announcement.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.event.findMany({
      where: {
        startDateTime: { gte: new Date() },
      },
      orderBy: { startDateTime: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        startDateTime: true,
        status: true,
      },
    }),
  ]);

  return {
    stats: {
      announcements: announcementCount,
      events: eventCount,
      manifesto: manifestoCount,
      team: teamCount,
    },
    recentAnnouncements,
    upcomingEvents,
  };
}

export default async function AdminDashboardPage() {
  const { stats, recentAnnouncements, upcomingEvents } = await getDashboardStats();

  const statCards = [
    {
      title: "Announcements",
      value: stats.announcements,
      icon: FileText,
      href: "/admin/announcements",
      description: "Total news items",
    },
    {
      title: "Events",
      value: stats.events,
      icon: Calendar,
      href: "/admin/events",
      description: "Calendar events",
    },
    {
      title: "Manifesto Sections",
      value: stats.manifesto,
      icon: Book,
      href: "/admin/manifesto",
      description: "Policy sections",
    },
    {
      title: "Team Members",
      value: stats.team,
      icon: Users,
      href: "/admin/team",
      description: "Leadership & staff",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Manage your site content here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <Button variant="link" className="p-0 h-auto mt-2" asChild>
                <Link href={stat.href}>Manage →</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
            <CardDescription>
              Recently updated announcements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {recentAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/admin/announcements/${item.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDate(item.updatedAt)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        item.status === "PUBLISHED"
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.status.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No announcements yet.
              </p>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/announcements">View All</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Next events on the calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {event.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.startDateTime)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        event.status === "PUBLISHED"
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {event.status.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No upcoming events.
              </p>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/events">View All</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you can perform
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/admin/announcements/new">
              <FileText className="mr-2 h-4 w-4" />
              New Announcement
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/events/new">
              <Calendar className="mr-2 h-4 w-4" />
              New Event
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/manifesto">
              <Book className="mr-2 h-4 w-4" />
              Edit Manifesto
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/team/new">
              <Users className="mr-2 h-4 w-4" />
              Add Team Member
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
