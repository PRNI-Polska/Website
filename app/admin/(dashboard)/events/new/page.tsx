// file: app/admin/(dashboard)/events/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/admin/event-form";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">New Event</h1>
          <p className="text-muted-foreground">
            Create a new calendar event
          </p>
        </div>
      </div>

      <EventForm />
    </div>
  );
}
