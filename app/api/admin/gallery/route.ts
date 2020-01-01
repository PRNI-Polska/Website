// file: app/api/admin/gallery/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { validateCsrf, csrfErrorResponse } from "@/lib/csrf";
import { z } from "zod";

// Max upload after client-side compression. 4MB is plenty for compressed JPEGs.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// Data URL like "data:image/jpeg;base64,/9j/..."
const DATA_URL_RE = /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i;

const createSchema = z.object({
  dataUrl: z
    .string()
    .min(50, "Missing image data")
    .max(6 * 1024 * 1024, "Image is too large") // ~6MB base64 = ~4.5MB binary
    .refine((s) => DATA_URL_RE.test(s), "Must be a data URL for jpeg/png/webp"),
  caption: z.string().max(500).default(""),
  captionEn: z.string().max(500).optional().nullable(),
  captionDe: z.string().max(500).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  eventDate: z.string().optional().nullable(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.galleryImage.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        mimeType: true,
        width: true,
        height: true,
        sizeBytes: true,
        caption: true,
        captionEn: true,
        captionDe: true,
        location: true,
        eventDate: true,
        order: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!validateCsrf(request)) return csrfErrorResponse();

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { dataUrl, caption, captionEn, captionDe, location, eventDate, width, height, isPublic } = parsed.data;

    const match = DATA_URL_RE.exec(dataUrl);
    if (!match) {
      return NextResponse.json({ error: "Invalid data URL" }, { status: 400 });
    }
    const mimeType = match[1].toLowerCase().replace("image/jpg", "image/jpeg");
    if (!ALLOWED_MIME.has(mimeType)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    }

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty image" }, { status: 400 });
    }
    if (buffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `Image too large after decoding (${buffer.length} bytes; limit ${MAX_IMAGE_BYTES}).` },
        { status: 413 }
      );
    }

    // Compute next order as max+1 so uploads land at the end by default
    const last = await prisma.galleryImage.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (last?.order ?? 0) + 10;

    const created = await prisma.galleryImage.create({
      data: {
        data: buffer,
        mimeType,
        width: width ?? null,
        height: height ?? null,
        sizeBytes: buffer.length,
        caption: caption?.trim() ?? "",
        captionEn: captionEn?.trim() || null,
        captionDe: captionDe?.trim() || null,
        location: location?.trim() || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        order: nextOrder,
        isPublic: isPublic ?? true,
      },
      select: { id: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "GalleryImage",
        entityId: created.id,
        userId: user.id,
        details: JSON.stringify({ caption: caption?.slice(0, 100), size: buffer.length }),
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Gallery upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
