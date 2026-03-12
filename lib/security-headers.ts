export const securityHeaders: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
};

export function buildContentSecurityPolicy(nonce?: string): string {
  const scriptSrc = nonce
    ? `'self' 'nonce-${nonce}' 'strict-dynamic'`
    : "'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://vaultcall-server.onrender.com wss://vaultcall-server.onrender.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export const contentSecurityPolicy = buildContentSecurityPolicy();

export function getSecurityHeaders(nonce?: string): Record<string, string> {
  return {
    ...securityHeaders,
    "Content-Security-Policy": buildContentSecurityPolicy(nonce),
  };
}

export function applySecurityHeaders(response: Response, nonce?: string): Response {
  const headers = getSecurityHeaders(nonce);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
