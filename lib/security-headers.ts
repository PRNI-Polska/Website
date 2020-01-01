// file: lib/security-headers.ts
// Consolidated security headers — single source of truth.
// Mirrors the headers applied by middleware.ts.
//
// SECURITY: 'unsafe-eval' REMOVED. Only 'unsafe-inline' kept (required by Next.js).

export const securityHeaders: Record<string, string> = {
  // Prevent XSS attacks
  "X-XSS-Protection": "1; mode=block",
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

// Strict Content Security Policy — NO unsafe-eval
export const contentSecurityPolicy = `
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

/** Get all security headers (including CSP) as a plain object. */
export function getSecurityHeaders(): Record<string, string> {
  return {
    ...securityHeaders,
    "Content-Security-Policy": contentSecurityPolicy,
  };
}

/** Mutate an existing Response to include all security headers. */
export function applySecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
