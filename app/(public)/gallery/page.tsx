// file: app/(public)/gallery/page.tsx
import { prisma } from "@/lib/db";
import GalleryClient from "./gallery-client";

export const dynamic = "force-dynamic";

async function getGalleryItems() {
  return prisma.galleryImage.findMany({
    where: { isPublic: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      width: true,
      height: true,
      caption: true,
      captionEn: true,
      captionDe: true,
      location: true,
      eventDate: true,
    },
  });
}

export default async function GalleryPage() {
  const items = await getGalleryItems();
  const serialized = items.map((i) => ({
    ...i,
    eventDate: i.eventDate ? i.eventDate.toISOString() : null,
  }));
  return <GalleryClient items={serialized} />;
}
