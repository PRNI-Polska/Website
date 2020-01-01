import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest, applySessionRefresh } from "@/lib/member-auth";

export async function GET(request: NextRequest) {
  const member = await getMemberFromRequest(request);

  if (!member) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const response = NextResponse.json({
    authenticated: true,
    member: {
      id: member.id,
      displayName: member.displayName,
      email: member.email,
      role: member.role,
    },
  });

  return applySessionRefresh(member, response);
}
