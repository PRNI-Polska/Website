// file: app/admin/(dashboard)/manifesto/page.tsx
import Link from "next/link";
import { Plus, Edit, MoreHorizontal, GripVertical } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatDate } from "@/lib/utils";
import type { ContentStatus } from "@/lib/types";

const statusColors: Record<ContentStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-success/20 text-success",
  ARCHIVED: "bg-destructive/20 text-destructive",
};

async function getManifestoSections() {
  return prisma.manifestoSection.findMany({
    orderBy: { order: "asc" },
  });
}

export default async function AdminManifestoPage() {
  const sections = await getManifestoSections();
  
  // Build tree structure
  const rootSections = sections.filter((s) => !s.parentId);
  const getChildren = (parentId: string) => sections.filter((s) => s.parentId === parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Manifesto</h1>
          <p className="text-muted-foreground">Manage manifesto sections and content</p>
        </div>
        <Button asChild>
          <Link href="/admin/manifesto/new">
            <Plus className="mr-2 h-4 w-4" />
            New Section
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manifesto Sections</CardTitle>
          <CardDescription>{sections.length} total sections</CardDescription>
        </CardHeader>
        <CardContent>
          {sections.length > 0 ? (
            <div className="space-y-2">
              {rootSections.map((section) => (
                <div key={section.id}>
                  <SectionRow section={section} />
                  {getChildren(section.id).map((child) => (
                    <SectionRow key={child.id} section={child} isChild />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No manifesto sections yet. Create your first one!
              </p>
              <Button asChild>
                <Link href="/admin/manifesto/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Section
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SectionRow({ 
  section, 
  isChild 
}: { 
  section: { id: string; title: string; slug: string; status: string; order: number; updatedAt: Date };
  isChild?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3 px-4 border rounded-lg ${isChild ? "ml-8 bg-muted/30" : ""}`}>
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        <div>
          <Link href={`/admin/manifesto/${section.id}`} className="font-medium hover:text-primary">
            {section.title}
          </Link>
          <p className="text-xs text-muted-foreground">/{section.slug}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-xs px-2 py-1 rounded ${statusColors[section.status as ContentStatus]}`}>
          {section.status.toLowerCase()}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDate(section.updatedAt)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/manifesto/${section.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DeleteButton id={section.id} title={section.title} endpoint="/api/admin/manifesto" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
