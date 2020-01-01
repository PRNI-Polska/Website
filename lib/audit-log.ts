// file: lib/audit-log.ts
// Security audit logging system

import { prisma } from "./db";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "EXPORT"
  | "SETTINGS_CHANGE"
  | "PASSWORD_CHANGE"
  | "SUSPICIOUS_ACTIVITY";

export type AuditResource =
  | "auth"
  | "announcement"
  | "event"
  | "manifesto"
  | "team"
  | "settings"
  | "contact"
  | "system";

interface AuditLogEntry {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  severity?: "low" | "medium" | "high" | "critical";
}

// In-memory buffer for batch writing (reduces DB load)
const logBuffer: AuditLogEntry[] = [];
const BUFFER_FLUSH_INTERVAL = 5000; // 5 seconds
const BUFFER_MAX_SIZE = 50;

// Flush buffer to console/file (in production, send to database or logging service)
async function flushBuffer() {
  if (logBuffer.length === 0) return;

  const entries = [...logBuffer];
  logBuffer.length = 0;

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    for (const entry of entries) {
      const severity = entry.severity || "low";
      const icon = {
        low: "📝",
        medium: "⚠️",
        high: "🚨",
        critical: "🔴",
      }[severity];

      console.log(
        `${icon} [AUDIT] ${new Date().toISOString()} | ${entry.action} | ${entry.resource}${entry.resourceId ? `:${entry.resourceId}` : ""} | IP: ${entry.ipAddress} | User: ${entry.userEmail || "anonymous"}`
      );
      
      if (entry.details) {
        console.log(`   Details:`, entry.details);
      }
    }
  }

  // In production, you would send these to a database or logging service
  // Example: await prisma.auditLog.createMany({ data: entries.map(e => ({ ...e, timestamp: new Date() })) });
}

// Start periodic flushing
if (typeof setInterval !== "undefined") {
  setInterval(flushBuffer, BUFFER_FLUSH_INTERVAL);
}

/**
 * Log an audit event
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  // Add timestamp
  const fullEntry = {
    ...entry,
    timestamp: new Date(),
  };

  // Auto-assign severity based on action
  if (!fullEntry.severity) {
    fullEntry.severity = getDefaultSeverity(entry.action);
  }

  // Add to buffer
  logBuffer.push(fullEntry);

  // Flush immediately for high severity events
  if (fullEntry.severity === "high" || fullEntry.severity === "critical") {
    await flushBuffer();
  }

  // Flush if buffer is full
  if (logBuffer.length >= BUFFER_MAX_SIZE) {
    await flushBuffer();
  }
}

function getDefaultSeverity(action: AuditAction): "low" | "medium" | "high" | "critical" {
  switch (action) {
    case "LOGIN_FAILED":
      return "medium";
    case "SUSPICIOUS_ACTIVITY":
      return "critical";
    case "DELETE":
    case "PASSWORD_CHANGE":
    case "SETTINGS_CHANGE":
      return "high";
    case "CREATE":
    case "UPDATE":
      return "medium";
    default:
      return "low";
  }
}

/**
 * Track failed login attempts for alerting
 */
const failedLoginAttempts = new Map<string, { count: number; firstAttempt: Date }>();

export async function trackFailedLogin(ipAddress: string, email: string): Promise<void> {
  const key = `${ipAddress}:${email}`;
  const existing = failedLoginAttempts.get(key);
  const now = new Date();

  if (!existing || now.getTime() - existing.firstAttempt.getTime() > 60 * 60 * 1000) {
    // Reset after 1 hour
    failedLoginAttempts.set(key, { count: 1, firstAttempt: now });
  } else {
    existing.count++;

    // Alert on suspicious activity (5+ failed attempts in an hour)
    if (existing.count >= 5) {
      await auditLog({
        action: "SUSPICIOUS_ACTIVITY",
        resource: "auth",
        ipAddress,
        userEmail: email,
        severity: "critical",
        details: {
          reason: "Multiple failed login attempts",
          attemptCount: existing.count,
          timeWindow: "1 hour",
        },
      });
    }
  }

  await auditLog({
    action: "LOGIN_FAILED",
    resource: "auth",
    ipAddress,
    userEmail: email,
  });
}

/**
 * Clear failed login attempts after successful login
 */
export function clearFailedLogins(ipAddress: string, email: string): void {
  failedLoginAttempts.delete(`${ipAddress}:${email}`);
}

/**
 * Helper to extract IP and User-Agent from request
 */
export function getRequestInfo(request: Request): { ipAddress: string; userAgent: string } {
  const headers = request.headers;
  
  // Get IP address
  const forwarded = headers.get("x-forwarded-for");
  const realIP = headers.get("x-real-ip");
  const cfIP = headers.get("cf-connecting-ip");
  const ipAddress = cfIP || (forwarded ? forwarded.split(",")[0].trim() : realIP) || "unknown";
  
  // Get User-Agent
  const userAgent = headers.get("user-agent") || "unknown";
  
  return { ipAddress, userAgent };
}
