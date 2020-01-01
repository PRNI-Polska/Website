// file: app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "7d"; // 24h, 7d, 30d, all
    const filterCountry = searchParams.get("country"); // Optional country filter

    // Calculate date range
    let startDate: Date;
    const now = new Date();
    switch (period) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = period === "all" ? {} : { createdAt: { gte: startDate } };
    
    // Apply country filter if provided
    if (filterCountry) {
      whereClause.country = filterCountry;
    }

    // Get total page views
    const totalViews = await prisma.pageView.count({
      where: whereClause,
    });

    // Get unique visitors (by sessionId)
    const uniqueVisitors = await prisma.pageView.groupBy({
      by: ["sessionId"],
      where: {
        ...whereClause,
        sessionId: { not: null },
      },
    });

    // Get views by country (always get all countries for the selector)
    const baseWhereClause = period === "all" ? {} : { createdAt: { gte: startDate } };
    const viewsByCountry = await prisma.pageView.groupBy({
      by: ["country"],
      where: baseWhereClause,
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 20,
    });

    // Get views by city (filtered by country if selected)
    const viewsByCity = await prisma.pageView.groupBy({
      by: ["city", "country"],
      where: whereClause,
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 15,
    });

    // Get views by region (filtered by country if selected)
    const viewsByRegion = await prisma.pageView.groupBy({
      by: ["region"],
      where: whereClause,
      _count: { region: true },
      orderBy: { _count: { region: "desc" } },
      take: 10,
    });

    // Get views by page
    const viewsByPage = await prisma.pageView.groupBy({
      by: ["path"],
      where: whereClause,
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    });

    // Get views by device
    const viewsByDevice = await prisma.pageView.groupBy({
      by: ["device"],
      where: whereClause,
      _count: { device: true },
      orderBy: { _count: { device: "desc" } },
    });

    // Get views by browser
    const viewsByBrowser = await prisma.pageView.groupBy({
      by: ["browser"],
      where: whereClause,
      _count: { browser: true },
      orderBy: { _count: { browser: "desc" } },
    });

    // Get views by OS
    const viewsByOS = await prisma.pageView.groupBy({
      by: ["os"],
      where: whereClause,
      _count: { os: true },
      orderBy: { _count: { os: "desc" } },
    });

    // Get views over time (daily for last 30 days, hourly for 24h)
    const viewsOverTime = await getViewsOverTime(period, startDate, filterCountry);

    // Get recent views
    const recentViews = await prisma.pageView.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        path: true,
        country: true,
        city: true,
        region: true,
        device: true,
        browser: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      viewsByCountry: viewsByCountry.map((v) => ({
        country: v.country || "Unknown",
        count: v._count.country,
      })),
      viewsByCity: viewsByCity.map((v) => ({
        city: v.city || "Unknown",
        country: v.country || "Unknown",
        count: v._count.city,
      })),
      viewsByRegion: viewsByRegion.map((v) => ({
        region: v.region || "Unknown",
        count: v._count.region,
      })),
      viewsByPage: viewsByPage.map((v) => ({
        path: v.path,
        count: v._count.path,
      })),
      viewsByDevice: viewsByDevice.map((v) => ({
        device: v.device || "Unknown",
        count: v._count.device,
      })),
      viewsByBrowser: viewsByBrowser.map((v) => ({
        browser: v.browser || "Unknown",
        count: v._count.browser,
      })),
      viewsByOS: viewsByOS.map((v) => ({
        os: v.os || "Unknown",
        count: v._count.os,
      })),
      viewsOverTime,
      recentViews,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

async function getViewsOverTime(period: string, startDate: Date, filterCountry?: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = period === "all" ? {} : { createdAt: { gte: startDate } };
  if (filterCountry) {
    whereClause.country = filterCountry;
  }

  const views = await prisma.pageView.findMany({
    where: whereClause,
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by hour for 24h, by day for longer periods
  const grouped: Record<string, number> = {};
  
  for (const view of views) {
    let key: string;
    if (period === "24h") {
      key = view.createdAt.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    } else {
      key = view.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
    }
    grouped[key] = (grouped[key] || 0) + 1;
  }

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}
