// file: app/api/internal/security-log/route.ts
// Handles two cases:
// 1. Rewritten requests from middleware (blocked attacks) - reads alert data from headers
// 2. Direct POST calls from API routes (honeypot triggers etc.)
// Both persist the alert to the database and return the appropriate error status.

import { NextRequest, NextResponse } from "next/server";
import { writeAlertToDB } from "@/lib/security-alerts-db";

// Handle rewritten requests from middleware (any method)
async function handleAlert(request: NextRequest) {
  const alertType = request.headers.get("X-Security-Alert-Type");

  // If this has alert headers, it's a rewritten request from middleware
  if (alertType) {
    const alertData = {
      type: alertType,
      severity: request.headers.get("X-Security-Alert-Severity") || "medium",
      ipAddress: request.headers.get("X-Security-Alert-IP") || "unknown",
      path: request.headers.get("X-Security-Alert-Path") || null,
      userAgent: request.headers.get("X-Security-Alert-UA") || null,
      details: request.headers.get("X-Security-Alert-Details") || "Suspicious request blocked",
      metadata: request.headers.get("X-Security-Alert-Metadata") || null,
    };

    console.log(`[SECURITY-LOG] Persisting alert: ${alertData.type} from ${alertData.ipAddress}`);

    try {
      await writeAlertToDB(alertData);
      console.log(`[SECURITY-LOG] Alert persisted successfully`);
    } catch (error) {
      console.error("[SECURITY-LOG] Failed to persist alert:", error);
    }

    // Return 403 to the attacker
    return new NextResponse(null, { status: 403 });
  }

  // Direct POST call (from API routes like honeypot trigger)
  if (request.method === "POST") {
    try {
      const secret = request.headers.get("X-Internal-Secret");
      const expectedSecret = process.env.NEXTAUTH_SECRET || "internal";

      if (secret !== expectedSecret) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const body = await request.json();

      if (!body.type || !body.severity || !body.ipAddress || !body.details) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
      console.error("Internal security log error:", error);
      return NextResponse.json({ error: "Failed to log alert" }, { status: 500 });
    }
  }

  return new NextResponse(null, { status: 404 });
}

// Support all HTTP methods (middleware can rewrite any request type)
export async function GET(request: NextRequest) { return handleAlert(request); }
export async function POST(request: NextRequest) { return handleAlert(request); }
export async function PUT(request: NextRequest) { return handleAlert(request); }
export async function DELETE(request: NextRequest) { return handleAlert(request); }
export async function PATCH(request: NextRequest) { return handleAlert(request); }
