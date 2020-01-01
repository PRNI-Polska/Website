// file: lib/redis.ts
// Upstash Redis client for distributed rate limiting & session tracking
// Edge Runtime compatible - NO Prisma or Node-only imports

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let initialized = false;

/**
 * Get the Upstash Redis client (singleton).
 * Returns null if UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set.
 * Safe for Edge Runtime.
 */
export function getRedis(): Redis | null {
  if (initialized) return redis;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[SECURITY] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required " +
          "in production for distributed rate limiting. In-memory fallback is NOT safe " +
          "for serverless deployments. Visit https://upstash.com to provision a free Redis instance."
      );
    }
    return null;
  }

  try {
    redis = new Redis({ url, token });
  } catch (err) {
    console.error("[SECURITY] Failed to initialize Upstash Redis:", err);
    redis = null;
  }

  return redis;
}
