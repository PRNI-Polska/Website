// file: lib/rate-limit.ts
// Distributed rate limiting with Upstash Redis + in-memory fallback
// Edge Runtime compatible - NO Prisma or Node-only imports
//
// In production (serverless): Uses Upstash Redis for distributed state
// In local dev: Falls back to in-memory Map (acceptable for single-process)

import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";
import { NextResponse } from "next/server";

// ============================================
// DURATION HELPER
// ============================================
function msToWindow(ms: number): string {
  const s = Math.ceil(ms / 1000);
  if (s >= 86400 && s % 86400 === 0) return `${s / 86400} d`;
  if (s >= 3600 && s % 3600 === 0) return `${s / 3600} h`;
  if (s >= 60 && s % 60 === 0) return `${s / 60} m`;
  return `${s} s`;
}

// ============================================
// REDIS RATE LIMITERS (lazy singleton cache)
// ============================================
const limiters = new Map<string, Ratelimit>();

function getLimiter(
  prefix: string,
  maxRequests: number,
  windowMs: number,
): Ratelimit | null {
  const key = `${prefix}:${maxRequests}:${windowMs}`;
  const cached = limiters.get(key);
  if (cached) return cached;

  const redis = getRedis();
  if (!redis) return null;

  const limiter = new Ratelimit({
    redis,
    prefix: `rl:${prefix}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    limiter: Ratelimit.slidingWindow(maxRequests, msToWindow(windowMs) as any),
    analytics: true,
  });

  limiters.set(key, limiter);
  return limiter;
}

// ============================================
// IN-MEMORY FALLBACK (local dev without Redis)
// ============================================
const memStore = new Map<
  string,
  { count: number; resetTime: number; blocked: boolean }
>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of memStore.entries()) {
      if (now > v.resetTime + 300_000) memStore.delete(k);
    }
  }, 30_000);
}

function memoryLimit(
  id: string,
  max: number,
  windowMs: number,
  blockMs: number,
): RateLimitResult {
  const now = Date.now();
  const rec = memStore.get(id);

  if (rec?.blocked && now < rec.resetTime) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: rec.resetTime - now,
      blocked: true,
    };
  }

  if (!rec || now > rec.resetTime) {
    memStore.set(id, { count: 1, resetTime: now + windowMs, blocked: false });
    return {
      allowed: true,
      remaining: max - 1,
      resetIn: windowMs,
      blocked: false,
    };
  }

  if (rec.count >= max) {
    if (blockMs > 0) {
      rec.blocked = true;
      rec.resetTime = now + blockMs;
    }
    return {
      allowed: false,
      remaining: 0,
      resetIn: rec.resetTime - now,
      blocked: rec.blocked,
    };
  }

  rec.count++;
  return {
    allowed: true,
    remaining: max - rec.count,
    resetIn: rec.resetTime - now,
    blocked: false,
  };
}

// ============================================
// PUBLIC API
// ============================================
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  blocked: boolean;
}

/**
 * Check rate limit for an identifier.
 * Uses Upstash Redis when configured, falls back to in-memory for local dev.
 *
 * @param identifier     - unique key per client (usually IP address)
 * @param prefix         - category label, e.g. "auth", "contact"
 * @param maxRequests    - allowed requests within the window
 * @param windowMs       - sliding window size in milliseconds
 * @param blockDurationMs - if exceeded, block the identifier for this long (0 = no block)
 */
export async function rateLimit(
  identifier: string,
  prefix: string,
  maxRequests: number,
  windowMs: number,
  blockDurationMs: number = 0,
): Promise<RateLimitResult> {
  // --- Try Redis first ---
  const limiter = getLimiter(prefix, maxRequests, windowMs);

  // SECURITY: In production, if Redis is not available, enforce a very
  // conservative in-memory fallback and log a loud warning.  The in-memory
  // Map is NOT shared across serverless function instances, so an attacker
  // can bypass limits by hitting different instances.  The fallback here is
  // intentionally 5x stricter to partially compensate.
  if (!limiter && process.env.NODE_ENV === "production") {
    console.error(
      `[RATE-LIMIT] Redis unavailable in PRODUCTION for prefix="${prefix}". ` +
        "Falling back to in-memory (NOT safe for serverless). " +
        "Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN ASAP."
    );
    // Use much stricter limits to partially mitigate the serverless gap
    const strictMax = Math.max(1, Math.floor(maxRequests / 5));
    return memoryLimit(
      `${prefix}:${identifier}`,
      strictMax,
      windowMs,
      blockDurationMs > 0 ? blockDurationMs * 2 : windowMs,
    );
  }

  if (limiter) {
    try {
      const res = await limiter.limit(identifier);

      // If rate exceeded and a block duration is configured, track in memory
      if (!res.success && blockDurationMs > 0) {
        const blockKey = `block:${prefix}:${identifier}`;
        const mem = memoryLimit(blockKey, 1, blockDurationMs, blockDurationMs);
        if (mem.blocked) {
          return {
            allowed: false,
            remaining: 0,
            resetIn: blockDurationMs,
            blocked: true,
          };
        }
      }

      return {
        allowed: res.success,
        remaining: res.remaining,
        resetIn: Math.max(0, res.reset - Date.now()),
        blocked: false,
      };
    } catch (err) {
      console.error("[RATE-LIMIT] Redis error, falling back to in-memory:", err);
    }
  }

  // --- Fallback to in-memory ---
  return memoryLimit(
    `${prefix}:${identifier}`,
    maxRequests,
    windowMs,
    blockDurationMs,
  );
}

// ============================================
// HELPERS
// ============================================

/** Extract the real client IP from proxy / CDN headers. */
export function getClientIP(request: {
  headers: { get(name: string): string | null };
}): string {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

/** Create a standard 429 JSON response. */
export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil(resetIn / 1000),
    },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil(resetIn / 1000).toString(),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}

/**
 * Validate that the request Origin matches the site host.
 * Returns true when Origin is absent (same-origin) or matches the host / NEXTAUTH_URL.
 */
export function validateOrigin(request: {
  headers: { get(name: string): string | null };
}): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin requests omit the Origin header

  try {
    const originHost = new URL(origin).host;

    // Match against Host header
    const host = request.headers.get("host");
    if (host && originHost === host) return true;

    // Match against configured site URL
    const siteUrl = process.env.NEXTAUTH_URL;
    if (siteUrl && originHost === new URL(siteUrl).host) return true;

    // Vercel preview deploys
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl && originHost === vercelUrl) return true;

    return false;
  } catch {
    return false;
  }
}

// ============================================
// PREDEFINED RATE LIMIT CONFIGS
// ============================================
export const RATE_LIMITS = {
  auth: {
    maxRequests: 3,
    windowMs: 60 * 1000,
    blockDuration: 5 * 60 * 1000,
  },
  contact: {
    maxRequests: 2,
    windowMs: 60 * 60 * 1000,
    blockDuration: 60 * 60 * 1000,
  },
  admin: {
    maxRequests: 50,
    windowMs: 60 * 1000,
    blockDuration: 0,
  },
  public: {
    maxRequests: 60,
    windowMs: 60 * 1000,
    blockDuration: 10 * 60 * 1000,
  },
  analytics: {
    maxRequests: 20,
    windowMs: 60 * 1000,
    blockDuration: 5 * 60 * 1000,
  },
  internationalJoin: {
    maxRequests: 2,
    windowMs: 60 * 60 * 1000,
    blockDuration: 60 * 60 * 1000,
  },
  recruitment: {
    maxRequests: 2,
    windowMs: 60 * 60 * 1000,
    blockDuration: 60 * 60 * 1000,
  },
  /** Lenient limit for public page views — prevents aggressive scraping. */
  pages: {
    maxRequests: 120,
    windowMs: 60 * 1000,
    blockDuration: 5 * 60 * 1000,
  },
} as const;
