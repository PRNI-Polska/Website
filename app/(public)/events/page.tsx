// file: app/(public)/events/page.tsx
import { prisma } from "@/lib/db";
import { EventsPageWrapper } from "./events-page-wrapper";
import type { Metadata } from "next";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wydarzenia",
  description: "Dołącz do naszych wydarzeń i bądź częścią zmian.",
};

async function getEvents() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startDateTime: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      startDateTime: true,
      endDateTime: true,
      location: true,
      rsvpLink: true,
      organizerContact: true,
      tags: true,
    },
  });

  return events;
}

export default async function EventsPage() {
  const events = await getEvents();

  return <EventsPageWrapper events={events} />;
}
