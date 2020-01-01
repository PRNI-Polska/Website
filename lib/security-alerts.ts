// file: lib/security-alerts.ts
// ============================================
// SECURITY ALERT & MONITORING SYSTEM
// Edge-compatible: NO Prisma imports here.
// Alerts are persisted via internal API call.
//
// SECURITY: Threat tracking is backed by Upstash Redis so that state is
// shared across ALL serverless function instances.  In-memory Maps are
// kept only as a fallback for local development.
// ============================================

import { getRedis } from "./redis";

// ============================================
// TYPES
// ============================================
export type ThreatType =
  | "API_SPAM"
  | "BRUTE_FORCE"
  | "PATH_TRAVERSAL"
  | "XSS_ATTEMPT"
  | "SQL_INJECTION"
  | "SCANNER_DETECTED"
  | "RATE_LIMIT_ABUSE"
  | "SUSPICIOUS_UA"
  | "ADMIN_PROBE"
  | "ENV_FILE_ACCESS"
  | "BOT_FLOOD"
  | "CREDENTIAL_STUFFING"
  | "HONEYPOT_TRIGGERED"
  | "PAYLOAD_INJECTION";

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
// THREAT TRACKER DATA STRUCTURES
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

/** JSON-serialisable shape stored in Redis. */
interface ThreatTrackerData {
  requestCount: number;
  rateLimitHits: number;
  suspiciousHits: number;
  loginFailures: number;
  emailsAttemptedArr: string[];
  firstSeen: number;
  lastSeen: number;
  alertsSent: number;
  blocked: boolean;
  blockExpiry: number;
}

// ============================================
// IN-MEMORY FALLBACK (local dev only)
// ============================================
const memTrackers = new Map<string, ThreatTracker>();
const TRACKER_WINDOW = 10 * 60 * 1000;
const TRACKER_WINDOW_S = Math.ceil(TRACKER_WINDOW / 1000);
const TRACKER_CLEANUP_INTERVAL = 60 * 1000;

const THRESHOLDS = {
  API_SPAM_REQUESTS: 150,
  RATE_LIMIT_ABUSE_COUNT: 5,
  BRUTE_FORCE_FAILURES: 3,
  CREDENTIAL_STUFFING_EMAILS: 3,
  BOT_FLOOD_RPS: 10,
  SUSPICIOUS_PATTERN_COUNT: 3,
  BLOCK_DURATION: 60 * 60 * 1000,
  BLOCK_DURATION_S: 3600,
};

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, tracker] of memTrackers.entries()) {
      if (tracker.blocked && now < tracker.blockExpiry) continue;
      if (now - tracker.lastSeen > TRACKER_WINDOW * 2) {
        memTrackers.delete(ip);
      }
    }
  }, TRACKER_CLEANUP_INTERVAL);
}

// ============================================
// REDIS-BACKED TRACKER I/O
// ============================================
function toData(t: ThreatTracker): ThreatTrackerData {
  return {
    requestCount: t.requestCount,
    rateLimitHits: t.rateLimitHits,
    suspiciousHits: t.suspiciousHits,
    loginFailures: t.loginFailures,
    emailsAttemptedArr: Array.from(t.emailsAttempted),
    firstSeen: t.firstSeen,
    lastSeen: t.lastSeen,
    alertsSent: t.alertsSent,
    blocked: t.blocked,
    blockExpiry: t.blockExpiry,
  };
}

function fromData(d: ThreatTrackerData): ThreatTracker {
  return {
    requestCount: d.requestCount ?? 0,
    rateLimitHits: d.rateLimitHits ?? 0,
    suspiciousHits: d.suspiciousHits ?? 0,
    loginFailures: d.loginFailures ?? 0,
    emailsAttempted: new Set(d.emailsAttemptedArr ?? []),
    firstSeen: d.firstSeen ?? Date.now(),
    lastSeen: d.lastSeen ?? Date.now(),
    alertsSent: d.alertsSent ?? 0,
    blocked: d.blocked ?? false,
    blockExpiry: d.blockExpiry ?? 0,
  };
}

function newTracker(): ThreatTracker {
  const now = Date.now();
  return {
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
}

const REDIS_PREFIX = "threat:";
const REDIS_BLOCK_PREFIX = "threat:blocked:";

/**
 * Load a tracker from Redis (or in-memory fallback).
 * Creates a fresh tracker if none exists or the window expired.
 */
async function loadTracker(ip: string): Promise<ThreatTracker> {
  const redis = getRedis();
  const now = Date.now();

  if (redis) {
    try {
      const data = await redis.get<ThreatTrackerData>(`${REDIS_PREFIX}${ip}`);
      if (data && now - data.firstSeen <= TRACKER_WINDOW) {
        const tracker = fromData(data);
        tracker.lastSeen = now;

        // Also check the separate block key (survives concurrent writes)
        const blockExpiry = await redis.get<number>(`${REDIS_BLOCK_PREFIX}${ip}`);
        if (blockExpiry && now < blockExpiry) {
          tracker.blocked = true;
          tracker.blockExpiry = blockExpiry;
        } else if (tracker.blocked && now >= tracker.blockExpiry) {
          tracker.blocked = false;
        }

        return tracker;
      }
    } catch (err) {
      console.error("[SECURITY] Redis load tracker error:", err);
    }
  }

  // In-memory fallback
  let tracker = memTrackers.get(ip);
  if (!tracker || now - tracker.firstSeen > TRACKER_WINDOW) {
    tracker = newTracker();
    memTrackers.set(ip, tracker);
  }
  tracker.lastSeen = now;
  return tracker;
}

/**
 * Persist a tracker to Redis (or in-memory fallback).
 * Also sets a separate block key for atomicity.
 */
async function saveTracker(ip: string, tracker: ThreatTracker): Promise<void> {
  const redis = getRedis();

  if (redis) {
    try {
      // Save tracker data with TTL
      await redis.set(`${REDIS_PREFIX}${ip}`, toData(tracker), {
        ex: TRACKER_WINDOW_S * 2,
      });

      // Persist block status in a separate key so concurrent writes can't
      // accidentally un-block an IP.
      if (tracker.blocked && tracker.blockExpiry > Date.now()) {
        const ttl = Math.ceil((tracker.blockExpiry - Date.now()) / 1000);
        await redis.set(`${REDIS_BLOCK_PREFIX}${ip}`, tracker.blockExpiry, {
          ex: ttl,
        });
      }
    } catch (err) {
      console.error("[SECURITY] Redis save tracker error:", err);
      // Fall through to in-memory
    }
  }

  // Always keep in-memory copy as hot cache
  memTrackers.set(ip, tracker);
}

// ============================================
// CORE ALERT FUNCTIONS (now async for Redis)
// ============================================

export async function trackRequest(ip: string, path: string): Promise<{ blocked: boolean; reason?: string }> {
  const tracker = await loadTracker(ip);
  const now = Date.now();

  if (tracker.blocked && now < tracker.blockExpiry) {
    return { blocked: true, reason: "IP temporarily blocked due to malicious activity" };
  }

  if (tracker.blocked && now >= tracker.blockExpiry) {
    tracker.blocked = false;
  }

  tracker.requestCount++;

  const elapsed = (now - tracker.firstSeen) / 1000;
  const rps = tracker.requestCount / Math.max(elapsed, 1);

  if (tracker.requestCount >= THRESHOLDS.API_SPAM_REQUESTS && tracker.alertsSent < 3) {
    persistAlert({
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

  if (rps >= THRESHOLDS.BOT_FLOOD_RPS && elapsed > 5 && tracker.alertsSent < 5) {
    persistAlert({
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
    tracker.blocked = true;
    tracker.blockExpiry = now + THRESHOLDS.BLOCK_DURATION;
    await saveTracker(ip, tracker);
    return { blocked: true, reason: "Blocked: Bot-like flood detected" };
  }

  await saveTracker(ip, tracker);
  return { blocked: false };
}

export async function trackRateLimitHit(ip: string, path: string, limitType: string): Promise<void> {
  const tracker = await loadTracker(ip);
  tracker.rateLimitHits++;

  if (tracker.rateLimitHits >= THRESHOLDS.RATE_LIMIT_ABUSE_COUNT && tracker.alertsSent < 3) {
    persistAlert({
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

    if (tracker.rateLimitHits >= THRESHOLDS.RATE_LIMIT_ABUSE_COUNT * 2) {
      tracker.blocked = true;
      tracker.blockExpiry = Date.now() + THRESHOLDS.BLOCK_DURATION;
    }
  }

  await saveTracker(ip, tracker);
}

export async function trackSuspiciousRequest(
  ip: string,
  path: string,
  userAgent: string,
  patternType: string
): Promise<void> {
  const tracker = await loadTracker(ip);
  tracker.suspiciousHits++;

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

  persistAlert({
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

  if (tracker.suspiciousHits >= THRESHOLDS.SUSPICIOUS_PATTERN_COUNT) {
    tracker.blocked = true;
    tracker.blockExpiry = Date.now() + THRESHOLDS.BLOCK_DURATION;
  }

  await saveTracker(ip, tracker);
}

export async function trackLoginFailure(ip: string, email: string): Promise<void> {
  const tracker = await loadTracker(ip);
  tracker.loginFailures++;
  tracker.emailsAttempted.add(email.toLowerCase());

  if (tracker.loginFailures >= THRESHOLDS.BRUTE_FORCE_FAILURES) {
    persistAlert({
      type: "BRUTE_FORCE",
      severity: "critical",
      ipAddress: ip,
      path: "/api/auth",
      details: `${tracker.loginFailures} failed login attempts from this IP`,
      metadata: { failureCount: tracker.loginFailures, emailsAttempted: Array.from(tracker.emailsAttempted) },
      resolved: false,
      createdAt: new Date(),
    });
  }

  if (tracker.emailsAttempted.size >= THRESHOLDS.CREDENTIAL_STUFFING_EMAILS) {
    persistAlert({
      type: "CREDENTIAL_STUFFING",
      severity: "critical",
      ipAddress: ip,
      path: "/api/auth",
      details: `${tracker.emailsAttempted.size} different emails attempted from same IP`,
      metadata: { emailCount: tracker.emailsAttempted.size, emails: Array.from(tracker.emailsAttempted) },
      resolved: false,
      createdAt: new Date(),
    });
    tracker.blocked = true;
    tracker.blockExpiry = Date.now() + THRESHOLDS.BLOCK_DURATION;
  }

  await saveTracker(ip, tracker);
}

export function trackHoneypotTrigger(ip: string, path: string, email?: string): void {
  persistAlert({
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
 * Check if an IP is currently blocked.
 * Uses Redis for distributed state, falls back to in-memory.
 */
export async function isIPBlocked(ip: string): Promise<{ blocked: boolean; reason?: string }> {
  const redis = getRedis();
  const now = Date.now();

  // Check Redis block key first (authoritative in production)
  if (redis) {
    try {
      const blockExpiry = await redis.get<number>(`${REDIS_BLOCK_PREFIX}${ip}`);
      if (blockExpiry && now < blockExpiry) {
        return { blocked: true, reason: "IP blocked due to detected malicious activity" };
      }
    } catch (err) {
      console.error("[SECURITY] Redis isIPBlocked error:", err);
    }
  }

  // In-memory fallback
  const tracker = memTrackers.get(ip);
  if (!tracker) return { blocked: false };

  if (tracker.blocked && now < tracker.blockExpiry) {
    return { blocked: true, reason: "IP blocked due to detected malicious activity" };
  }

  return { blocked: false };
}

export function getActiveThreats(): { ip: string; tracker: ThreatTracker }[] {
  // NOTE: This returns in-memory threats only (used for admin dashboard display).
  // In serverless, this may be incomplete.  For full data, query the
  // SecurityAlert table in the database via the admin API.
  const threats: { ip: string; tracker: ThreatTracker }[] = [];
  for (const [ip, tracker] of memTrackers.entries()) {
    if (tracker.requestCount > 10 || tracker.suspiciousHits > 0 || tracker.loginFailures > 0 || tracker.blocked) {
      threats.push({ ip, tracker: { ...tracker, emailsAttempted: new Set(tracker.emailsAttempted) } });
    }
  }
  return threats.sort((a, b) => {
    if (a.tracker.blocked !== b.tracker.blocked) return a.tracker.blocked ? -1 : 1;
    if (a.tracker.suspiciousHits !== b.tracker.suspiciousHits) return b.tracker.suspiciousHits - a.tracker.suspiciousHits;
    return b.tracker.requestCount - a.tracker.requestCount;
  });
}

// ============================================
// ALERT PERSISTENCE VIA INTERNAL API
// This works from Edge Runtime (middleware)
// by calling a Node.js API route to write to DB
// ============================================

// Get the direct deployment URL (bypasses domain redirects like 308)
function getBaseUrl(): string {
  // VERCEL_URL is the actual deployment URL (no domain redirects)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  return "http://localhost:3000";
}

/**
 * Call this from middleware to cache the base URL from the request
 * Falls back to VERCEL_URL which bypasses 308 domain redirects
 */
export function setBaseUrl(_requestUrl: string): void {
  // We intentionally don't use requestUrl because the custom domain
  // may trigger 308 redirects that break the internal API call.
  // VERCEL_URL always works directly.
}

function persistAlert(alert: SecurityAlert): void {
  // Always log to console
  const icon = {
    low: "[INFO]",
    medium: "[WARN]",
    high: "[ALERT]",
    critical: "[CRITICAL]",
  }[alert.severity];

  console.log(
    `${icon} SECURITY ALERT | ${alert.type} | IP: ${alert.ipAddress} | ${alert.details}`
  );

  // Fire-and-forget: call our internal API to persist to database
  const baseUrl = getBaseUrl();
  const payload = JSON.stringify({
    type: alert.type,
    severity: alert.severity,
    ipAddress: alert.ipAddress,
    path: alert.path || null,
    userAgent: alert.userAgent || null,
    details: alert.details,
    metadata: alert.metadata ? JSON.stringify(alert.metadata) : null,
  });

  // Use fetch (available in Edge Runtime) - fire and forget
  const url = `${baseUrl}/api/internal/security-log`;
  console.log(`[SECURITY] Persisting alert to: ${url}`);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": process.env.INTERNAL_API_SECRET || process.env.NEXTAUTH_SECRET || "",
    },
    body: payload,
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`[SECURITY] Alert persist failed: ${res.status} ${res.statusText}`);
      } else {
        console.log(`[SECURITY] Alert persisted successfully`);
      }
    })
    .catch((err) => {
      console.error(`[SECURITY] Alert persist fetch error:`, err);
    });
}

// ============================================
// UTILITY
// ============================================
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
