import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const members = await prisma.member.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ members });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase() || null;
    const customCode = typeof body.code === "string" && body.code.trim() ? body.code.trim().toUpperCase().replace(/[^A-Z0-9\-]/g, "").slice(0, 20) : null;
    const expiryHours = typeof body.expiryHours === "number" && body.expiryHours >= 1 && body.expiryHours <= 8760 ? body.expiryHours : 168; // default 7 days

    const code = customCode || crypto.randomUUID().slice(0, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    const existing = await prisma.memberInvite.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    }

    const VALID_ROLES = ["ADMIN", "LEADERSHIP", "MAIN_WING", "INTERNATIONAL", "FEMALE_WING", "MEMBER"];
    const role = typeof body.role === "string" && VALID_ROLES.includes(body.role) ? body.role : "MEMBER";

    const invite = await prisma.memberInvite.create({
      data: {
        code,
        email,
        role,
        expiresAt,
      },
    });

    return NextResponse.json({
      invite: {
        id: invite.id,
        code: invite.code,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
