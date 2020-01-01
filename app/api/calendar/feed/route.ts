// file: app/api/calendar/feed/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import ical from "ical-generator";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { startDateTime: "asc" },
    });

    const calendar = ical({
      name: "PRNI Political Party Events",
      description: "Calendar of events from PRNI Political Party",
      timezone: "UTC",
      prodId: { company: "PRNI", product: "Events Calendar" },
    });

    events.forEach((event) => {
      calendar.createEvent({
        start: event.startDateTime,
        end: event.endDateTime,
        summary: event.title,
        description: event.description,
        location: event.location,
        url: event.rsvpLink || undefined,
        organizer: event.organizerContact
          ? { name: "PRNI", email: event.organizerContact }
          : undefined,
      });
    });

    return new NextResponse(calendar.toString(), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="prni-events.ics"',
      },
    });
  } catch (error) {
    console.error("Calendar feed error:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar feed" },
      { status: 500 }
    );
  }
}
