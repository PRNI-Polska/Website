// file: lib/security-alerts-db.ts
// Database operations for security alerts.
// This file uses Prisma and must ONLY be imported from API routes (Node.js runtime),
// NEVER from middleware (Edge runtime).

import { prisma } from "./db";
import type { ThreatType, ThreatSeverity, SecurityAlert } from "./security-alerts";

/**
 * Write a single alert to the database
 */
export async function writeAlertToDB(data: {
  type: string;
  severity: string;
  ipAddress: string;
  path?: string | null;
  userAgent?: string | null;
  details: string;
  metadata?: string | null;
}): Promise<void> {
  await prisma.securityAlert.create({
    data: {
      type: data.type,
      severity: data.severity,
      ipAddress: data.ipAddress,
      path: data.path || null,
      userAgent: data.userAgent || null,
      details: data.details,
      metadata: data.metadata || null,
      resolved: false,
    },
  });
}

/**
 * Get recent security alerts from the database
 */
export async function getSecurityAlerts(options: {
  limit?: number;
  severity?: ThreatSeverity;
  type?: ThreatType;
  resolved?: boolean;
  since?: Date;
} = {}): Promise<SecurityAlert[]> {
  const { limit = 50, severity, type, resolved, since } = options;

  try {
    const where: Record<string, unknown> = {};
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (resolved !== undefined) where.resolved = resolved;
    if (since) where.createdAt = { gte: since };

    const alerts = await prisma.securityAlert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return alerts.map((a: {
      id: string;
      type: string;
      severity: string;
      ipAddress: string;
      path: string | null;
      userAgent: string | null;
      details: string;
      metadata: string | null;
      resolved: boolean;
      createdAt: Date;
    }) => ({
      id: a.id,
      type: a.type as ThreatType,
      severity: a.severity as ThreatSeverity,
      ipAddress: a.ipAddress,
      path: a.path || undefined,
      userAgent: a.userAgent || undefined,
      details: a.details,
      metadata: a.metadata ? JSON.parse(a.metadata) : undefined,
      resolved: a.resolved,
      createdAt: a.createdAt,
    }));
  } catch (error) {
    console.error("Failed to fetch security alerts:", error);
    return [];
  }
}

/**
 * Get threat summary statistics
 */
export async function getThreatSummary() {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, critical, high, medium, low, unresolved] = await Promise.all([
      prisma.securityAlert.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.securityAlert.count({ where: { severity: "critical", createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.securityAlert.count({ where: { severity: "high", createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.securityAlert.count({ where: { severity: "medium", createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.securityAlert.count({ where: { severity: "low", createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.securityAlert.count({ where: { resolved: false } }),
    ]);

    const topIPsRaw = await prisma.securityAlert.groupBy({
      by: ["ipAddress"],
      _count: { id: true },
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const topIPs = topIPsRaw.map((row: { ipAddress: string; _count: { id: number } }) => ({
      ip: row.ipAddress,
      count: row._count.id,
    }));

    const topThreatsRaw = await prisma.securityAlert.groupBy({
      by: ["type"],
      _count: { id: true },
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const topThreats = topThreatsRaw.map((row: { type: string; _count: { id: number } }) => ({
      type: row.type,
      count: row._count.id,
    }));

    const alerts = await prisma.securityAlert.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyCounts = new Map<string, number>();
    for (const alert of alerts) {
      const day = alert.createdAt.toISOString().split("T")[0];
      dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
    }

    const recentActivity = Array.from(dailyCounts.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return { total, critical, high, medium, low, unresolved, topIPs, topThreats, recentActivity };
  } catch (error) {
    console.error("Failed to get threat summary:", error);
    return {
      total: 0, critical: 0, high: 0, medium: 0, low: 0, unresolved: 0,
      topIPs: [], topThreats: [], recentActivity: [],
    };
  }
}

/**
 * Resolve a security alert
 */
export async function resolveAlert(alertId: string): Promise<boolean> {
  try {
    await prisma.securityAlert.update({
      where: { id: alertId },
      data: { resolved: true, resolvedAt: new Date() },
    });
    return true;
  } catch (error) {
    console.error("Failed to resolve alert:", error);
    return false;
  }
}

/**
 * Resolve all alerts from a specific IP
 */
export async function resolveAlertsByIP(ipAddress: string): Promise<number> {
  try {
    const result = await prisma.securityAlert.updateMany({
      where: { ipAddress, resolved: false },
      data: { resolved: true, resolvedAt: new Date() },
    });
    return result.count;
  } catch (error) {
    console.error("Failed to resolve alerts by IP:", error);
    return 0;
  }
}
