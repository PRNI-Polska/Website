import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  createMemberSession,
  memberSessionCookieOptions,
} from "@/lib/member-auth";
import { recordSecurityEvent } from "@/lib/security-monitor";

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_IP = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const ipAttempts = new Map<
  string,
  { count: number; windowStart: number }
>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipAttempts.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    ipAttempts.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS_PER_IP) {
    return false;
  }

  record.count++;
  return true;
}

function resetIpRateLimit(ip: string): void {
  ipAttempts.delete(ip);
}

const GENERIC_ERROR = "Invalid credentials";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    if (!checkIpRateLimit(ip)) {
      recordSecurityEvent({
        type: "brute_force",
        ip,
        details: "Member login rate limit exceeded",
        severity: "high",
      });
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length > 254 ||
      password.length > 128
    ) {
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!member || !member.isActive) {
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    if (member.lockedUntil && member.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    const isValid = await compare(password, member.passwordHash);

    if (!isValid) {
      const newFailedCount = member.failedLogins + 1;
      const updateData: { failedLogins: number; lockedUntil?: Date } = {
        failedLogins: newFailedCount,
      };

      if (newFailedCount >= 5) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        recordSecurityEvent({
          type: "brute_force",
          ip,
          details: `Member account locked after ${newFailedCount} failed attempts`,
          severity: "high",
        });
      } else {
        recordSecurityEvent({
          type: "auth_failure",
          ip,
          details: `Member login failed (attempt ${newFailedCount})`,
          severity: "medium",
        });
      }

      await prisma.member.update({
        where: { id: member.id },
        data: updateData,
      });

      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    resetIpRateLimit(ip);

    await prisma.member.update({
      where: { id: member.id },
      data: {
        failedLogins: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    const token = await createMemberSession(member.id);
    const response = NextResponse.json({ success: true });
    response.cookies.set(memberSessionCookieOptions(token));
    return response;
  } catch {
    return NextResponse.json(
      { error: GENERIC_ERROR },
      { status: 401 }
    );
  }
}
