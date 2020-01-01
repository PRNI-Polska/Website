// file: app/api/gallery/[id]/image/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// One-year immutable cache. Image ids are cuids and never reused.
const CACHE_HEADER = "public, max-age=31536000, s-maxage=31536000, immutable";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const img = await prisma.galleryImage.findUnique({
      where: { id },
      select: { data: true, mimeType: true, isPublic: true },
    });
    if (!img || !img.isPublic) {
      return new NextResponse("Not found", { status: 404 });
    }

    const bytes = Uint8Array.from(img.data);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": img.mimeType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": CACHE_HEADER,
      },
    });
  } catch (error) {
    console.error("Gallery image serve error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
