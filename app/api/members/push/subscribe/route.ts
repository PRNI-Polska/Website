import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

export async function POST(request: NextRequest) {
  let member;
  try { member = await requireMember(request); }
  catch (e) { if (e instanceof Response) return e; return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  try {
    const body = await request.json();
    const subscription = JSON.stringify(body.subscription);

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
