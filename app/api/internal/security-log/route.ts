// file: app/api/internal/security-log/route.ts
// Receives rewritten requests from middleware and persists security alerts to DB.
// Alert data is passed as URL search params (survives rewrites reliably).

import { NextRequest, NextResponse } from "next/server";
import { writeAlertToDB } from "@/lib/security-alerts-db";

async function handleAlert(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const alertType = params.get("t");

  // Rewritten request from middleware (has alert params)
  if (alertType) {
    const alertData = {
      type: alertType,
      severity: params.get("s") || "medium",
      ipAddress: params.get("ip") || "unknown",
      path: params.get("p") || null,
      userAgent: params.get("ua") || null,
      details: params.get("d") || "Suspicious request blocked",
      metadata: params.get("pt") ? JSON.stringify({ patternType: params.get("pt") }) : null,
    };

    console.log(`[SECURITY-LOG] Writing alert: ${alertData.type} | IP: ${alertData.ipAddress} | ${alertData.details}`);

    try {
      await writeAlertToDB(alertData);
      console.log(`[SECURITY-LOG] Saved to database`);
    } catch (error) {
      console.error("[SECURITY-LOG] DB write failed:", error);
    }

    return new NextResponse(null, { status: 403 });
  }

  // Direct POST call from API routes (honeypot triggers etc.)
  if (request.method === "POST") {
    try {
      const secret = request.headers.get("X-Internal-Secret");
      const expectedSecret = process.env.NEXTAUTH_SECRET || "internal";

      if (secret !== expectedSecret) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const body = await request.json();

      if (!body.type || !body.severity || !body.ipAddress || !body.details) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }

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
      console.error("Security log POST error:", error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  }

  return new NextResponse(null, { status: 404 });
}

export async function GET(request: NextRequest) { return handleAlert(request); }
export async function POST(request: NextRequest) { return handleAlert(request); }
export async function PUT(request: NextRequest) { return handleAlert(request); }
export async function DELETE(request: NextRequest) { return handleAlert(request); }
export async function PATCH(request: NextRequest) { return handleAlert(request); }
