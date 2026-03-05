import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const SECRET = () => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
};

const COOKIE_NAME = "member-session";
const SESSION_DURATION = 2 * 60 * 60; // 2 hours in seconds

export async function createMemberSession(memberId: string): Promise<string> {
  return new SignJWT({ memberId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET());
}

export async function verifyMemberSession(
  token: string
): Promise<{ memberId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET());
    if (typeof payload.memberId !== "string") return null;
    return { memberId: payload.memberId };
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
  return member;
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
