import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  let member;
  try {
    member = await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { memberId } = await params;
    const before = request.nextUrl.searchParams.get("before");

    const whereClause: Record<string, unknown> = {
      OR: [
        { senderId: member.id, receiverId: memberId },
        { senderId: memberId, receiverId: member.id },
      ],
    };

    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.directMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        content: true,
        senderId: true,
        createdAt: true,
        read: true,
      },
    });

    await prisma.directMessage.updateMany({
      where: {
        senderId: memberId,
        receiverId: member.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({
      messages: messages.reverse(),
      memberId: member.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  let member;
  try {
    member = await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { memberId } = await params;
    const body = await request.json();
    const content = typeof body.content === "string"
      ? body.content.trim().slice(0, 2000)
      : "";

    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    if (memberId === member.id) {
      return NextResponse.json(
        { error: "Cannot send messages to yourself" },
        { status: 400 }
      );
    }

    const receiver = await prisma.member.findUnique({
      where: { id: memberId, isActive: true },
      select: { id: true },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    const message = await prisma.directMessage.create({
      data: {
        content,
        senderId: member.id,
        receiverId: memberId,
      },
      select: {
        id: true,
        content: true,
        senderId: true,
        receiverId: true,
        createdAt: true,
        read: true,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
