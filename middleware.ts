// file: middleware.ts
// SECURITY-HARDENED MIDDLEWARE FOR POLITICAL WEBSITE
// This middleware implements multiple layers of security to protect against:
// - Brute force attacks
// - DDoS (layer 7)
// - XSS, CSRF, Clickjacking
// - Unauthorized admin access

import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

// ============================================
// SECURITY HEADERS (STRICT)
// ============================================
const securityHeaders = {
  // Prevent XSS attacks
  "X-XSS-Protection": "1; mode=block",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Disable dangerous browser features
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  // Prevent DNS prefetching to avoid leaking info
  "X-DNS-Prefetch-Control": "off",
  // Prevent downloads in IE
  "X-Download-Options": "noopen",
  // Prevent content type sniffing
  "X-Permitted-Cross-Domain-Policies": "none",
  // Force HTTPS
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

// Strict Content Security Policy
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://*.neon.tech;
  media-src 'self';
  object-src 'none';
  frame-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

// ============================================
// RATE LIMITING (STRICT - FOR POLITICAL SITE)
// ============================================
const rateLimitStore = new Map<string, { count: number; resetTime: number; blocked: boolean }>();

// Clean up expired entries every 30 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime + 300000) { // Clean after 5 min past reset
        rateLimitStore.delete(key);
      }
    }
  }, 30000);
}

function getClientIP(request: NextRequest): string {
  // Cloudflare's real IP header (most reliable when behind CF)
  const cfIP = request.headers.get("cf-connecting-ip");
  if (cfIP) return cfIP;
  
  // X-Forwarded-For (could be spoofed if not behind proxy)
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  
  // X-Real-IP
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;
  
  return "unknown";
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  blocked: boolean;
}

function checkRateLimit(
  identifier: string,
  maxRequests: number,
  intervalMs: number,
  blockDuration: number = 0
): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  // Check if permanently blocked
  if (existing?.blocked && now < existing.resetTime) {
    return { allowed: false, remaining: 0, resetIn: existing.resetTime - now, blocked: true };
  }

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + intervalMs, blocked: false });
    return { allowed: true, remaining: maxRequests - 1, resetIn: intervalMs, blocked: false };
  }

  if (existing.count >= maxRequests) {
    // Block the IP for the specified duration if provided
    if (blockDuration > 0) {
      existing.blocked = true;
      existing.resetTime = now + blockDuration;
    }
    return { allowed: false, remaining: 0, resetIn: existing.resetTime - now, blocked: existing.blocked };
  }

  existing.count++;
  return { allowed: true, remaining: maxRequests - existing.count, resetIn: existing.resetTime - now, blocked: false };
}

// STRICT Rate limit configurations for political website
const RATE_LIMITS = {
  // Auth: 3 attempts per minute, block for 30 min after abuse
  auth: { maxRequests: 3, interval: 60 * 1000, blockDuration: 30 * 60 * 1000 },
  // Contact form: 3 per hour
  contact: { maxRequests: 3, interval: 60 * 60 * 1000, blockDuration: 0 },
  // Admin API: 50 per minute
  admin: { maxRequests: 50, interval: 60 * 1000, blockDuration: 0 },
  // Public pages: 100 per minute per IP
  public: { maxRequests: 100, interval: 60 * 1000, blockDuration: 5 * 60 * 1000 },
};

// ============================================
// SUSPICIOUS REQUEST DETECTION
// ============================================
function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || "";
  const path = request.nextUrl.pathname;
  
  // Block common attack patterns
  const suspiciousPatterns = [
    /\.\./,           // Path traversal
    /<script/i,       // XSS attempt
    /union\s+select/i, // SQL injection
    /eval\(/i,        // Code injection
    /javascript:/i,   // XSS via protocol
    /on\w+\s*=/i,     // Event handler XSS
    /wp-admin/i,      // WordPress scanner
    /wp-login/i,      // WordPress scanner
    /phpmyadmin/i,    // phpMyAdmin scanner
    /\.php$/i,        // PHP file access
    /\.asp$/i,        // ASP file access
    /\.env/i,         // Env file access
    /\.git/i,         // Git folder access
    /\.htaccess/i,    // Apache config access
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(path))) {
    return true;
  }
  
  // Block suspicious user agents
  const blockedAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zgrab/i,
    /gobuster/i,
    /dirbuster/i,
    /wpscan/i,
    /curl\/[0-9]/i,  // Raw curl without proper UA
  ];
  
  if (blockedAgents.some(pattern => pattern.test(userAgent))) {
    return true;
  }
  
  return false;
}

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
// SECURITY LOGGING
// ============================================
function logSecurityEvent(type: string, details: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    type: `SECURITY:${type}`,
    timestamp,
    ...details,
  }));
}

// ============================================
// MAIN MIDDLEWARE
// ============================================
export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const ip = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || "unknown";
    
    // ============================================
    // SUSPICIOUS REQUEST BLOCKING
    // ============================================
    if (isSuspiciousRequest(req)) {
      logSecurityEvent("BLOCKED_SUSPICIOUS", { ip, pathname, userAgent });
      return new NextResponse(null, { status: 404 });
    }
    
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
      rateLimit = checkRateLimit(
        `auth:${ip}`,
        RATE_LIMITS.auth.maxRequests,
        RATE_LIMITS.auth.interval,
        RATE_LIMITS.auth.blockDuration
      );
      if (!rateLimit.allowed) {
        logSecurityEvent("RATE_LIMITED_AUTH", { ip, blocked: rateLimit.blocked });
      }
    } else if (isContactApi) {
      rateLimit = checkRateLimit(
        `contact:${ip}`,
        RATE_LIMITS.contact.maxRequests,
        RATE_LIMITS.contact.interval
      );
    } else if (isAdminApiRoute) {
      rateLimit = checkRateLimit(
        `admin:${ip}`,
        RATE_LIMITS.admin.maxRequests,
        RATE_LIMITS.admin.interval
      );
    } else if (isPublicApi) {
      rateLimit = checkRateLimit(
        `public:${ip}`,
        RATE_LIMITS.public.maxRequests,
        RATE_LIMITS.public.interval,
        RATE_LIMITS.public.blockDuration
      );
    }
    
    if (rateLimit && !rateLimit.allowed) {
      const response = NextResponse.json(
        {
          error: "Too many requests",
          message: rateLimit.blocked 
            ? "Your IP has been temporarily blocked due to suspicious activity."
            : "Rate limit exceeded. Please try again later.",
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
        logSecurityEvent("BLOCKED_ADMIN_IP", { ip, pathname });
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
      logSecurityEvent("UNAUTHORIZED_ADMIN_ACCESS", { ip, pathname });
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      return applySecurityHeaders(response);
    }

    // Verify admin role
    if ((isAdminRoute || isAdminApiRoute) && token?.role !== "ADMIN") {
      logSecurityEvent("NON_ADMIN_ACCESS_ATTEMPT", { ip, pathname, email: token?.email });
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
