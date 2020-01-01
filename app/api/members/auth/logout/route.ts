import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest, clearMemberSessionCookie } from "@/lib/member-auth";

export async function POST(request: NextRequest) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(clearMemberSessionCookie());
  return response;
}
