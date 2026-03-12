import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  interval: number; // in milliseconds
  maxRequests: number;
}

// ---------------------------------------------------------------------------
// Upstash Redis rate limiter (used in production when UPSTASH_REDIS_REST_URL
// and UPSTASH_REDIS_REST_TOKEN are set)
// ---------------------------------------------------------------------------
let upstashLimiter: {
  limit: (identifier: string) => Promise<{ success: boolean; remaining: number; reset: number }>;
} | null = null;

let upstashInitialized = false;

async function getUpstashLimiter() {
  if (upstashInitialized) return upstashLimiter;
  upstashInitialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[RATE-LIMIT] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set. " +
        "Falling back to in-memory rate limiting (not suitable for multi-instance deployments)."
      );
    }
    return null;
  }

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = new Redis({ url, token });

    upstashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "prni-rl",
    });

    console.log("[RATE-LIMIT] Upstash Redis rate limiter initialized");
    return upstashLimiter;
  } catch (err) {
    console.error("[RATE-LIMIT] Failed to initialize Upstash:", err instanceof Error ? err.message : "Unknown error");
    return null;
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.interval,
    };
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: existing.resetTime - now,
    };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetIn: existing.resetTime - now,
  };
}

// ---------------------------------------------------------------------------
// Public API (tries Upstash first, falls back to in-memory)
// ---------------------------------------------------------------------------
export function getClientIP(request: NextRequest): string {
  const cfConnecting = request.headers.get("cf-connecting-ip");
  if (cfConnecting) return cfConnecting;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  return "unknown";
}

export async function checkRateLimitAsync(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const limiter = await getUpstashLimiter();

  if (limiter) {
    try {
      const result = await limiter.limit(`${identifier}:${config.maxRequests}:${config.interval}`);
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetIn: Math.max(0, result.reset - Date.now()),
      };
    } catch {
      // Fall back to in-memory on Upstash error
    }
  }

  return checkRateLimitInMemory(identifier, config);
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  return checkRateLimitInMemory(identifier, config);
}

export const RATE_LIMITS = {
  auth: {
    interval: 60 * 1000,
    maxRequests: 5,
  },
  contact: {
    interval: 60 * 60 * 1000,
    maxRequests: 5,
  },
  admin: {
    interval: 60 * 1000,
    maxRequests: 60,
  },
  public: {
    interval: 60 * 1000,
    maxRequests: 100,
  },
} as const;

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
    }
  );
}

export function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  customIdentifier?: string
): { allowed: boolean; response?: NextResponse } {
  const ip = getClientIP(request);
  const identifier = customIdentifier || `${ip}:${request.nextUrl.pathname}`;

  const result = checkRateLimit(identifier, config);

  if (!result.allowed) {
    return {
      allowed: false,
      response: rateLimitResponse(result.resetIn),
    };
  }

  return { allowed: true };
}
