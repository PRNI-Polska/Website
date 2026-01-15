// file: app/(public)/events/events-page-wrapper.tsx
"use client";

import { Suspense } from "react";
import { EventsClient } from "./events-client";
import { useI18n } from "@/lib/i18n";

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

interface EventsPageWrapperProps {
  events: Event[];
}

export function EventsPageWrapper({ events }: EventsPageWrapperProps) {
  const { t } = useI18n();

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
          {t("events.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("events.subtitle")}
        </p>
      </div>

      {events.length > 0 ? (
        <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
          <EventsClient events={events} />
        </Suspense>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground mb-2">
            {t("events.none")}
          </p>
          <p className="text-muted-foreground">
            {t("common.back")}
          </p>
        </div>
      )}
    </div>
  );
}
