// file: app/admin/(dashboard)/team/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TeamForm } from "@/components/admin/team-form";

interface PageProps {
  params: { id: string };
}

async function getTeamMember(id: string) {
  return prisma.teamMember.findUnique({ where: { id } });
}

export default async function EditTeamMemberPage({ params }: PageProps) {
  const member = await getTeamMember(params.id);
  if (!member) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/team"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">Edit Member</h1>
          <p className="text-muted-foreground">Update {member.name}</p>
        </div>
      </div>
      <TeamForm member={member} />
    </div>
  );
}
