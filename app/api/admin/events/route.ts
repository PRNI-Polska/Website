// file: app/api/admin/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createEventSchema } from "@/lib/validations";

// GET - List all events
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const events = await prisma.event.findMany({
      where: {
        ...(status && { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }),
      },
      orderBy: { startDateTime: "desc" },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();

    // Validate input
    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", ...(process.env.NODE_ENV !== "production" && { details: parsed.error.flatten() }) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Create event
    const event = await prisma.event.create({
      data: {
        ...data,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        rsvpLink: data.rsvpLink || null,
        organizerContact: data.organizerContact || null,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "Event",
        entityId: event.id,
        userId: user.id,
        details: JSON.stringify({ title: event.title }),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST event error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
