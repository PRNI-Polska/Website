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

/**
 * Extract the real client IP from proxy / CDN headers.
 *
 * SECURITY: Header priority matters.  Platform-set headers that cannot be
 * spoofed by the client come first.  User-controlled headers like
 * x-forwarded-for come last as a fallback.
 *
 * - Vercel sets `x-vercel-forwarded-for` at its edge (cannot be spoofed).
 * - Cloudflare sets `cf-connecting-ip` (trusted when traffic goes through CF).
 * - `x-forwarded-for` is easily spoofable when not stripped by a trusted proxy.
 */
export function getClientIP(request: {
  headers: { get(name: string): string | null };
}): string {
  const h = request.headers;
  return (
    // Vercel-set header — highest trust, cannot be spoofed by clients
    h.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
    // Cloudflare-set header — trusted when behind CF
    h.get("cf-connecting-ip") ||
    // Standard proxy header — lower trust, can be spoofed if not behind a
    // reverse proxy that overwrites it
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
 * Validate that the request Origin (or Referer) matches the site host.
 *
 * SECURITY: When the Origin header is missing we fall back to the Referer
 * header.  If BOTH are missing on a mutation request the call is rejected in
 * production, because modern browsers always send at least one of them on
 * POST/PUT/DELETE.  A missing pair most likely indicates a forged request from
 * a non-browser HTTP client (CSRF via curl, scripts, etc.).
 */
export function validateOrigin(request: {
  headers: { get(name: string): string | null };
}): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Determine the host to validate against
  function matchesHost(headerHost: string): boolean {
    const host = request.headers.get("host");
    if (host && headerHost === host) return true;

    const siteUrl = process.env.NEXTAUTH_URL;
    if (siteUrl) {
      try {
        if (headerHost === new URL(siteUrl).host) return true;
      } catch { /* invalid URL */ }
    }

    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl && headerHost === vercelUrl) return true;

    return false;
  }

  // 1. Prefer Origin header (sent by browsers on cross-origin & same-origin POST)
  if (origin) {
    try {
      return matchesHost(new URL(origin).host);
    } catch {
      return false;
    }
  }

  // 2. Fallback to Referer header
  if (referer) {
    try {
      return matchesHost(new URL(referer).host);
    } catch {
      return false;
    }
  }

  // 3. Neither Origin nor Referer present.
  // In production, reject — modern browsers always send at least one on POST.
  // In development, allow to avoid friction with local tooling.
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[SECURITY] Request rejected: neither Origin nor Referer header present",
    );
    return false;
  }

  return true;
}

// ============================================
// PREDEFINED RATE LIMIT CONFIGS
// ============================================
export const RATE_LIMITS = {
  /**
   * Auth endpoints (login page, NextAuth API).
   * STRICT: 2 requests per 2 minutes.  Block for 30 minutes on abuse.
   * An attacker gets at most 2 shots before a long cooldown.
   */
  auth: {
    maxRequests: 2,
    windowMs: 2 * 60 * 1000,         // 2-minute window
    blockDuration: 30 * 60 * 1000,   // 30-minute block
  },
  contact: {
    maxRequests: 2,
    windowMs: 60 * 60 * 1000,
    blockDuration: 60 * 60 * 1000,
  },
  /**
   * Admin API routes (CRUD operations).
   * Tight limit — legitimate admin usage rarely exceeds 15 req/min.
   * Block for 15 minutes on abuse to deter automated enumeration.
   */
  admin: {
    maxRequests: 15,
    windowMs: 60 * 1000,             // 1-minute window
    blockDuration: 15 * 60 * 1000,   // 15-minute block
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
