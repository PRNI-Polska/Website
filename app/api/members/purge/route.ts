import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PURGE_SECRET = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET || "";
const RETENTION_DAYS = 30;

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth || auth !== `Bearer ${PURGE_SECRET}`) {
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
