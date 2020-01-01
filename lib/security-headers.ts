// file: lib/security-headers.ts
// Consolidated security headers — single source of truth.
// Mirrors the headers applied by middleware.ts.
//
// SECURITY: 'unsafe-eval' REMOVED. Nonce-based CSP for scripts.
// X-XSS-Protection set to 0 (deprecated, can introduce vulnerabilities).

export const securityHeaders: Record<string, string> = {
  // Deprecated — set to 0 to avoid XSS filter bugs in older browsers
  "X-XSS-Protection": "0",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Disable dangerous browser features
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  // Prevent DNS prefetching to avoid leaking info
  "X-DNS-Prefetch-Control": "off",
  // Prevent downloads in IE
  "X-Download-Options": "noopen",
  // Prevent content type sniffing
  "X-Permitted-Cross-Domain-Policies": "none",
  // Force HTTPS with preload
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

/**
 * Build a nonce-aware Content Security Policy.
 *
 * When a nonce is provided, script-src uses 'nonce-{value}' + 'strict-dynamic'.
 * 'unsafe-inline' is kept as a fallback for older browsers that don't support
 * 'strict-dynamic' (modern browsers ignore 'unsafe-inline' when 'strict-dynamic'
 * is present).
 *
 * Without a nonce (e.g. static next.config.js headers) the policy falls back to
 * 'self' + 'unsafe-inline' for scripts.
 */
export function buildContentSecurityPolicy(nonce?: string): string {
  // next/font/google self-hosts fonts at build time, so no runtime requests
  // to fonts.googleapis.com or fonts.gstatic.com are made.
  const scriptSrc = nonce
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'`
    : `'self' 'unsafe-inline'`;

  return `
    default-src 'self';
    script-src ${scriptSrc};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://lh3.googleusercontent.com;
    font-src 'self' data:;
    connect-src 'self';
    media-src 'self';
    object-src 'none';
    frame-src 'none';
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
    upgrade-insecure-requests;
    report-uri /api/internal/csp-report;
    report-to csp-endpoint;
  `.replace(/\s{2,}/g, " ").trim();
}

/** Backward-compatible static CSP (no nonce). */
export const contentSecurityPolicy = buildContentSecurityPolicy();

/** Get all security headers (including CSP) as a plain object. */
export function getSecurityHeaders(nonce?: string): Record<string, string> {
  return {
    ...securityHeaders,
    "Content-Security-Policy": buildContentSecurityPolicy(nonce),
  };
}

/** Mutate an existing Response to include all security headers. */
export function applySecurityHeaders(response: Response, nonce?: string): Response {
  const headers = getSecurityHeaders(nonce);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
