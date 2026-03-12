/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()'
  },
];

const nextConfig = {
  poweredByHeader: false,
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prni.org.pl',
      },
      {
        protocol: 'https',
        hostname: '*.prni.org.pl',
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    return [];
  },
};

module.exports = nextConfig;
