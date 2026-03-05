import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";

export async function GET(request: NextRequest) {
  const member = await getMemberFromRequest(request);

  if (!member) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    member: {
      id: member.id,
      displayName: member.displayName,
      email: member.email,
      role: member.role,
    },
  });
}
