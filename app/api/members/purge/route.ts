import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PURGE_SECRET = process.env.CRON_SECRET;
if (!PURGE_SECRET && process.env.NODE_ENV === "production") {
  console.warn("[SECURITY] CRON_SECRET is not set. Purge endpoint will use NEXTAUTH_SECRET as fallback.");
}
const EFFECTIVE_SECRET = PURGE_SECRET || process.env.NEXTAUTH_SECRET;
const RETENTION_DAYS = 30;

export async function POST(request: NextRequest) {
  if (!EFFECTIVE_SECRET) {
    console.error("[SECURITY] Purge endpoint called but no CRON_SECRET or NEXTAUTH_SECRET is configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providedToken = auth.replace(/^Bearer\s+/i, "");
  const expectedToken = EFFECTIVE_SECRET;

  if (providedToken.length !== expectedToken.length) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { timingSafeEqual } = await import("crypto");
  const tokensMatch = timingSafeEqual(
    Buffer.from(providedToken),
    Buffer.from(expectedToken)
  );

  if (!tokensMatch) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const [dms, channelMsgs] = await Promise.all([
    prisma.directMessage.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.channelMessage.deleteMany({ where: { createdAt: { lt: cutoff } } }),
  ]);

  return NextResponse.json({
    purged: { directMessages: dms.count, channelMessages: channelMsgs.count },
    retentionDays: RETENTION_DAYS,
    cutoffDate: cutoff.toISOString(),
  });
}
