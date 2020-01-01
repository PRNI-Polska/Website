// file: app/api/internal/security-log/route.ts
// Internal API endpoint called by the middleware (Edge Runtime) to persist
// security alerts to the database. Protected by a shared secret header.

import { NextRequest, NextResponse } from "next/server";
import { writeAlertToDB } from "@/lib/security-alerts-db";

export async function POST(request: NextRequest) {
  try {
    // Verify internal secret to prevent external abuse
    const secret = request.headers.get("X-Internal-Secret");
    const expectedSecret = process.env.NEXTAUTH_SECRET || "internal";

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.severity || !body.ipAddress || !body.details) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Write to database
    await writeAlertToDB({
      type: body.type,
      severity: body.severity,
      ipAddress: body.ipAddress,
      path: body.path || null,
      userAgent: body.userAgent || null,
      details: body.details,
      metadata: body.metadata || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Internal security log error:", error);
    return NextResponse.json({ error: "Failed to log alert" }, { status: 500 });
  }
}
