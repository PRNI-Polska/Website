// file: app/api/gallery/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 60;

export async function GET() {
  try {
    const items = await prisma.galleryImage.findMany({
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
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Gallery list error:", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
