import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { validateCsrf, csrfErrorResponse } from "@/lib/csrf";
import {
  getSecurityDashboardData,
  resolveSecurityEvent,
  resolveAllSecurityEvents,
} from "@/lib/security-monitor";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getSecurityDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Security dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch security data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!validateCsrf(request)) return csrfErrorResponse();

  try {
    const body = await request.json();
    const { action, eventId } = body;

    if (action === "resolve" && typeof eventId === "string") {
      await resolveSecurityEvent(eventId);
      return NextResponse.json({ success: true });
    }

    if (action === "resolve_all") {
      const count = await resolveAllSecurityEvents();
      return NextResponse.json({ success: true, resolved: count });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Security action error:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
