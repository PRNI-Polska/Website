// file: middleware.ts
// SECURITY-HARDENED MIDDLEWARE FOR POLITICAL WEBSITE
//
// Rate limiting is now backed by Upstash Redis (distributed, serverless-safe)
// with automatic in-memory fallback for local development.
//
// Protects against:
//  - Brute force attacks (progressive lockout)
//  - DDoS / bot floods (rate limiting + threat tracking)
//  - XSS, CSRF, Clickjacking (security headers)
//  - Unauthorized admin access (auth + IP allowlist)
//  - Scanner/recon probes (pattern detection)

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
import {
  rateLimit as performRateLimit,
  getClientIP,
  RATE_LIMITS,
  type RateLimitResult,
} from "@/lib/rate-limit";

// ============================================
// SECURITY HEADERS (STRICT)
// ============================================
const securityHeaders: Record<string, string> = {
  "X-XSS-Protection": "1; mode=block",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  "X-DNS-Prefetch-Control": "off",
  "X-Download-Options": "noopen",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

// Strict Content Security Policy (no unsafe-eval)
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
// SUSPICIOUS REQUEST DETECTION
// ============================================
function detectSuspiciousPattern(
  request: NextRequest,
): { suspicious: boolean; patternType: string } {
  const userAgent = request.headers.get("user-agent") || "";
  const path = request.nextUrl.pathname;

  // Block common attack patterns in the URL path
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
function logSecurityEvent(
  type: string,
  details: Record<string, unknown>,
): void {
  const timestamp = new Date().toISOString();
  console.log(
    JSON.stringify({
      type: `SECURITY:${type}`,
      timestamp,
      ...details,
    }),
  );
}

// ============================================
// PERSIST ALERT TO DB
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
  // SECURITY: never fall back to a hardcoded secret
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error(
      "[SECURITY] Cannot persist alert: NEXTAUTH_SECRET is not set",
    );
    return;
  }

  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Extract geolocation from Cloudflare / Vercel headers
  const country =
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-vercel-ip-country") ||
    null;
  const city =
    req.headers.get("cf-ipcity") ||
    req.headers.get("x-vercel-ip-city") ||
    null;
  const region =
    req.headers.get("cf-region") ||
    req.headers.get("x-vercel-ip-country-region") ||
    null;
  const latitude = req.headers.get("x-vercel-ip-latitude") || null;
  const longitude = req.headers.get("x-vercel-ip-longitude") || null;

  const metadata: Record<string, unknown> = {};
  if (patternType) metadata.patternType = patternType;
  if (country) metadata.country = country;
  if (city) metadata.city = city;
  if (region) metadata.region = region;
  if (latitude && longitude)
    metadata.coordinates = { lat: latitude, lon: longitude };

  try {
    const res = await fetch(`${base}/api/internal/security-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": secret,
      },
      body: JSON.stringify({
        type: alertType,
        severity,
        ipAddress: ip,
        path,
        userAgent: userAgent.slice(0, 200),
        details: details.slice(0, 500),
        metadata:
          Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
      }),
    });
    console.log(
      `[SECURITY] Alert saved: ${alertType} from ${country || "unknown"} (${res.status})`,
    );
  } catch (err) {
    console.error(`[SECURITY] Failed to save alert:`, err);
  }
}

// ============================================
// MAIN MIDDLEWARE
// ============================================
export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const ip = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || "unknown";

    // ============================================
    // SECURITY ALERT SYSTEM — Track all requests
    // ============================================
    setBaseUrl(req.url);

    // Authenticated admins bypass the threat-system IP block
    // (so you never lock yourself out of your own admin panel)
    const token = req.nextauth.token;
    const isAuthenticated = !!token && token.role === "ADMIN";

    if (!isAuthenticated) {
      // Check if IP is already blocked by the threat system
      const ipBlockStatus = isIPBlocked(ip);
      if (ipBlockStatus.blocked) {
        logSecurityEvent("THREAT_BLOCKED", {
          ip,
          pathname,
          reason: ipBlockStatus.reason,
        });
        await saveAlert(
          req,
          "RATE_LIMIT_ABUSE",
          "high",
          ip,
          pathname,
          userAgent,
          `Blocked IP attempted access: ${pathname}`,
        );
        return new NextResponse(null, { status: 403 });
      }

      // Track this request in the alert system
      const requestTracking = trackRequest(ip, pathname);
      if (requestTracking.blocked) {
        logSecurityEvent("FLOOD_BLOCKED", {
          ip,
          pathname,
          reason: requestTracking.reason,
        });
        await saveAlert(
          req,
          "BOT_FLOOD",
          "critical",
          ip,
          pathname,
          userAgent,
          `Bot flood blocked: ${requestTracking.reason}`,
        );
        return new NextResponse(null, { status: 403 });
      }
    }

    // ============================================
    // SUSPICIOUS REQUEST BLOCKING
    // ============================================
    const suspiciousCheck = detectSuspiciousPattern(req);
    if (suspiciousCheck.suspicious) {
      logSecurityEvent("BLOCKED_SUSPICIOUS", {
        ip,
        pathname,
        userAgent,
        pattern: suspiciousCheck.patternType,
      });
      trackSuspiciousRequest(
        ip,
        pathname,
        userAgent,
        suspiciousCheck.patternType,
      );

      const threatTypeMap: Record<string, string> = {
        path_traversal: "PATH_TRAVERSAL",
        xss: "XSS_ATTEMPT",
        sql_injection: "SQL_INJECTION",
        scanner: "SCANNER_DETECTED",
        suspicious_ua: "SUSPICIOUS_UA",
        env_access: "ENV_FILE_ACCESS",
        admin_probe: "ADMIN_PROBE",
        payload_injection: "PAYLOAD_INJECTION",
      };
      const alertType =
        threatTypeMap[suspiciousCheck.patternType] || "SCANNER_DETECTED";

      await saveAlert(
        req,
        alertType,
        "medium",
        ip,
        pathname,
        userAgent,
        `Suspicious pattern detected: ${suspiciousCheck.patternType} on ${pathname}`,
        suspiciousCheck.patternType,
      );
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
    const isPublicApi =
      pathname.startsWith("/api/") &&
      !isAdminApiRoute &&
      !isAuthApi &&
      !isContactApi &&
      !isAnalyticsApi &&
      !isInternationalJoinApi &&
      !isRecruitmentApi;

    // ============================================
    // RATE LIMITING (Redis-backed with fallback)
    // ============================================
    let rateLimitResult: RateLimitResult | null = null;
    let rateLimitType = "";

    if (isAuthApi || isLoginPage) {
      rateLimitType = "auth";
      rateLimitResult = await performRateLimit(
        ip,
        "auth",
        RATE_LIMITS.auth.maxRequests,
        RATE_LIMITS.auth.windowMs,
        RATE_LIMITS.auth.blockDuration,
      );
      if (rateLimitResult && !rateLimitResult.allowed) {
        logSecurityEvent("RATE_LIMITED_AUTH", {
          ip,
          blocked: rateLimitResult.blocked,
        });
      }
    } else if (isContactApi) {
      rateLimitType = "contact";
      rateLimitResult = await performRateLimit(
        ip,
        "contact",
        RATE_LIMITS.contact.maxRequests,
        RATE_LIMITS.contact.windowMs,
        RATE_LIMITS.contact.blockDuration,
      );
    } else if (isAnalyticsApi) {
      rateLimitType = "analytics";
      rateLimitResult = await performRateLimit(
        ip,
        "analytics",
        RATE_LIMITS.analytics.maxRequests,
        RATE_LIMITS.analytics.windowMs,
        RATE_LIMITS.analytics.blockDuration,
      );
    } else if (isInternationalJoinApi) {
      rateLimitType = "international-join";
      rateLimitResult = await performRateLimit(
        ip,
        "intl-join",
        RATE_LIMITS.internationalJoin.maxRequests,
        RATE_LIMITS.internationalJoin.windowMs,
        RATE_LIMITS.internationalJoin.blockDuration,
      );
    } else if (isRecruitmentApi) {
      rateLimitType = "recruitment";
      rateLimitResult = await performRateLimit(
        ip,
        "recruitment",
        RATE_LIMITS.recruitment.maxRequests,
        RATE_LIMITS.recruitment.windowMs,
        RATE_LIMITS.recruitment.blockDuration,
      );
    } else if (isAdminApiRoute) {
      rateLimitType = "admin";
      rateLimitResult = await performRateLimit(
        ip,
        "admin",
        RATE_LIMITS.admin.maxRequests,
        RATE_LIMITS.admin.windowMs,
        RATE_LIMITS.admin.blockDuration,
      );
    } else if (isPublicApi) {
      rateLimitType = "public";
      rateLimitResult = await performRateLimit(
        ip,
        "public",
        RATE_LIMITS.public.maxRequests,
        RATE_LIMITS.public.windowMs,
        RATE_LIMITS.public.blockDuration,
      );
    }

    if (rateLimitResult && !rateLimitResult.allowed) {
      // Track the hit in the in-memory alert system
      trackRateLimitHit(ip, pathname, rateLimitType);

      // Persistent block — return 403 and log to DB
      if (rateLimitResult.blocked) {
        await saveAlert(
          req,
          "RATE_LIMIT_ABUSE",
          "high",
          ip,
          pathname,
          userAgent,
          `Rate limit exceeded and IP blocked (type: ${rateLimitType}) on ${pathname}`,
        );
        return new NextResponse(null, { status: 403 });
      }

      // Soft limit — 429 with Retry-After
      const response = NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil(rateLimitResult.resetIn / 1000),
        },
        { status: 429 },
      );
      response.headers.set(
        "Retry-After",
        Math.ceil(rateLimitResult.resetIn / 1000).toString(),
      );
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
          { status: 403 },
        );
        return applySecurityHeaders(response);
      }
    }

    // ============================================
    // AUTH CHECKS
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
      const response = NextResponse.redirect(
        new URL("/admin/login", req.url),
      );
      return applySecurityHeaders(response);
    }

    // Verify admin role
    if ((isAdminRoute || isAdminApiRoute) && token?.role !== "ADMIN") {
      logSecurityEvent("NON_ADMIN_ACCESS_ATTEMPT", {
        ip,
        pathname,
        email: token?.email,
      });
      const response = NextResponse.redirect(
        new URL("/admin/login", req.url),
      );
      return applySecurityHeaders(response);
    }

    const response = NextResponse.next();

    // Add rate limit headers if applicable
    if (rateLimitResult) {
      response.headers.set(
        "X-RateLimit-Remaining",
        rateLimitResult.remaining.toString(),
      );
      response.headers.set(
        "X-RateLimit-Reset",
        Math.ceil(rateLimitResult.resetIn / 1000).toString(),
      );
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
  },
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
    // Analytics route (rate limited)
    "/api/analytics/track",
    // International join route (for rate limiting)
    "/api/international-join",
    // Recruitment route (for rate limiting)
    "/api/recruitment",
    // Public API routes (for rate limiting)
    "/api/calendar/:path*",
  ],
};
