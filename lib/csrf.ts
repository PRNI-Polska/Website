import { randomBytes, createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_SECRET = () => {
  const dedicated = process.env.CSRF_SECRET;
  if (dedicated) return dedicated;
  const fallback = process.env.NEXTAUTH_SECRET;
  if (fallback) return fallback;
  if (process.env.NODE_ENV === "production") {
    throw new Error("CSRF_SECRET (or NEXTAUTH_SECRET) must be set in production");
  }
  return "csrf-fallback-dev-only";
};

export function generateCsrfToken(): string {
  const token = randomBytes(32).toString("hex");
  const signature = createHmac("sha256", CSRF_SECRET()).update(token).digest("hex");
  return `${token}.${signature}`;
}

export function verifyCsrfToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [raw, sig] = parts;
  const expected = createHmac("sha256", CSRF_SECRET()).update(raw).digest("hex");
  return sig === expected;
}

export async function getCsrfTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
}

export function csrfCookieOptions(token: string) {
  return {
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60,
  };
}

export function validateCsrf(request: NextRequest): boolean {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken || !cookieToken) {
    logCsrfFailure(request, "Missing CSRF token");
    return false;
  }
  if (headerToken !== cookieToken) {
    logCsrfFailure(request, "CSRF token mismatch");
    return false;
  }
  if (!verifyCsrfToken(headerToken)) {
    logCsrfFailure(request, "CSRF token signature invalid");
    return false;
  }
  return true;
}

function logCsrfFailure(request: NextRequest, reason: string): void {
  import("./security-monitor").then(({ recordSecurityEvent }) => {
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    recordSecurityEvent({
      type: "csrf_failure",
      ip,
      details: `${reason} on ${request.nextUrl.pathname}`,
      severity: "high",
    });
  }).catch(() => {});
}

export function csrfErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: "Invalid or missing CSRF token" },
    { status: 403 }
  );
}
