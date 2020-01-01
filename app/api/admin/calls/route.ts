import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { validateCsrf, csrfErrorResponse } from "@/lib/csrf";

const CALLS_API_URL = process.env.CALLS_API_URL;
const CALLS_ADMIN_KEY = process.env.CALLS_ADMIN_KEY;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!validateCsrf(request)) return csrfErrorResponse();

  if (!CALLS_API_URL || !CALLS_ADMIN_KEY) {
    return NextResponse.json(
      { error: "Calls API not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { title, durationMinutes } = body;

    if (!title || typeof title !== "string" || !durationMinutes || typeof durationMinutes !== "number") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const res = await fetch(`${CALLS_API_URL}/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CALLS_ADMIN_KEY}`,
      },
      body: JSON.stringify({ title, durationMinutes }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || `Upstream error (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}
