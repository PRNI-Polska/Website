// file: lib/rate-limit.ts
// Rate limiting for API protection

import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  interval: number; // in milliseconds
  maxRequests: number;
}

// In-memory store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

export function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP (behind proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  const cfConnecting = request.headers.get("cf-connecting-ip");
  if (cfConnecting) {
    return cfConnecting;
  }
  
  // Fallback
  return "unknown";
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = identifier;
  
  const existing = rateLimitStore.get(key);
  
  if (!existing || now > existing.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
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

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Very strict for auth endpoints
  auth: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 attempts per minute
  },
  // Strict for contact form (anti-spam)
  contact: {
    interval: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 submissions per hour
  },
  // Moderate for admin API
  admin: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  // Lenient for public API
  public: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
} as const;

// Helper to create rate limit response
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

// Middleware helper for rate limiting
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
