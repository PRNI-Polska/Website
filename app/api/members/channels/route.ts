import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

export async function GET(request: NextRequest) {
  try {
    await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const channels = await prisma.memberChannel.findMany({
      orderBy: { name: "asc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { displayName: true },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    const result = channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      description: ch.description,
      isDefault: ch.isDefault,
      messageCount: ch._count.messages,
      lastMessage: ch.messages[0]
        ? {
            content: ch.messages[0].content,
            senderName: ch.messages[0].sender.displayName,
            createdAt: ch.messages[0].createdAt,
          }
        : null,
    }));

    return NextResponse.json({ channels: result });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}
