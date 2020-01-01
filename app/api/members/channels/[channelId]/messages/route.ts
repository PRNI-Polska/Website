import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { sendPushToMembers } from "@/lib/push";

const SECURITY_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Pragma": "no-cache",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  let member;
  try {
    member = await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { channelId } = await params;

    const channel = await prisma.memberChannel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    if (member.role !== "ADMIN" && channel.allowedRoles) {
      const roles = channel.allowedRoles.split(",").map((r) => r.trim());
      if (!roles.includes(member.role)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const before = request.nextUrl.searchParams.get("before");
    const whereClause: Record<string, unknown> = { channelId };
    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.channelMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        sender: {
          select: { id: true, displayName: true, role: true },
        },
      },
    });

    const decrypted = messages.reverse().map((m) => ({
      ...m,
      content: decrypt(m.content),
    }));

    const res = NextResponse.json({ messages: decrypted, memberId: member.id });
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
    return res;
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  let member;
  try {
    member = await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { channelId } = await params;

    const channel = await prisma.memberChannel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    if (member.role !== "ADMIN" && channel.allowedRoles) {
      const roles = channel.allowedRoles.split(",").map((r) => r.trim());
      if (!roles.includes(member.role)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

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

    const message = await prisma.channelMessage.create({
      data: {
        content: encrypt(content),
        channelId,
        senderId: member.id,
      },
      include: {
        sender: {
          select: { id: true, displayName: true, role: true },
        },
      },
    });

    // Push notification to all channel members except sender
    const allMembers = await prisma.member.findMany({
      where: { isActive: true, id: { not: member.id }, pushSubscription: { not: null } },
      select: { id: true, role: true },
    });
    const eligible = channel.allowedRoles
      ? allMembers.filter((m) => m.role === "ADMIN" || channel.allowedRoles!.split(",").map((r) => r.trim()).includes(m.role))
      : allMembers;
    sendPushToMembers(eligible.map((m) => m.id), {
      title: `#${channel.name}`,
      body: `${member.displayName}: ${content.length > 80 ? content.slice(0, 80) + "…" : content}`,
      url: "/members/channels",
      tag: `channel-${channelId}`,
    }).catch(() => {});

    const res = NextResponse.json({ message: { ...message, content } }, { status: 201 });
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
    return res;
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
