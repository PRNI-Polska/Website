// file: app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer, sessionId } = body;

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
        path: path || "/",
        country,
        city: city ? decodeURIComponent(city) : null,
        region,
        device,
        browser,
        os,
        referrer: referrer || null,
        sessionId: sessionId || null,
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
