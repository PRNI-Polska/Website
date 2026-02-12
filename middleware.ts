// file: middleware.ts
// SECURITY-HARDENED MIDDLEWARE FOR POLITICAL WEBSITE
// This middleware implements multiple layers of security to protect against:
// - Brute force attacks
// - DDoS (layer 7)
// - XSS, CSRF, Clickjacking
// - Unauthorized admin access
// - API spam & bot floods
// Integrates with security alert system for real-time attack warnings

import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import {
  trackRequest,
  trackRateLimitHit,
  trackSuspiciousRequest,
  isIPBlocked,
  setBaseUrl,
} from "@/lib/security-alerts";

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

// Strict Content Security Policy (removed 'unsafe-eval' for better XSS protection)
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
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
  // Auth: 3 attempts per minute, progressive block (5 min → 30 min)
  auth: { maxRequests: 3, interval: 60 * 1000, blockDuration: 5 * 60 * 1000 },
  // Contact form: 2 per hour, block for 1 hour after abuse
  contact: { maxRequests: 2, interval: 60 * 60 * 1000, blockDuration: 60 * 60 * 1000 },
  // Admin API: 50 per minute
  admin: { maxRequests: 50, interval: 60 * 1000, blockDuration: 0 },
  // Public pages: 60 per minute per IP, block for 10 min
  public: { maxRequests: 60, interval: 60 * 1000, blockDuration: 10 * 60 * 1000 },
  // Analytics: 20 per minute
  analytics: { maxRequests: 20, interval: 60 * 1000, blockDuration: 5 * 60 * 1000 },
  // International join: 2 per hour, block for 1 hour
  internationalJoin: { maxRequests: 2, interval: 60 * 60 * 1000, blockDuration: 60 * 60 * 1000 },
  // Recruitment: 2 per hour, block for 1 hour
  recruitment: { maxRequests: 2, interval: 60 * 60 * 1000, blockDuration: 60 * 60 * 1000 },
};

// ============================================
// SUSPICIOUS REQUEST DETECTION
// ============================================
function detectSuspiciousPattern(request: NextRequest): { suspicious: boolean; patternType: string } {
  const userAgent = request.headers.get("user-agent") || "";
  const path = request.nextUrl.pathname;
  
  // Block common attack patterns
  const pathPatterns: [RegExp, string][] = [
    [/\.\./, "path_traversal"],
    [/<script/i, "xss"],
    [/union\s+select/i, "sql_injection"],
    [/eval\(/i, "payload_injection"],
    [/javascript:/i, "xss"],
    [/on\w+\s*=/i, "xss"],
    [/wp-admin/i, "scanner"],
    [/wp-login/i, "scanner"],
    [/phpmyadmin/i, "scanner"],
    [/\.php$/i, "scanner"],
    [/\.asp$/i, "scanner"],
    [/\.env/i, "env_access"],
    [/\.git/i, "env_access"],
    [/\.htaccess/i, "env_access"],
    [/\/etc\/passwd/i, "path_traversal"],
    [/\/proc\/self/i, "path_traversal"],
    [/cmd\.exe/i, "payload_injection"],
    [/powershell/i, "payload_injection"],
    [/\bexec\b.*\(/i, "payload_injection"],
    [/\bdrop\s+table\b/i, "sql_injection"],
    [/\binsert\s+into\b/i, "sql_injection"],
    [/\bdelete\s+from\b/i, "sql_injection"],
    [/\bor\s+1\s*=\s*1/i, "sql_injection"],
    [/\badmin.*\.bak/i, "scanner"],
    [/\bbackup.*\.sql/i, "scanner"],
    [/\/xmlrpc\.php/i, "scanner"],
    [/\/wp-content/i, "scanner"],
    [/\/wp-includes/i, "scanner"],
  ];
  
  for (const [pattern, type] of pathPatterns) {
    if (pattern.test(path)) {
      return { suspicious: true, patternType: type };
    }
  }
  
  // Block suspicious user agents
  const uaPatterns: [RegExp, string][] = [
    [/sqlmap/i, "sql_injection"],
    [/nikto/i, "scanner"],
    [/nmap/i, "scanner"],
    [/masscan/i, "scanner"],
    [/zgrab/i, "scanner"],
    [/gobuster/i, "scanner"],
    [/dirbuster/i, "scanner"],
    [/wpscan/i, "scanner"],
    [/acunetix/i, "scanner"],
    [/nessus/i, "scanner"],
    [/openvas/i, "scanner"],
    [/havij/i, "sql_injection"],
    [/curl\/[0-9]/i, "suspicious_ua"],
    [/python-requests/i, "suspicious_ua"],
    [/go-http-client/i, "suspicious_ua"],
    [/java\//i, "suspicious_ua"],
  ];
  
  for (const [pattern, type] of uaPatterns) {
    if (pattern.test(userAgent)) {
      return { suspicious: true, patternType: type };
    }
  }
  
  // Check for empty/missing user agent (likely a bot)
  if (!userAgent || userAgent.length < 10) {
    return { suspicious: true, patternType: "suspicious_ua" };
  }
  
  return { suspicious: false, patternType: "" };
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
// PERSIST ALERT TO DB (awaited fetch to internal API)
// ============================================
async function saveAlert(
  req: NextRequest,
  alertType: string,
  severity: string,
  ip: string,
  path: string,
  userAgent: string,
  details: string,
  patternType?: string,
): Promise<void> {
  // Use VERCEL_URL (direct deployment URL, no 308 redirects)
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Extract geolocation from Cloudflare / Vercel headers
  const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || null;
  const city = req.headers.get("cf-ipcity") || req.headers.get("x-vercel-ip-city") || null;
  const region = req.headers.get("cf-region") || req.headers.get("x-vercel-ip-country-region") || null;
  const latitude = req.headers.get("x-vercel-ip-latitude") || null;
  const longitude = req.headers.get("x-vercel-ip-longitude") || null;

  const metadata: Record<string, unknown> = {};
  if (patternType) metadata.patternType = patternType;
  if (country) metadata.country = country;
  if (city) metadata.city = city;
  if (region) metadata.region = region;
  if (latitude && longitude) metadata.coordinates = { lat: latitude, lon: longitude };

  try {
    const res = await fetch(`${base}/api/internal/security-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": process.env.NEXTAUTH_SECRET || "internal",
      },
      body: JSON.stringify({
        type: alertType,
        severity,
        ipAddress: ip,
        path,
        userAgent: userAgent.slice(0, 200),
        details: details.slice(0, 500),
        metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
      }),
    });
    console.log(`[SECURITY] Alert saved: ${alertType} from ${country || "unknown"} (${res.status})`);
  } catch (err) {
    console.error(`[SECURITY] Failed to save alert:`, err);
  }
}

// ============================================
// MAIN MIDDLEWARE (async so we can await alert persistence)
// ============================================
export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const ip = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || "unknown";
    
    // ============================================
    // SECURITY ALERT SYSTEM - Track all requests
    // ============================================
    setBaseUrl(req.url);

    // Authenticated admins bypass the threat system IP block
    // (so you never lock yourself out of your own admin panel)
    const token = req.nextauth.token;
    const isAuthenticated = !!token && token.role === "ADMIN";

    if (!isAuthenticated) {
      // Check if IP is already blocked by threat system
      const ipBlockStatus = isIPBlocked(ip);
      if (ipBlockStatus.blocked) {
        logSecurityEvent("THREAT_BLOCKED", { ip, pathname, reason: ipBlockStatus.reason });
        await saveAlert(req, "RATE_LIMIT_ABUSE", "high", ip, pathname, userAgent, `Blocked IP attempted access: ${pathname}`);
        return new NextResponse(null, { status: 403 });
      }

      // Track this request in the alert system
      const requestTracking = trackRequest(ip, pathname);
      if (requestTracking.blocked) {
        logSecurityEvent("FLOOD_BLOCKED", { ip, pathname, reason: requestTracking.reason });
        await saveAlert(req, "BOT_FLOOD", "critical", ip, pathname, userAgent, `Bot flood blocked: ${requestTracking.reason}`);
        return new NextResponse(null, { status: 403 });
      }
    }

    // ============================================
    // SUSPICIOUS REQUEST BLOCKING
    // ============================================
    const suspiciousCheck = detectSuspiciousPattern(req);
    if (suspiciousCheck.suspicious) {
      logSecurityEvent("BLOCKED_SUSPICIOUS", { ip, pathname, userAgent, pattern: suspiciousCheck.patternType });
      // Track in-memory + rewrite to logging endpoint that persists to DB
      trackSuspiciousRequest(ip, pathname, userAgent, suspiciousCheck.patternType);
      
      const threatTypeMap: Record<string, string> = {
        "path_traversal": "PATH_TRAVERSAL",
        "xss": "XSS_ATTEMPT",
        "sql_injection": "SQL_INJECTION",
        "scanner": "SCANNER_DETECTED",
        "suspicious_ua": "SUSPICIOUS_UA",
        "env_access": "ENV_FILE_ACCESS",
        "admin_probe": "ADMIN_PROBE",
        "payload_injection": "PAYLOAD_INJECTION",
      };
      const alertType = threatTypeMap[suspiciousCheck.patternType] || "SCANNER_DETECTED";
      
      await saveAlert(req, alertType, "medium", ip, pathname, userAgent, `Suspicious pattern detected: ${suspiciousCheck.patternType} on ${pathname}`, suspiciousCheck.patternType);
      return new NextResponse(null, { status: 403 });
    }
    
    // Determine route type
    const isAdminRoute = pathname.startsWith("/admin");
    const isAdminApiRoute = pathname.startsWith("/api/admin");
    const isLoginPage = pathname === "/admin/login";
    const isAuthApi = pathname.startsWith("/api/auth");
    const isContactApi = pathname === "/api/contact";
    const isAnalyticsApi = pathname === "/api/analytics/track";
    const isInternationalJoinApi = pathname === "/api/international-join";
    const isRecruitmentApi = pathname === "/api/recruitment";
    const isPublicApi = pathname.startsWith("/api/") && !isAdminApiRoute && !isAuthApi && !isContactApi && !isAnalyticsApi && !isInternationalJoinApi && !isRecruitmentApi;
    
    // ============================================
    // RATE LIMITING
    // ============================================
    let rateLimit: RateLimitResult | null = null;
    let rateLimitType = "";
    
    if (isAuthApi || isLoginPage) {
      rateLimitType = "auth";
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
      rateLimitType = "contact";
      rateLimit = checkRateLimit(
        `contact:${ip}`,
        RATE_LIMITS.contact.maxRequests,
        RATE_LIMITS.contact.interval
      );
    } else if (isAnalyticsApi) {
      rateLimitType = "analytics";
      rateLimit = checkRateLimit(
        `analytics:${ip}`,
        RATE_LIMITS.analytics.maxRequests,
        RATE_LIMITS.analytics.interval,
        RATE_LIMITS.analytics.blockDuration
      );
    } else if (isInternationalJoinApi) {
      rateLimitType = "international-join";
      rateLimit = checkRateLimit(
        `intl-join:${ip}`,
        RATE_LIMITS.internationalJoin.maxRequests,
        RATE_LIMITS.internationalJoin.interval
      );
    } else if (isRecruitmentApi) {
      rateLimitType = "recruitment";
      rateLimit = checkRateLimit(
        `recruitment:${ip}`,
        RATE_LIMITS.recruitment.maxRequests,
        RATE_LIMITS.recruitment.interval
      );
    } else if (isAdminApiRoute) {
      rateLimitType = "admin";
      rateLimit = checkRateLimit(
        `admin:${ip}`,
        RATE_LIMITS.admin.maxRequests,
        RATE_LIMITS.admin.interval
      );
    } else if (isPublicApi) {
      rateLimitType = "public";
      rateLimit = checkRateLimit(
        `public:${ip}`,
        RATE_LIMITS.public.maxRequests,
        RATE_LIMITS.public.interval,
        RATE_LIMITS.public.blockDuration
      );
    }
    
    if (rateLimit && !rateLimit.allowed) {
      // Track rate limit hit in alert system
      trackRateLimitHit(ip, pathname, rateLimitType);

      // Log to DB for repeated abusers
      if (rateLimit.blocked) {
        await saveAlert(req, "RATE_LIMIT_ABUSE", "high", ip, pathname, userAgent, `Rate limit exceeded and IP blocked (type: ${rateLimitType}) on ${pathname}`);
        return new NextResponse(null, { status: 403 });
      }

      // Normal rate limit (not blocked yet) - return 429 directly
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
        logSecurityEvent("BLOCKED_ADMIN_IP", { ip, pathname });
        trackSuspiciousRequest(ip, pathname, userAgent, "admin_probe");
        const response = NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
        return applySecurityHeaders(response);
      }
    }
    
    // ============================================
    // AUTH CHECKS (token already declared above)
    // ============================================
    
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
      trackSuspiciousRequest(ip, pathname, userAgent, "admin_probe");
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
    // Analytics route (NOW rate limited)
    "/api/analytics/track",
    // International join route (for rate limiting)
    "/api/international-join",
    // Recruitment route (for rate limiting)
    "/api/recruitment",
    // Public API routes (for rate limiting)
    "/api/calendar/:path*",
  ],
};
