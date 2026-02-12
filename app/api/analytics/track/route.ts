// file: app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/utils";

// Maximum lengths for input fields to prevent DB abuse
const MAX_PATH_LENGTH = 500;
const MAX_REFERRER_LENGTH = 1000;
const MAX_SESSION_ID_LENGTH = 100;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 30 requests per minute per IP (middleware also enforces this,
    // but this is a defense-in-depth backup for when middleware matcher is bypassed)
    const ip = request.headers.get("cf-connecting-ip") ||
               request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               request.headers.get("x-real-ip") ||
               "unknown";

    const rateLimit = checkRateLimit(`analytics:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: true }); // Silent fail to not break pages
    }

    const body = await request.json();
    const { path, referrer, sessionId } = body;

    // Validate and sanitize inputs
    if (typeof path !== "string" && path !== undefined) {
      return NextResponse.json({ success: true }); // Silent reject
    }

    const sanitizedPath = typeof path === "string" 
      ? path.slice(0, MAX_PATH_LENGTH).replace(/[<>"']/g, "") 
      : "/";
    const sanitizedReferrer = typeof referrer === "string"
      ? referrer.slice(0, MAX_REFERRER_LENGTH).replace(/[<>"']/g, "")
      : null;
    const sanitizedSessionId = typeof sessionId === "string"
      ? sessionId.slice(0, MAX_SESSION_ID_LENGTH).replace(/[^a-zA-Z0-9\-_]/g, "")
      : null;

    // Get geolocation - check Cloudflare headers first, then Vercel
    const country = request.headers.get("cf-ipcountry") || 
                    request.headers.get("x-vercel-ip-country") || null;
    const city = request.headers.get("cf-ipcity") || 
                 request.headers.get("x-vercel-ip-city") || null;
    const region = request.headers.get("cf-region") || 
                   request.headers.get("x-vercel-ip-country-region") || null;

    // Parse user agent
    const userAgent = request.headers.get("user-agent") || null;
    const device = getDeviceType(userAgent);
    const browser = getBrowser(userAgent);
    const os = getOS(userAgent);

    await prisma.pageView.create({
      data: {
        path: sanitizedPath,
        country,
        city: city ? decodeURIComponent(city) : null,
        region,
        device,
        browser,
        os,
        referrer: sanitizedReferrer,
        sessionId: sanitizedSessionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // Don't fail silently - just return success anyway to not break the page
    return NextResponse.json({ success: true });
  }
}

function getDeviceType(userAgent: string | null): string {
  if (!userAgent) return "unknown";
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  return "desktop";
}

function getBrowser(userAgent: string | null): string {
  if (!userAgent) return "unknown";
  if (/edg/i.test(userAgent)) return "Edge";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  if (/opera|opr/i.test(userAgent)) return "Opera";
  return "Other";
}

function getOS(userAgent: string | null): string {
  if (!userAgent) return "unknown";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/mac os/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  if (/android/i.test(userAgent)) return "Android";
  if (/ios|iphone|ipad/i.test(userAgent)) return "iOS";
  return "Other";
}
