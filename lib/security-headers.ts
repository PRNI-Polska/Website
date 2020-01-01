// file: lib/security-headers.ts
// Security headers for all responses

export const securityHeaders = {
  // Prevent XSS attacks
  "X-XSS-Protection": "1; mode=block",
  
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  
  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",
  
  // Disable browser features we don't need
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  
  // Force HTTPS (enable in production)
  // "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

// Content Security Policy
// Adjust based on your needs (e.g., if you use external scripts/fonts)
export const contentSecurityPolicy = `
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
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

// Get all security headers including CSP
export function getSecurityHeaders(): Record<string, string> {
  return {
    ...securityHeaders,
    "Content-Security-Policy": contentSecurityPolicy,
  };
}

// Apply security headers to a response
export function applySecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders();
  
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  
  return response;
}
