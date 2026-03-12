import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

export async function POST(request: NextRequest) {
  let member;
  try { member = await requireMember(request); }
  catch (e) { if (e instanceof Response) return e; return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  try {
    const body = await request.json();
    const sub = body.subscription;

    if (
      !sub ||
      typeof sub !== "object" ||
      typeof sub.endpoint !== "string" ||
      !sub.endpoint.startsWith("https://") ||
      !sub.keys ||
      typeof sub.keys.p256dh !== "string" ||
      typeof sub.keys.auth !== "string"
    ) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const subscription = JSON.stringify({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });

    await prisma.member.update({
      where: { id: member.id },
      data: { pushSubscription: subscription },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  let member;
  try { member = await requireMember(request); }
  catch (e) { if (e instanceof Response) return e; return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  try {
    await prisma.member.update({
      where: { id: member.id },
      data: { pushSubscription: null },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
