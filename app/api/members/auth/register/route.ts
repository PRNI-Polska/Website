import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

const BCRYPT_ROUNDS = 12;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteCode, email, password, displayName } = body;

    if (
      !inviteCode ||
      !email ||
      !password ||
      !displayName ||
      typeof inviteCode !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof displayName !== "string"
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedName = displayName.trim();
    const trimmedCode = inviteCode.trim().toUpperCase();

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: "Display name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const invite = await prisma.memberInvite.findUnique({
      where: { code: trimmedCode },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }

    if (invite.used) {
      return NextResponse.json(
        { error: "This invite code has already been used" },
        { status: 400 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invite code has expired" },
        { status: 400 }
      );
    }

    if (invite.email && invite.email.toLowerCase() !== trimmedEmail) {
      return NextResponse.json(
        { error: "This invite code is not valid for this email" },
        { status: 400 }
      );
    }

    const existingMember = await prisma.member.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, BCRYPT_ROUNDS);

    await prisma.$transaction([
      prisma.member.create({
        data: {
          email: trimmedEmail,
          passwordHash,
          displayName: trimmedName,
          inviteCode: trimmedCode,
          role: invite.role || "MEMBER",
        },
      }),
      prisma.memberInvite.update({
        where: { id: invite.id },
        data: {
          used: true,
          usedAt: new Date(),
          usedBy: trimmedEmail,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please login.",
    });
  } catch {
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
