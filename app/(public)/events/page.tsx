// file: app/(public)/events/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { EventsClient } from "./events-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "View our upcoming events and join us in making a difference.",
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
          Events Calendar
        </h1>
        <p className="text-muted-foreground">
          Join us at our upcoming events and be part of the change.
        </p>
      </div>

      <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
        <EventsClient events={events} />
      </Suspense>
    </div>
  );
}
