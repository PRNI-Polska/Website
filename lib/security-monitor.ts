import { prisma } from "./db";

export type SecurityEventType =
  | "brute_force"
  | "ip_blocked"
  | "suspicious_request"
  | "rate_limit_exceeded"
  | "auth_failure"
  | "csrf_failure";

export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export interface SecurityEventInput {
  type: SecurityEventType;
  ip: string;
  details: string;
  severity: SecuritySeverity;
}

const recentEvents = new Map<string, { count: number; firstSeen: number }>();

const ALERT_THRESHOLDS: Record<string, { count: number; windowMs: number }> = {
  brute_force: { count: 10, windowMs: 15 * 60 * 1000 },
  rate_limit_exceeded: { count: 20, windowMs: 5 * 60 * 1000 },
  auth_failure: { count: 15, windowMs: 30 * 60 * 1000 },
  csrf_failure: { count: 5, windowMs: 10 * 60 * 1000 },
};

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of recentEvents.entries()) {
      if (now - value.firstSeen > 60 * 60 * 1000) {
        recentEvents.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export async function recordSecurityEvent(event: SecurityEventInput): Promise<void> {
  const eventKey = `${event.type}:${event.ip}`;
  const now = Date.now();
  const existing = recentEvents.get(eventKey);
  const threshold = ALERT_THRESHOLDS[event.type];

  if (!existing || (threshold && now - existing.firstSeen > threshold.windowMs)) {
    recentEvents.set(eventKey, { count: 1, firstSeen: now });
  } else {
    existing.count++;

    if (threshold && existing.count >= threshold.count) {
      await triggerAlert(event, existing.count);
      recentEvents.delete(eventKey);
    }
  }

  try {
    await prisma.securityEvent.create({
      data: {
        type: event.type,
        severity: event.severity,
        ip: event.ip,
        details: event.details,
      },
    });
  } catch {
    // Don't let DB failures break request flow
  }

  if (event.severity === "high" || event.severity === "critical") {
    console.warn(`[SECURITY:${event.severity.toUpperCase()}] ${event.type} — ${event.details}`);
  }
}

async function triggerAlert(event: SecurityEventInput, count: number): Promise<void> {
  console.error(
    `[SECURITY ALERT] ${event.type} threshold exceeded: ${count} events from ${event.ip}`
  );

  try {
    await prisma.securityEvent.create({
      data: {
        type: "suspicious_request",
        severity: "critical",
        ip: event.ip,
        details: `Alert triggered: ${event.type} threshold exceeded (${count} events). Original: ${event.details}`,
      },
    });
  } catch {
    // Best effort
  }

  try {
    if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "PRNI Security <noreply@prni.org.pl>",
        to: process.env.CONTACT_EMAIL,
        subject: `[SECURITY ALERT] ${event.type} — ${event.severity}`,
        text: [
          `Security Alert: ${event.type}`,
          `Severity: ${event.severity}`,
          `IP: ${event.ip}`,
          `Event count: ${count}`,
          `Details: ${event.details}`,
          `Timestamp: ${new Date().toISOString()}`,
        ].join("\n"),
      });
    }
  } catch {
    console.error("[SECURITY] Failed to send security alert email");
  }
}

const EMPTY_DASHBOARD = {
  stats: { events24h: 0, events7d: 0, unresolvedCount: 0, criticalCount: 0 },
  recentEvents: [] as Array<{ id: string; type: string; severity: string; ip: string; details: string; resolved: boolean; createdAt: Date }>,
  eventsByType: [] as Array<{ type: string; count: number }>,
  topIPs: [] as Array<{ ip: string; count: number }>,
};

export async function getSecurityDashboardData() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const [
      events24h,
      events7d,
      unresolvedCount,
      criticalCount,
      recentEvents,
      eventsByType,
      topIPs,
    ] = await Promise.all([
      prisma.securityEvent.count({ where: { createdAt: { gte: last24h } } }),
      prisma.securityEvent.count({ where: { createdAt: { gte: last7d } } }),
      prisma.securityEvent.count({ where: { resolved: false } }),
      prisma.securityEvent.count({
        where: { severity: "critical", resolved: false },
      }),
      prisma.securityEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          type: true,
          severity: true,
          ip: true,
          details: true,
          resolved: true,
          createdAt: true,
        },
      }),
      prisma.securityEvent.groupBy({
        by: ["type"],
        where: { createdAt: { gte: last7d } },
        _count: { type: true },
        orderBy: { _count: { type: "desc" } },
      }),
      prisma.securityEvent.groupBy({
        by: ["ip"],
        where: { createdAt: { gte: last24h } },
        _count: { ip: true },
        orderBy: { _count: { ip: "desc" } },
        take: 10,
      }),
    ]);

    return {
      stats: { events24h, events7d, unresolvedCount, criticalCount },
      recentEvents,
      eventsByType: eventsByType.map((e) => ({
        type: e.type,
        count: e._count.type,
      })),
      topIPs: topIPs.map((e) => ({
        ip: e.ip,
        count: e._count.ip,
      })),
    };
  } catch (error) {
    console.error("SecurityEvent table may not exist yet — run `prisma db push`:", error);
    return EMPTY_DASHBOARD;
  }
}

export async function resolveSecurityEvent(id: string): Promise<void> {
  try {
    await prisma.securityEvent.update({
      where: { id },
      data: { resolved: true },
    });
  } catch {
    console.error("Failed to resolve security event — table may not exist");
  }
}

export async function resolveAllSecurityEvents(): Promise<number> {
  try {
    const result = await prisma.securityEvent.updateMany({
      where: { resolved: false },
      data: { resolved: true },
    });
    return result.count;
  } catch {
    console.error("Failed to resolve security events — table may not exist");
    return 0;
  }
}
