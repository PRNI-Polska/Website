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
  trailingSlash: false,
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
      {
        protocol: 'https',
        hostname: '*.gelato.com',
      },
      {
        protocol: 'https',
        hostname: '*.gelatoapis.com',
      },
      {
        protocol: 'https',
        hostname: 'gelato-api-test.s3.eu-west-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
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
