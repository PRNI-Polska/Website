// file: app/(public)/manifesto/page.tsx
import Link from "next/link";
import { Download, FileText, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "Read our full manifesto and learn about our vision for a better future.",
};

interface ManifestoSection {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  parentId: string | null;
  updatedAt: Date;
  children: ManifestoSection[];
}

async function getManifestoData() {
  const [sections, settings] = await Promise.all([
    prisma.manifestoSection.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
    }),
    prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: { manifestoPdfUrl: true },
    }),
  ]);

  // Build tree structure
  const sectionMap = new Map<string, ManifestoSection>();
  const rootSections: ManifestoSection[] = [];

  // First pass: create all sections with empty children
  sections.forEach((section) => {
    sectionMap.set(section.id, { ...section, children: [] });
  });

  // Second pass: build tree
  sections.forEach((section) => {
    const sectionWithChildren = sectionMap.get(section.id)!;
    if (section.parentId) {
      const parent = sectionMap.get(section.parentId);
      if (parent) {
        parent.children.push(sectionWithChildren);
      }
    } else {
      rootSections.push(sectionWithChildren);
    }
  });

  // Get last updated date
  const lastUpdated = sections.length > 0
    ? sections.reduce((latest, s) => 
        s.updatedAt > latest ? s.updatedAt : latest, 
        sections[0].updatedAt
      )
    : null;

  return {
    sections: rootSections,
    pdfUrl: settings?.manifestoPdfUrl,
    lastUpdated,
  };
}

function TableOfContents({ sections }: { sections: ManifestoSection[] }) {
  return (
    <nav aria-label="Table of contents" className="space-y-2">
      {sections.map((section, index) => (
        <div key={section.id}>
          <a
            href={`#${section.slug}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1"
          >
            <span className="font-mono text-xs">{index + 1}.</span>
            {section.title}
          </a>
          {section.children.length > 0 && (
            <div className="ml-4 border-l pl-4 space-y-1">
              {section.children.map((child, childIndex) => (
                <a
                  key={child.id}
                  href={`#${child.slug}`}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
                >
                  <span className="font-mono text-xs mr-2">
                    {index + 1}.{childIndex + 1}
                  </span>
                  {child.title}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

function ManifestoSectionContent({ 
  section, 
  level = 2 
}: { 
  section: ManifestoSection; 
  level?: number;
}) {
  const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
  
  return (
    <section id={section.slug} className="scroll-mt-header">
      <HeadingTag className={`font-heading font-semibold mb-4 ${
        level === 2 ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
      }`}>
        {section.title}
      </HeadingTag>
      <MarkdownRenderer content={section.content} />
      
      {section.children.length > 0 && (
        <div className="mt-8 space-y-8">
          {section.children.map((child) => (
            <ManifestoSectionContent 
              key={child.id} 
              section={child} 
              level={level + 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function ManifestoPage() {
  const { sections, pdfUrl, lastUpdated } = await getManifestoData();

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          Our Manifesto
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Our vision and commitment to building a better future for all citizens.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last updated: {formatDate(lastUpdated)}
            </div>
          )}
          {pdfUrl && (
            <Button variant="outline" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {sections.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar - Table of Contents */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Contents
                  </h2>
                  <TableOfContents sections={sections} />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <div className="space-y-12">
              {sections.map((section, index) => (
                <div key={section.id}>
                  {index > 0 && <Separator className="my-12" />}
                  <ManifestoSectionContent section={section} />
                </div>
              ))}
            </div>

            {/* Back to top */}
            <div className="mt-16 text-center">
              <Separator className="mb-8" />
              <Button variant="outline" asChild>
                <a href="#top">Back to Top</a>
              </Button>
            </div>
          </main>
        </div>
      ) : (
        <Card className="max-w-xl mx-auto">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Our manifesto is being prepared. Check back soon!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
