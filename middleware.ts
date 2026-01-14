// file: middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

// ============================================
// SECURITY HEADERS
// ============================================
const securityHeaders = {
  "X-XSS-Protection": "1; mode=block",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self';
  media-src 'self';
  object-src 'none';
  frame-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
`.replace(/\s{2,}/g, " ").trim();

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

// ============================================
// RATE LIMITING (In-Memory)
// ============================================
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every minute
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

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

function checkRateLimit(
  identifier: string,
  maxRequests: number,
  intervalMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + intervalMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: intervalMs };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: existing.resetTime - now };
  }

  existing.count++;
  return { allowed: true, remaining: maxRequests - existing.count, resetIn: existing.resetTime - now };
}

// Rate limit configurations
const RATE_LIMITS = {
  auth: { maxRequests: 5, interval: 60 * 1000 },        // 5 per minute
  contact: { maxRequests: 5, interval: 60 * 60 * 1000 }, // 5 per hour
  admin: { maxRequests: 100, interval: 60 * 1000 },     // 100 per minute
  public: { maxRequests: 200, interval: 60 * 1000 },    // 200 per minute
};

// ============================================
// IP ALLOWLIST FOR ADMIN (Optional)
// ============================================
function isIPAllowed(ip: string): boolean {
  const allowedIPs = process.env.ALLOWED_ADMIN_IPS;
  if (!allowedIPs) return true; // If not configured, allow all
  
  const allowList = allowedIPs.split(",").map((i) => i.trim());
  return allowList.includes(ip) || allowList.includes("*");
}

// ============================================
// MAIN MIDDLEWARE
// ============================================
export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const ip = getClientIP(req);
    
    // Determine route type
    const isAdminRoute = pathname.startsWith("/admin");
    const isAdminApiRoute = pathname.startsWith("/api/admin");
    const isLoginPage = pathname === "/admin/login";
    const isAuthApi = pathname.startsWith("/api/auth");
    const isContactApi = pathname === "/api/contact";
    const isPublicApi = pathname.startsWith("/api/") && !isAdminApiRoute && !isAuthApi;
    
    // ============================================
    // RATE LIMITING
    // ============================================
    let rateLimit: RateLimitResult | null = null;
    
    if (isAuthApi || isLoginPage) {
      rateLimit = checkRateLimit(`auth:${ip}`, RATE_LIMITS.auth.maxRequests, RATE_LIMITS.auth.interval);
    } else if (isContactApi) {
      rateLimit = checkRateLimit(`contact:${ip}`, RATE_LIMITS.contact.maxRequests, RATE_LIMITS.contact.interval);
    } else if (isAdminApiRoute) {
      rateLimit = checkRateLimit(`admin:${ip}`, RATE_LIMITS.admin.maxRequests, RATE_LIMITS.admin.interval);
    } else if (isPublicApi) {
      rateLimit = checkRateLimit(`public:${ip}`, RATE_LIMITS.public.maxRequests, RATE_LIMITS.public.interval);
    }
    
    if (rateLimit && !rateLimit.allowed) {
      const response = NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil(rateLimit.resetIn / 1000),
        },
        { status: 429 }
      );
      response.headers.set("Retry-After", Math.ceil(rateLimit.resetIn / 1000).toString());
      return applySecurityHeaders(response);
    }
    
    // ============================================
    // IP ALLOWLIST CHECK FOR ADMIN
    // ============================================
    if ((isAdminRoute || isAdminApiRoute) && !isLoginPage) {
      if (!isIPAllowed(ip)) {
        console.warn(`[SECURITY] Blocked admin access from IP: ${ip}`);
        const response = NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
        return applySecurityHeaders(response);
      }
    }
    
    // ============================================
    // AUTH CHECKS
    // ============================================
    const token = req.nextauth.token;
    
    // Allow access to login page
    if (isLoginPage) {
      if (token) {
        const response = NextResponse.redirect(new URL("/admin", req.url));
        return applySecurityHeaders(response);
      }
      const response = NextResponse.next();
      return applySecurityHeaders(response);
    }

    // Protect admin routes and API routes
    if ((isAdminRoute || isAdminApiRoute) && !token) {
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      return applySecurityHeaders(response);
    }

    // Verify admin role
    if ((isAdminRoute || isAdminApiRoute) && token?.role !== "ADMIN") {
      console.warn(`[SECURITY] Non-admin user attempted admin access: ${token?.email}`);
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      return applySecurityHeaders(response);
    }

    const response = NextResponse.next();
    
    // Add rate limit headers if applicable
    if (rateLimit) {
      response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
      response.headers.set("X-RateLimit-Reset", Math.ceil(rateLimit.resetIn / 1000).toString());
    }
    
    return applySecurityHeaders(response);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isLoginPage = req.nextUrl.pathname === "/admin/login";
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
        const isAdminApiRoute = req.nextUrl.pathname.startsWith("/api/admin");
        
        // Always allow login page
        if (isLoginPage) return true;
        
        // Require auth for admin routes
        if (isAdminRoute || isAdminApiRoute) {
          return !!token;
        }
        
        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Admin routes
    "/admin/:path*",
    "/api/admin/:path*",
    // Auth routes (for rate limiting)
    "/api/auth/:path*",
    // Contact route (for rate limiting)
    "/api/contact",
    // Public API routes (for rate limiting)
    "/api/calendar/:path*",
  ],
};
