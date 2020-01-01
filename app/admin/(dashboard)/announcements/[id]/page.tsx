// file: app/admin/(dashboard)/announcements/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { AnnouncementForm } from "@/components/admin/announcement-form";

interface PageProps {
  params: { id: string };
}

async function getAnnouncement(id: string) {
  return prisma.announcement.findUnique({
    where: { id },
  });
}

export default async function EditAnnouncementPage({ params }: PageProps) {
  const announcement = await getAnnouncement(params.id);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/announcements">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">Edit Announcement</h1>
          <p className="text-muted-foreground">
            Update &quot;{announcement.title}&quot;
          </p>
        </div>
      </div>

      <AnnouncementForm announcement={announcement} />
    </div>
  );
}
