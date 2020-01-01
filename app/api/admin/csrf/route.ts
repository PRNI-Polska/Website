import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { generateCsrfToken, csrfCookieOptions } from "@/lib/csrf";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = generateCsrfToken();
  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(csrfCookieOptions(token));
  return response;
}
