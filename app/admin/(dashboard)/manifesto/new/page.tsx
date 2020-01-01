// file: app/admin/(dashboard)/manifesto/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ManifestoForm } from "@/components/admin/manifesto-form";

async function getParentOptions() {
  return prisma.manifestoSection.findMany({
    where: { parentId: null },
    select: { id: true, title: true },
    orderBy: { order: "asc" },
  });
}

export default async function NewManifestoPage() {
  const parentOptions = await getParentOptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/manifesto"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">New Manifesto Section</h1>
          <p className="text-muted-foreground">Create a new manifesto section</p>
        </div>
      </div>
      <ManifestoForm parentOptions={parentOptions} />
    </div>
  );
}
