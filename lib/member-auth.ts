import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SECRET = () => {
  const secret = process.env.MEMBER_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("MEMBER_JWT_SECRET (or NEXTAUTH_SECRET) is not set");
  return new TextEncoder().encode(secret);
};

const COOKIE_NAME = "member-session";
const SESSION_DURATION = 2 * 60 * 60; // 2 hours in seconds
const REFRESH_THRESHOLD = 30 * 60; // Refresh when less than 30 min remaining

export async function createMemberSession(memberId: string): Promise<string> {
  return new SignJWT({ memberId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET());
}

export async function verifyMemberSession(
  token: string
): Promise<{ memberId: string; shouldRefresh: boolean } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET());
    if (typeof payload.memberId !== "string") return null;

    const exp = payload.exp ?? 0;
    const now = Math.floor(Date.now() / 1000);
    const shouldRefresh = (exp - now) < REFRESH_THRESHOLD;

    return { memberId: payload.memberId, shouldRefresh };
  } catch {
    return null;
  }
}

export async function getMemberFromRequest(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifyMemberSession(token);
  if (!session) return null;

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
  });

  if (!member || !member.isActive) return null;

  return { ...member, _shouldRefreshSession: session.shouldRefresh };
}

export async function requireMember(request: NextRequest) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return member;
}

export async function applySessionRefresh(
  member: { id: string; _shouldRefreshSession?: boolean },
  response: NextResponse
): Promise<NextResponse> {
  if (member._shouldRefreshSession) {
    const newToken = await createMemberSession(member.id);
    response.cookies.set(memberSessionCookieOptions(newToken));
  }
  return response;
}

export function memberSessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_DURATION,
  };
}

export function clearMemberSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0,
  };
}
