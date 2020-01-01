import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const VALID_PERIODS = new Set(["24h", "7d", "30d", "all"]);
const MAX_COUNTRY_LENGTH = 100;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const rawPeriod = searchParams.get("period") || "7d";
    const period = VALID_PERIODS.has(rawPeriod) ? rawPeriod : "7d";
    const filterCountry = searchParams.get("country")?.slice(0, MAX_COUNTRY_LENGTH) || null;

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
        startDate = new Date(0);
    }

    const whereClause: Prisma.PageViewWhereInput =
      period === "all" ? {} : { createdAt: { gte: startDate } };

    if (filterCountry) {
      whereClause.country = filterCountry;
    }

    const totalViews = await prisma.pageView.count({
      where: whereClause,
    });

    const uniqueVisitors = await prisma.pageView.groupBy({
      by: ["sessionId"],
      where: {
        ...whereClause,
        sessionId: { not: null },
      },
    });

    const baseWhereClause: Prisma.PageViewWhereInput =
      period === "all" ? {} : { createdAt: { gte: startDate } };

    const viewsByCountry = await prisma.pageView.groupBy({
      by: ["country"],
      where: baseWhereClause,
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 20,
    });

    const viewsByCity = await prisma.pageView.groupBy({
      by: ["city", "country"],
      where: whereClause,
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 15,
    });

    const viewsByRegion = await prisma.pageView.groupBy({
      by: ["region"],
      where: whereClause,
      _count: { region: true },
      orderBy: { _count: { region: "desc" } },
      take: 10,
    });

    const viewsByPage = await prisma.pageView.groupBy({
      by: ["path"],
      where: whereClause,
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    });

    const viewsByDevice = await prisma.pageView.groupBy({
      by: ["device"],
      where: whereClause,
      _count: { device: true },
      orderBy: { _count: { device: "desc" } },
    });

    const viewsByBrowser = await prisma.pageView.groupBy({
      by: ["browser"],
      where: whereClause,
      _count: { browser: true },
      orderBy: { _count: { browser: "desc" } },
    });

    const viewsByOS = await prisma.pageView.groupBy({
      by: ["os"],
      where: whereClause,
      _count: { os: true },
      orderBy: { _count: { os: "desc" } },
    });

    const viewsOverTime = await getViewsOverTime(period, startDate, filterCountry);

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
  const whereClause: Prisma.PageViewWhereInput =
    period === "all" ? {} : { createdAt: { gte: startDate } };

  if (filterCountry) {
    whereClause.country = filterCountry;
  }

  const views = await prisma.pageView.findMany({
    where: whereClause,
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const grouped: Record<string, number> = {};

  for (const view of views) {
    let key: string;
    if (period === "24h") {
      key = view.createdAt.toISOString().slice(0, 13);
    } else {
      key = view.createdAt.toISOString().slice(0, 10);
    }
    grouped[key] = (grouped[key] || 0) + 1;
  }

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}
