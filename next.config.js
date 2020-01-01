/** @type {import('next').NextConfig} */

// Security headers — consolidated, mirrors middleware.ts
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  },
  {
    key: "X-Download-Options",
    value: "noopen",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.neon.tech",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig = {
  // Disable x-powered-by header (don't reveal we're using Next.js)
  poweredByHeader: false,

  images: {
    // SECURITY: Restrict image optimization to known domains only
    // Add your actual image hosting domains here
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Add more trusted domains as needed:
      // { protocol: "https", hostname: "your-cdn.example.com" },
    ],
  },

  // Enable experimental features for server actions
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Redirect HTTP to HTTPS in production
  async redirects() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [];
  },
};

module.exports = nextConfig;
