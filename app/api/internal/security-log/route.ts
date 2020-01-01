// file: app/api/internal/security-log/route.ts
// Internal API to persist security alerts to the database.
//
// SECURITY HARDENED:
//  - POST only (all other methods → 405)
//  - X-Internal-Secret required on ALL code paths
//  - Input lengths capped before DB write

import { NextRequest, NextResponse } from "next/server";
import { writeAlertToDB } from "@/lib/security-alerts-db";

// ============================================
// AUTH
// ============================================
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error(
      "[SECURITY-LOG] NEXTAUTH_SECRET is not set — refusing all requests",
    );
    return false;
  }

  const provided = request.headers.get("X-Internal-Secret");
  return !!provided && provided === secret;
}

// ============================================
// POST — persist an alert
// ============================================
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.type || !body.severity || !body.ipAddress || !body.details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Cap input lengths before writing to DB
    await writeAlertToDB({
      type: String(body.type).slice(0, 50),
      severity: String(body.severity).slice(0, 10),
      ipAddress: String(body.ipAddress).slice(0, 45),
      path: body.path ? String(body.path).slice(0, 500) : null,
      userAgent: body.userAgent ? String(body.userAgent).slice(0, 300) : null,
      details: String(body.details).slice(0, 1000),
      metadata: body.metadata ? String(body.metadata).slice(0, 2000) : null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SECURITY-LOG] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ============================================
// All other HTTP methods → 405
// ============================================
function methodNotAllowed() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST" },
  });
}

export async function GET() {
  return methodNotAllowed();
}
export async function PUT() {
  return methodNotAllowed();
}
export async function DELETE() {
  return methodNotAllowed();
}
export async function PATCH() {
  return methodNotAllowed();
}
