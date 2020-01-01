import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const MAX_PAGE_SIZE = 500;
const DEFAULT_PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sp = request.nextUrl.searchParams;

    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const pageSizeRaw = parseInt(sp.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSizeRaw));

    const search = (sp.get("search") || "").trim().slice(0, 200);
    const country = (sp.get("country") || "").trim().slice(0, 100);
    const fromRaw = sp.get("from");
    const toRaw = sp.get("to");
    const sortDir = sp.get("sort") === "asc" ? "asc" : "desc";
    const exportCsv = sp.get("export") === "csv";

    const where: Prisma.PageViewWhereInput = {};

    if (country) {
      where.country = country;
    }

    if (fromRaw || toRaw) {
      const range: Prisma.DateTimeFilter = {};
      if (fromRaw) {
        const d = new Date(fromRaw);
        if (!isNaN(d.getTime())) range.gte = d;
      }
      if (toRaw) {
        const d = new Date(toRaw);
        if (!isNaN(d.getTime())) {
          d.setHours(23, 59, 59, 999);
          range.lte = d;
        }
      }
      where.createdAt = range;
    }

    if (search) {
      where.OR = [
        { path: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { region: { contains: search, mode: "insensitive" } },
        { browser: { contains: search, mode: "insensitive" } },
        { os: { contains: search, mode: "insensitive" } },
        { referrer: { contains: search, mode: "insensitive" } },
      ];
    }

    if (exportCsv) {
      const visits = await prisma.pageView.findMany({
        where,
        orderBy: { createdAt: sortDir },
        take: 50000,
        select: {
          id: true,
          createdAt: true,
          path: true,
          country: true,
          region: true,
          city: true,
          device: true,
          browser: true,
          os: true,
          referrer: true,
          sessionId: true,
        },
      });

      const header = [
        "Timestamp (ISO)",
        "Timestamp (local)",
        "Path",
        "Country",
        "Region",
        "City",
        "Device",
        "Browser",
        "OS",
        "Referrer",
        "Session",
      ];
      const escape = (v: string | null | undefined) => {
        if (v == null) return "";
        const s = String(v);
        if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const rows = visits.map((v) => [
        v.createdAt.toISOString(),
        v.createdAt.toLocaleString(),
        v.path,
        v.country,
        v.region,
        v.city,
        v.device,
        v.browser,
        v.os,
        v.referrer,
        v.sessionId,
      ].map(escape).join(","));
      const csv = [header.join(","), ...rows].join("\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="prni-visits-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const [total, visits] = await Promise.all([
      prisma.pageView.count({ where }),
      prisma.pageView.findMany({
        where,
        orderBy: { createdAt: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          createdAt: true,
          path: true,
          country: true,
          region: true,
          city: true,
          device: true,
          browser: true,
          os: true,
          referrer: true,
          sessionId: true,
        },
      }),
    ]);

    return NextResponse.json({
      visits,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error("Visits log fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch visits log" },
      { status: 500 }
    );
  }
}
