// file: lib/audit-log.ts
// Security audit logging system - persists to database in all environments

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

// Flush buffer to database
async function flushBuffer() {
  if (logBuffer.length === 0) return;

  const entries = [...logBuffer];
  logBuffer.length = 0;

  // Always log to console for real-time visibility
  for (const entry of entries) {
    const severity = entry.severity || "low";
    const icon = {
      low: "[AUDIT]",
      medium: "[AUDIT-WARN]",
      high: "[AUDIT-ALERT]",
      critical: "[AUDIT-CRITICAL]",
    }[severity];

    console.log(
      `${icon} ${new Date().toISOString()} | ${entry.action} | ${entry.resource}${entry.resourceId ? `:${entry.resourceId}` : ""} | IP: ${entry.ipAddress} | User: ${entry.userEmail || "anonymous"}`
    );
    
    if (entry.details && (severity === "high" || severity === "critical")) {
      console.log(`   Details:`, entry.details);
    }
  }

  // Persist to database (all environments)
  try {
    // We need a userId for the AuditLog model, so we group entries:
    // - Those with a userId can be written to the AuditLog table
    // - Those without (e.g., failed logins for non-existent users) are logged to console only
    const dbEntries = entries.filter((e) => e.userId);
    
    if (dbEntries.length > 0) {
      await prisma.auditLog.createMany({
        data: dbEntries.map((e) => ({
          action: e.action,
          entityType: e.resource,
          entityId: e.resourceId || "system",
          userId: e.userId!,
          details: JSON.stringify({
            severity: e.severity || "low",
            ipAddress: e.ipAddress,
            userAgent: e.userAgent,
            userEmail: e.userEmail,
            ...(e.details || {}),
            timestamp: new Date().toISOString(),
          }),
        })),
      });
    }
  } catch (error) {
    // Don't lose entries if DB write fails - log them to console as fallback
    console.error("Failed to persist audit logs to database:", error);
    for (const entry of entries) {
      console.log(`[AUDIT-FALLBACK] ${JSON.stringify(entry)}`);
    }
  }
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
