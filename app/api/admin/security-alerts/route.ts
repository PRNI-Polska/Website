// file: app/api/admin/security-alerts/route.ts
// Admin API for viewing and managing security alerts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getSecurityAlerts,
  getThreatSummary,
  resolveAlert,
  resolveAlertsByIP,
} from "@/lib/security-alerts-db";
import {
  getActiveThreats,
  type ThreatSeverity,
  type ThreatType,
} from "@/lib/security-alerts";

/**
 * GET /api/admin/security-alerts
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = request.nextUrl.searchParams;
    const action = params.get("action") || "list";

    if (action === "summary") {
      const summary = await getThreatSummary();
      return NextResponse.json(summary);
    }

    if (action === "active-threats") {
      const threats = getActiveThreats();
      const serialized = threats.map((t) => ({
        ip: t.ip,
        tracker: {
          ...t.tracker,
          emailsAttempted: Array.from(t.tracker.emailsAttempted),
        },
      }));
      return NextResponse.json({ threats: serialized });
    }

    const severity = params.get("severity") as ThreatSeverity | null;
    const type = params.get("type") as ThreatType | null;
    const resolvedParam = params.get("resolved");
    const sinceParam = params.get("since");
    const limit = parseInt(params.get("limit") || "50", 10);

    const alerts = await getSecurityAlerts({
      limit: Math.min(limit, 200),
      severity: severity || undefined,
      type: type || undefined,
      resolved: resolvedParam !== null ? resolvedParam === "true" : undefined,
      since: sinceParam ? new Date(sinceParam) : undefined,
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Security alerts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch security alerts" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/security-alerts
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, alertId, ipAddress } = body;

    if (action === "resolve" && alertId) {
      const success = await resolveAlert(alertId);
      return NextResponse.json({ success });
    }

    if (action === "resolve-ip" && ipAddress) {
      const count = await resolveAlertsByIP(ipAddress);
      return NextResponse.json({ success: true, resolvedCount: count });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Security alerts PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update security alert" },
      { status: 500 }
    );
  }
}
