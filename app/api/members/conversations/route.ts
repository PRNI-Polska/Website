import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

export async function GET(request: NextRequest) {
  let member;
  try {
    member = await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [sentTo, receivedFrom] = await Promise.all([
      prisma.directMessage.findMany({
        where: { senderId: member.id },
        select: { receiverId: true },
        distinct: ["receiverId"],
      }),
      prisma.directMessage.findMany({
        where: { receiverId: member.id },
        select: { senderId: true },
        distinct: ["senderId"],
      }),
    ]);

    const partnerIds = [
      ...new Set([
        ...sentTo.map((m) => m.receiverId),
        ...receivedFrom.map((m) => m.senderId),
      ]),
    ];

    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const [lastMessage, unreadCount, partner] = await Promise.all([
          prisma.directMessage.findFirst({
            where: {
              OR: [
                { senderId: member.id, receiverId: partnerId },
                { senderId: partnerId, receiverId: member.id },
              ],
            },
            orderBy: { createdAt: "desc" },
            select: { content: true, createdAt: true, senderId: true },
          }),
          prisma.directMessage.count({
            where: {
              senderId: partnerId,
              receiverId: member.id,
              read: false,
            },
          }),
          prisma.member.findUnique({
            where: { id: partnerId },
            select: { id: true, displayName: true, role: true },
          }),
        ]);

        if (!partner) return null;

        return {
          member: partner,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                isOwn: lastMessage.senderId === member.id,
              }
            : null,
          unreadCount,
        };
      })
    );

    const filtered = conversations
      .filter(Boolean)
      .sort((a, b) => {
        if (!a!.lastMessage) return 1;
        if (!b!.lastMessage) return -1;
        return (
          new Date(b!.lastMessage.createdAt).getTime() -
          new Date(a!.lastMessage.createdAt).getTime()
        );
      });

    return NextResponse.json({ conversations: filtered });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
