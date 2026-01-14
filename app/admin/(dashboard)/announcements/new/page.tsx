// file: app/admin/(dashboard)/announcements/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnouncementForm } from "@/components/admin/announcement-form";

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/announcements">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">New Announcement</h1>
          <p className="text-muted-foreground">
            Create a new news item or announcement
          </p>
        </div>
      </div>

      <AnnouncementForm />
    </div>
  );
}
