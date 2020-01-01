// file: app/admin/(dashboard)/team/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamForm } from "@/components/admin/team-form";

export default function NewTeamMemberPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/team"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">Add Team Member</h1>
          <p className="text-muted-foreground">Add a new team or leadership member</p>
        </div>
      </div>
      <TeamForm />
    </div>
  );
}
