// file: app/(public)/events/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { EventsClient } from "./events-client";
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

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
          Kalendarz Wydarzeń
        </h1>
        <p className="text-muted-foreground">
          Dołącz do naszych wydarzeń i bądź częścią zmian.
        </p>
      </div>

      {events.length > 0 ? (
        <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
          <EventsClient events={events} />
        </Suspense>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground mb-2">
            Brak nadchodzących wydarzeń
          </p>
          <p className="text-muted-foreground">
            Sprawdź ponownie wkrótce!
          </p>
        </div>
      )}
    </div>
  );
}
