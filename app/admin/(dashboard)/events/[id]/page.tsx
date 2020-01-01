// file: app/admin/(dashboard)/events/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/admin/event-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getEvent(id: string) {
  return prisma.event.findUnique({
    where: { id },
  });
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">Edit Event</h1>
          <p className="text-muted-foreground">
            Update &quot;{event.title}&quot;
          </p>
        </div>
      </div>

      <EventForm event={event} />
    </div>
  );
}
