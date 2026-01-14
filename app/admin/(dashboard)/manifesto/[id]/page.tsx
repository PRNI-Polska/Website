// file: app/admin/(dashboard)/manifesto/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ManifestoForm } from "@/components/admin/manifesto-form";

interface PageProps {
  params: { id: string };
}

async function getSection(id: string) {
  return prisma.manifestoSection.findUnique({ where: { id } });
}

async function getParentOptions(excludeId: string) {
  return prisma.manifestoSection.findMany({
    where: { parentId: null, NOT: { id: excludeId } },
    select: { id: true, title: true },
    orderBy: { order: "asc" },
  });
}

export default async function EditManifestoPage({ params }: PageProps) {
  const [section, parentOptions] = await Promise.all([
    getSection(params.id),
    getParentOptions(params.id),
  ]);

  if (!section) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/manifesto"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">Edit Section</h1>
          <p className="text-muted-foreground">Update &quot;{section.title}&quot;</p>
        </div>
      </div>
      <ManifestoForm section={section} parentOptions={parentOptions} />
    </div>
  );
}
