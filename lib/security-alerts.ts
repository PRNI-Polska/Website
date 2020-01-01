// file: lib/security-alerts.ts
// ============================================
// SECURITY ALERT & MONITORING SYSTEM
// Detects attacks, tracks threat patterns, sends warnings
// ============================================

import { prisma } from "./db";

// ============================================
// TYPES
// ============================================
export type ThreatType =
  | "API_SPAM"              // Rapid API requests from single IP
  | "BRUTE_FORCE"           // Repeated login failures
  | "PATH_TRAVERSAL"        // Directory traversal attempts
  | "XSS_ATTEMPT"           // Cross-site scripting attempts
  | "SQL_INJECTION"         // SQL injection attempts
  | "SCANNER_DETECTED"      // Vulnerability scanner detected
  | "RATE_LIMIT_ABUSE"      // Repeatedly hitting rate limits
  | "SUSPICIOUS_UA"         // Suspicious user agent
  | "ADMIN_PROBE"           // Unauthorized admin access attempts
  | "ENV_FILE_ACCESS"       // Attempt to access .env / .git etc.
  | "BOT_FLOOD"             // Bot-like flood of requests
  | "CREDENTIAL_STUFFING"   // Multiple emails tried from same IP
  | "HONEYPOT_TRIGGERED"    // Honeypot field filled (bot detected)
  | "PAYLOAD_INJECTION";    // Malicious payload in request body

export type ThreatSeverity = "low" | "medium" | "high" | "critical";

export interface SecurityAlert {
  id?: string;
  type: ThreatType;
  severity: ThreatSeverity;
  ipAddress: string;
  path?: string;
  userAgent?: string;
  details: string;
  metadata?: Record<string, unknown>;
  resolved: boolean;
  createdAt: Date;
}

// ============================================
// IN-MEMORY THREAT TRACKING
// Tracks patterns across requests to detect attacks
// ============================================
interface ThreatTracker {
  requestCount: number;
  rateLimitHits: number;
  suspiciousHits: number;
  loginFailures: number;
  emailsAttempted: Set<string>;
  firstSeen: number;
  lastSeen: number;
  alertsSent: number;
  blocked: boolean;
  blockExpiry: number;
}

const threatTrackers = new Map<string, ThreatTracker>();
const TRACKER_WINDOW = 10 * 60 * 1000; // 10-minute tracking window
const TRACKER_CLEANUP_INTERVAL = 60 * 1000; // Clean every minute

// Alert buffer for batch database writes
const alertBuffer: SecurityAlert[] = [];
const ALERT_FLUSH_INTERVAL = 3000; // 3 seconds
const ALERT_BUFFER_MAX = 20;

// ============================================
// THRESHOLDS - Tune these for your site
// ============================================
const THRESHOLDS = {
  // API spam: X requests within the tracking window
  API_SPAM_REQUESTS: 150,
  // Rate limit abuse: hitting limits X times
  RATE_LIMIT_ABUSE_COUNT: 5,
  // Brute force: X login failures
  BRUTE_FORCE_FAILURES: 3,
  // Credential stuffing: X different emails from same IP
  CREDENTIAL_STUFFING_EMAILS: 3,
  // Bot flood: X requests per second average
  BOT_FLOOD_RPS: 10,
  // Suspicious activity: X suspicious pattern matches
  SUSPICIOUS_PATTERN_COUNT: 3,
  // Block duration after critical threat (ms)
  BLOCK_DURATION: 60 * 60 * 1000, // 1 hour
};

// ============================================
// TRACKER MANAGEMENT
// ============================================
function getOrCreateTracker(ip: string): ThreatTracker {
  const now = Date.now();
  let tracker = threatTrackers.get(ip);

  if (!tracker || now - tracker.firstSeen > TRACKER_WINDOW) {
    tracker = {
      requestCount: 0,
      rateLimitHits: 0,
      suspiciousHits: 0,
      loginFailures: 0,
      emailsAttempted: new Set(),
      firstSeen: now,
      lastSeen: now,
      alertsSent: 0,
      blocked: false,
      blockExpiry: 0,
    };
    threatTrackers.set(ip, tracker);
  }

  tracker.lastSeen = now;
  return tracker;
}

// Periodic cleanup
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, tracker] of threatTrackers.entries()) {
      // Remove trackers older than 2x the window (keep blocked ones until expiry)
      if (tracker.blocked && now < tracker.blockExpiry) continue;
      if (now - tracker.lastSeen > TRACKER_WINDOW * 2) {
        threatTrackers.delete(ip);
      }
    }
  }, TRACKER_CLEANUP_INTERVAL);

  // Periodic alert buffer flush
  setInterval(() => flushAlertBuffer(), ALERT_FLUSH_INTERVAL);
}

// ============================================
// CORE ALERT FUNCTIONS
// ============================================

/**
 * Record a request from an IP (call on every API request)
 * Returns whether the IP should be blocked
 */
export function trackRequest(ip: string, path: string): { blocked: boolean; reason?: string } {
  const tracker = getOrCreateTracker(ip);
  const now = Date.now();

  // Check if currently blocked
  if (tracker.blocked && now < tracker.blockExpiry) {
    return { blocked: true, reason: "IP temporarily blocked due to malicious activity" };
  }

  // Unblock if expiry passed
  if (tracker.blocked && now >= tracker.blockExpiry) {
    tracker.blocked = false;
  }

  tracker.requestCount++;

  // Check for API spam (high request volume)
  const elapsed = (now - tracker.firstSeen) / 1000; // seconds
  const rps = tracker.requestCount / Math.max(elapsed, 1);

  if (tracker.requestCount >= THRESHOLDS.API_SPAM_REQUESTS && tracker.alertsSent < 3) {
    createAlert({
      type: "API_SPAM",
      severity: "high",
      ipAddress: ip,
      path,
      details: `${tracker.requestCount} requests in ${Math.round(elapsed)}s (${rps.toFixed(1)} req/s)`,
      metadata: { requestCount: tracker.requestCount, rps: Math.round(rps * 10) / 10, elapsed: Math.round(elapsed) },
      resolved: false,
      createdAt: new Date(),
    });
    tracker.alertsSent++;
  }

  // Check for bot flood (very high RPS)
  if (rps >= THRESHOLDS.BOT_FLOOD_RPS && elapsed > 5 && tracker.alertsSent < 5) {
    createAlert({
      type: "BOT_FLOOD",
      severity: "critical",
      ipAddress: ip,
      path,
      details: `Bot-like flood detected: ${rps.toFixed(1)} requests/second over ${Math.round(elapsed)}s`,
      metadata: { rps: Math.round(rps * 10) / 10, totalRequests: tracker.requestCount },
      resolved: false,
      createdAt: new Date(),
    });
    tracker.alertsSent++;

    // Auto-block for bot floods
    tracker.blocked = true;
    tracker.blockExpiry = now + THRESHOLDS.BLOCK_DURATION;
    return { blocked: true, reason: "Blocked: Bot-like flood detected" };
  }

  return { blocked: false };
}

/**
 * Record a rate limit hit (call when rate limit is exceeded)
 */
export function trackRateLimitHit(ip: string, path: string, limitType: string): void {
  const tracker = getOrCreateTracker(ip);
  tracker.rateLimitHits++;

  if (tracker.rateLimitHits >= THRESHOLDS.RATE_LIMIT_ABUSE_COUNT && tracker.alertsSent < 3) {
    createAlert({
      type: "RATE_LIMIT_ABUSE",
      severity: "high",
      ipAddress: ip,
      path,
      details: `IP hit rate limits ${tracker.rateLimitHits} times (type: ${limitType})`,
      metadata: { hitCount: tracker.rateLimitHits, limitType },
      resolved: false,
      createdAt: new Date(),
    });
    tracker.alertsSent++;

    // Block after excessive rate limit abuse
    if (tracker.rateLimitHits >= THRESHOLDS.RATE_LIMIT_ABUSE_COUNT * 2) {
      tracker.blocked = true;
      tracker.blockExpiry = Date.now() + THRESHOLDS.BLOCK_DURATION;
    }
  }
}

/**
 * Record a suspicious request pattern match
 */
export function trackSuspiciousRequest(
  ip: string,
  path: string,
  userAgent: string,
  patternType: string
): void {
  const tracker = getOrCreateTracker(ip);
  tracker.suspiciousHits++;

  // Map pattern types to threat types
  const threatTypeMap: Record<string, ThreatType> = {
    "path_traversal": "PATH_TRAVERSAL",
    "xss": "XSS_ATTEMPT",
    "sql_injection": "SQL_INJECTION",
    "scanner": "SCANNER_DETECTED",
    "suspicious_ua": "SUSPICIOUS_UA",
    "env_access": "ENV_FILE_ACCESS",
    "php_access": "SCANNER_DETECTED",
    "admin_probe": "ADMIN_PROBE",
    "payload_injection": "PAYLOAD_INJECTION",
  };

  const threatType = threatTypeMap[patternType] || "SCANNER_DETECTED";

  createAlert({
    type: threatType,
    severity: tracker.suspiciousHits >= THRESHOLDS.SUSPICIOUS_PATTERN_COUNT ? "critical" : "medium",
    ipAddress: ip,
    path,
    userAgent,
    details: `Suspicious pattern detected: ${patternType} on ${path}`,
    metadata: { patternType, totalSuspiciousHits: tracker.suspiciousHits },
    resolved: false,
    createdAt: new Date(),
  });

  // Auto-block after multiple suspicious hits
  if (tracker.suspiciousHits >= THRESHOLDS.SUSPICIOUS_PATTERN_COUNT) {
    tracker.blocked = true;
    tracker.blockExpiry = Date.now() + THRESHOLDS.BLOCK_DURATION;
  }
}

/**
 * Record a failed login attempt
 */
export function trackLoginFailure(ip: string, email: string): void {
  const tracker = getOrCreateTracker(ip);
  tracker.loginFailures++;
  tracker.emailsAttempted.add(email.toLowerCase());

  // Check for brute force
  if (tracker.loginFailures >= THRESHOLDS.BRUTE_FORCE_FAILURES) {
    createAlert({
      type: "BRUTE_FORCE",
      severity: "critical",
      ipAddress: ip,
      path: "/api/auth",
      details: `${tracker.loginFailures} failed login attempts from this IP`,
      metadata: {
        failureCount: tracker.loginFailures,
        emailsAttempted: Array.from(tracker.emailsAttempted),
      },
      resolved: false,
      createdAt: new Date(),
    });
  }

  // Check for credential stuffing (multiple emails from same IP)
  if (tracker.emailsAttempted.size >= THRESHOLDS.CREDENTIAL_STUFFING_EMAILS) {
    createAlert({
      type: "CREDENTIAL_STUFFING",
      severity: "critical",
      ipAddress: ip,
      path: "/api/auth",
      details: `${tracker.emailsAttempted.size} different emails attempted from same IP`,
      metadata: {
        emailCount: tracker.emailsAttempted.size,
        emails: Array.from(tracker.emailsAttempted),
      },
      resolved: false,
      createdAt: new Date(),
    });

    // Auto-block for credential stuffing
    tracker.blocked = true;
    tracker.blockExpiry = Date.now() + THRESHOLDS.BLOCK_DURATION;
  }
}

/**
 * Record a honeypot trigger (bot detected)
 */
export function trackHoneypotTrigger(ip: string, path: string, email?: string): void {
  createAlert({
    type: "HONEYPOT_TRIGGERED",
    severity: "medium",
    ipAddress: ip,
    path,
    details: `Bot detected via honeypot field${email ? ` (email: ${email})` : ""}`,
    metadata: { email },
    resolved: false,
    createdAt: new Date(),
  });
}

/**
 * Check if an IP is currently blocked by the threat system
 */
export function isIPBlocked(ip: string): { blocked: boolean; reason?: string } {
  const tracker = threatTrackers.get(ip);
  if (!tracker) return { blocked: false };

  const now = Date.now();
  if (tracker.blocked && now < tracker.blockExpiry) {
    return { blocked: true, reason: "IP blocked due to detected malicious activity" };
  }

  return { blocked: false };
}

// ============================================
// ALERT PERSISTENCE
// ============================================
function createAlert(alert: SecurityAlert): void {
  // Always log to console immediately for real-time visibility
  const icon = {
    low: "[INFO]",
    medium: "[WARN]",
    high: "[ALERT]",
    critical: "[CRITICAL]",
  }[alert.severity];

  console.log(
    `${icon} SECURITY ALERT | ${alert.type} | IP: ${alert.ipAddress} | ${alert.details}`
  );

  // Add to buffer for database persistence
  alertBuffer.push(alert);

  // Flush immediately for critical alerts
  if (alert.severity === "critical" || alert.severity === "high") {
    flushAlertBuffer();
  }

  // Flush if buffer is full
  if (alertBuffer.length >= ALERT_BUFFER_MAX) {
    flushAlertBuffer();
  }

  // Send email notification for critical alerts
  if (alert.severity === "critical") {
    sendAlertEmail(alert).catch((err) =>
      console.error("Failed to send alert email:", err)
    );
  }
}

async function flushAlertBuffer(): Promise<void> {
  if (alertBuffer.length === 0) return;

  const alerts = [...alertBuffer];
  alertBuffer.length = 0;

  try {
    // Write to database
    await prisma.securityAlert.createMany({
      data: alerts.map((alert) => ({
        type: alert.type,
        severity: alert.severity,
        ipAddress: alert.ipAddress,
        path: alert.path || null,
        userAgent: alert.userAgent || null,
        details: alert.details,
        metadata: alert.metadata ? JSON.stringify(alert.metadata) : null,
        resolved: false,
      })),
    });
  } catch (error) {
    // If DB write fails, log to console as fallback
    console.error("Failed to persist security alerts to database:", error);
    for (const alert of alerts) {
      console.log(`[FALLBACK] Security Alert: ${JSON.stringify(alert)}`);
    }
  }
}

// ============================================
// EMAIL NOTIFICATIONS FOR CRITICAL ALERTS
// ============================================
async function sendAlertEmail(alert: SecurityAlert): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    // No email configured, console warning is enough
    console.log(`[EMAIL SKIPPED] Would have sent alert email for: ${alert.type} from ${alert.ipAddress}`);
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const recipientEmail = process.env.SECURITY_ALERT_EMAIL || process.env.CONTACT_EMAIL || "prni.official@gmail.com";

    await resend.emails.send({
      from: "PRNI Security <noreply@prni.org.pl>",
      to: recipientEmail,
      subject: `[SECURITY ALERT] ${alert.type} detected on your website`,
      text: `SECURITY ALERT - ${alert.severity.toUpperCase()}

Type: ${alert.type}
Severity: ${alert.severity.toUpperCase()}
IP Address: ${alert.ipAddress}
Path: ${alert.path || "N/A"}
Time: ${alert.createdAt.toISOString()}

Details:
${alert.details}

${alert.metadata ? `Additional Info:\n${JSON.stringify(alert.metadata, null, 2)}` : ""}

---
This is an automated security alert from your PRNI website.
Review the admin security dashboard for more details.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${alert.severity === "critical" ? "#dc2626" : "#f59e0b"}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Security Alert: ${escapeHtml(alert.type)}</h2>
            <p style="margin: 4px 0 0; opacity: 0.9;">${escapeHtml(alert.severity.toUpperCase())} severity</p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 120px;">IP Address:</td><td style="padding: 8px 0;"><code>${escapeHtml(alert.ipAddress)}</code></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Path:</td><td style="padding: 8px 0;">${escapeHtml(alert.path || "N/A")}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Time:</td><td style="padding: 8px 0;">${escapeHtml(alert.createdAt.toISOString())}</td></tr>
            </table>
            <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p><strong>Details:</strong></p>
            <p style="background: #f3f4f6; padding: 12px; border-radius: 6px;">${escapeHtml(alert.details)}</p>
            ${alert.metadata ? `<p><strong>Metadata:</strong></p><pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 13px;">${escapeHtml(JSON.stringify(alert.metadata, null, 2))}</pre>` : ""}
            <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 13px;">This is an automated security alert from your PRNI website. Check the admin security dashboard for full details.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send security alert email:", error);
  }
}

// ============================================
// QUERY FUNCTIONS (for admin dashboard)
// ============================================

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
export async function getThreatSummary(): Promise<{
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  unresolved: number;
  topIPs: { ip: string; count: number }[];
  topThreats: { type: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}> {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get counts by severity (last 24 hours)
    const [total, critical, high, medium, low, unresolved] = await Promise.all([
      prisma.securityAlert.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.securityAlert.count({ where: { severity: "critical", createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.securityAlert.count({ where: { severity: "high", createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.securityAlert.count({ where: { severity: "medium", createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.securityAlert.count({ where: { severity: "low", createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.securityAlert.count({ where: { resolved: false } }),
    ]);

    // Get top offending IPs (last 7 days)
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

    // Get top threat types (last 7 days)
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

    // Get daily counts for last 7 days
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

/**
 * Get the current in-memory threat status for an IP (for admin dashboard)
 */
export function getIPThreatStatus(ip: string): ThreatTracker | null {
  return threatTrackers.get(ip) || null;
}

/**
 * Get all currently tracked IPs and their threat status
 */
export function getActiveThreats(): { ip: string; tracker: ThreatTracker }[] {
  const threats: { ip: string; tracker: ThreatTracker }[] = [];
  for (const [ip, tracker] of threatTrackers.entries()) {
    if (tracker.requestCount > 10 || tracker.suspiciousHits > 0 || tracker.loginFailures > 0 || tracker.blocked) {
      threats.push({ ip, tracker: { ...tracker, emailsAttempted: new Set(tracker.emailsAttempted) } });
    }
  }
  return threats.sort((a, b) => {
    // Sort by: blocked first, then by suspicious activity, then by request count
    if (a.tracker.blocked !== b.tracker.blocked) return a.tracker.blocked ? -1 : 1;
    if (a.tracker.suspiciousHits !== b.tracker.suspiciousHits) return b.tracker.suspiciousHits - a.tracker.suspiciousHits;
    return b.tracker.requestCount - a.tracker.requestCount;
  });
}

// ============================================
// UTILITY
// ============================================
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Export for use in email templates
export { escapeHtml };
