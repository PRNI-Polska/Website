// file: app/(public)/events/events-client.tsx
"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  MapPin,
  Clock,
  ExternalLink,
  Download,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { cn, formatDateTime } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  location: string;
  rsvpLink: string | null;
  organizerContact: string | null;
  tags: string;
}

interface EventsClientProps {
  events: Event[];
}

export function EventsClient({ events }: EventsClientProps) {
  const searchParams = useSearchParams();
  const selectedEventId = searchParams.get("id");
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(
    events.find((e) => e.id === selectedEventId) || null
  );
  const [dialogOpen, setDialogOpen] = useState(!!selectedEventId);

  // Get days for calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const dateKey = format(new Date(event.startDateTime), "yyyy-MM-dd");
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });
    return map;
  }, [events]);

  // Get upcoming events for list view
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.startDateTime) >= now)
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }, [events]);

  // Get past events for list view
  const pastEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.startDateTime) < now)
      .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
  }, [events]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const generateICalLink = (event: Event) => {
    const start = format(new Date(event.startDateTime), "yyyyMMdd'T'HHmmss");
    const end = format(new Date(event.endDateTime), "yyyyMMdd'T'HHmmss");
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `LOCATION:${event.location}`,
      `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");
    
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
  };

  return (
    <>
      <Tabs defaultValue="calendar" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>

          <a
            href="/api/calendar/feed"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            <Download className="inline h-4 w-4 mr-1" />
            Subscribe to Calendar
          </a>
        </div>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="bg-muted p-2 text-center text-sm font-medium"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const dayEvents = eventsByDate.get(dateKey) || [];
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-24 p-1 bg-background",
                        !isCurrentMonth && "bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "text-sm p-1 rounded-md",
                          isToday(day) && "bg-primary text-primary-foreground font-bold",
                          !isCurrentMonth && "text-muted-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1 mt-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <button
                            key={event.id}
                            onClick={() => handleEventClick(event)}
                            className="w-full text-left text-xs p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 truncate"
                          >
                            {event.title}
                          </button>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-8">
          {/* Upcoming Events */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No upcoming events scheduled.
                </CardContent>
              </Card>
            )}
          </section>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Past Events</h2>
              <div className="space-y-4 opacity-75">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event)}
                    isPast
                  />
                ))}
              </div>
            </section>
          )}
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedEvent && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatDateTime(selectedEvent.startDateTime)} -{" "}
                        {formatDateTime(selectedEvent.endDateTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>

                  {selectedEvent.tags && (
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.tags.split(",").map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <MarkdownRenderer content={selectedEvent.description} />
            </div>

            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
              {selectedEvent.rsvpLink && (
                <Button asChild>
                  <a
                    href={selectedEvent.rsvpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    RSVP
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button variant="outline" asChild>
                <a
                  href={generateICalLink(selectedEvent)}
                  download={`${selectedEvent.title.replace(/\s+/g, "-")}.ics`}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Add to Calendar
                </a>
              </Button>
              {selectedEvent.organizerContact && (
                <Button variant="outline" asChild>
                  <a href={`mailto:${selectedEvent.organizerContact}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Organizer
                  </a>
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function EventCard({
  event,
  onClick,
  isPast,
}: {
  event: Event;
  onClick: () => void;
  isPast?: boolean;
}) {
  return (
    <Card
      className={cn("cursor-pointer transition-all hover:border-primary hover-lift", isPast && "opacity-75")}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {format(new Date(event.startDateTime), "d")}
            </span>
            <span className="text-xs text-primary uppercase">
              {format(new Date(event.startDateTime), "MMM")}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(event.startDateTime), "h:mm a")} -{" "}
                {format(new Date(event.endDateTime), "h:mm a")}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            </div>
          </div>
          {event.tags && (
            <div className="flex flex-wrap gap-2">
              {event.tags.split(",").slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
