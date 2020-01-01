// file: app/api/admin/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateEventSchema } from "@/lib/validations";

interface RouteParams {
  params: { id: string };
}

// GET - Get single event
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("GET event error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

// PATCH - Update event
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const body = await request.json();

    // Validate input
    const parsed = updateEventSchema.safeParse({ ...body, id: params.id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id, ...data } = parsed.data;

    // Check if event exists
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        startDateTime: data.startDateTime ? new Date(data.startDateTime) : undefined,
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : undefined,
        rsvpLink: data.rsvpLink || null,
        organizerContact: data.organizerContact || null,
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
        action: "UPDATE",
        entityType: "Event",
        entityId: event.id,
        userId: user.id,
        details: JSON.stringify({ title: event.title }),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("PATCH event error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();

    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id: params.id } });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Event",
        entityId: params.id,
        userId: user.id,
        details: JSON.stringify({ title: event.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
