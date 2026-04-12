// file: app/(public)/events/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { EventsClient } from "./events-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wydarzenia PRNI",
  description:
    "Wydarzenia PRNI (Polski Ruch Narodowo-Integralistyczny). Dołącz do naszych wydarzeń i bądź częścią zmian. PRNI events.",
  alternates: {
    canonical: "https://www.prni.org.pl/events",
  },
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
      <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
        <EventsClient events={events} />
      </Suspense>
    </div>
  );
}
