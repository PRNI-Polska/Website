import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const type = request.nextUrl.searchParams.get("type") || "dms";
    const memberId = request.nextUrl.searchParams.get("member");
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = 50;
    const skip = (page - 1) * limit;

    if (type === "dms") {
      const where = memberId
        ? { OR: [{ senderId: memberId }, { receiverId: memberId }] }
        : {};

      const [messages, total] = await Promise.all([
        prisma.directMessage.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            sender: { select: { id: true, displayName: true, role: true } },
            receiver: { select: { id: true, displayName: true, role: true } },
          },
        }),
        prisma.directMessage.count({ where }),
      ]);

      return NextResponse.json({
        messages: messages.map((m) => ({ ...m, content: decrypt(m.content) })),
        total,
        pages: Math.ceil(total / limit),
      });
    }

    if (type === "channels") {
      const channelId = request.nextUrl.searchParams.get("channel");
      const where = channelId
        ? { channelId }
        : memberId
        ? { senderId: memberId }
        : {};

      const [messages, total] = await Promise.all([
        prisma.channelMessage.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            sender: { select: { id: true, displayName: true, role: true } },
            channel: { select: { id: true, name: true } },
          },
        }),
        prisma.channelMessage.count({ where }),
      ]);

      return NextResponse.json({
        messages: messages.map((m) => ({ ...m, content: decrypt(m.content) })),
        total,
        pages: Math.ceil(total / limit),
      });
    }

    if (type === "members") {
      const members = await prisma.member.findMany({
        select: { id: true, displayName: true, email: true, role: true, isActive: true, lastLoginAt: true },
        orderBy: { displayName: "asc" },
      });
      return NextResponse.json({ members });
    }

    if (type === "stats") {
      const [totalDMs, totalChannelMsgs, totalMembers, channels] = await Promise.all([
        prisma.directMessage.count(),
        prisma.channelMessage.count(),
        prisma.member.count({ where: { isActive: true } }),
        prisma.memberChannel.findMany({
          select: { id: true, name: true, _count: { select: { messages: true } } },
        }),
      ]);

      return NextResponse.json({
        stats: { totalDMs, totalChannelMsgs, totalMembers },
        channels: channels.map((c) => ({ id: c.id, name: c.name, messageCount: c._count.messages })),
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
