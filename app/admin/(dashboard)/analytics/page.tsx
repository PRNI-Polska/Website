// file: app/admin/(dashboard)/analytics/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  viewsByCountry: { country: string; count: number }[];
  viewsByCity: { city: string; country: string; count: number }[];
  viewsByRegion: { region: string; count: number }[];
  viewsByPage: { path: string; count: number }[];
  viewsByDevice: { device: string; count: number }[];
  viewsByBrowser: { browser: string; count: number }[];
  viewsByOS: { os: string; count: number }[];
  viewsOverTime: { date: string; count: number }[];
  recentViews: {
    id: string;
    path: string;
    country: string | null;
    city: string | null;
    region: string | null;
    device: string | null;
    browser: string | null;
    createdAt: string;
  }[];
}

// Country code to flag emoji
function countryToFlag(countryCode: string): string {
  if (!countryCode || countryCode === "Unknown") return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Country code to name
const countryNames: Record<string, string> = {
  PL: "Poland",
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  BE: "Belgium",
  UA: "Ukraine",
  CZ: "Czech Republic",
  SK: "Slovakia",
  AT: "Austria",
  CH: "Switzerland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  CA: "Canada",
  AU: "Australia",
  JP: "Japan",
  RU: "Russia",
  BY: "Belarus",
  LT: "Lithuania",
  LV: "Latvia",
  EE: "Estonia",
  HU: "Hungary",
  RO: "Romania",
  BG: "Bulgaria",
  HR: "Croatia",
  SI: "Slovenia",
  RS: "Serbia",
  Unknown: "Unknown",
};

// Simple Bar Chart Component
function BarChart({
  data,
  maxValue,
  color = "bg-red-600",
  height = 200,
}: {
  data: { label: string; value: number }[];
  maxValue: number;
  color?: string;
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, index) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0;
        return (
          <div
            key={index}
            className="flex flex-col items-center flex-1 min-w-0"
          >
            <span className="text-xs font-medium mb-1">{item.value}</span>
            <div
              className={`w-full ${color} rounded-t transition-all duration-300`}
              style={{ height: Math.max(barHeight, 4) }}
            />
            <span className="text-xs text-muted-foreground mt-2 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Line Chart Component
function LineChart({
  data,
  height = 200,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <span className="text-muted-foreground">No data available</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 50;
  const chartWidth = 100; // percentage
  const pointSpacing = chartWidth / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: i * pointSpacing,
    y: chartHeight - (d.value / maxValue) * chartHeight,
    value: d.value,
    label: d.label,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}`)
    .join(" ");

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${chartHeight}`}
        preserveAspectRatio="none"
        className="w-full h-[calc(100%-50px)]"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={`${(y / 100) * chartHeight}`}
            x2="100"
            y2={`${(y / 100) * chartHeight}`}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          />
        ))}

        {/* Area fill */}
        <path
          d={`${pathD} L 100% ${chartHeight} L 0% ${chartHeight} Z`}
          fill="url(#gradient)"
          opacity="0.3"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="hsl(0 70% 50%)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={`${p.x}%`}
            cy={p.y}
            r="3"
            fill="hsl(0 70% 50%)"
          />
        ))}

        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(0 70% 50%)" />
            <stop offset="100%" stopColor="hsl(0 70% 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground overflow-hidden">
        {data.length <= 14
          ? data.map((d, i) => (
              <span key={i} className="truncate text-center" style={{ width: `${100 / data.length}%` }}>
                {d.label}
              </span>
            ))
          : [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]].map((d, i) => (
              <span key={i} className="truncate">
                {d?.label}
              </span>
            ))}
      </div>
    </div>
  );
}

// Pie Chart Component
function PieChart({
  data,
  size = 150,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativeAngle = -90;

  const segments = data.map((d) => {
    const angle = (d.value / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return { ...d, startAngle, angle };
  });

  const polarToCartesian = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad),
    };
  };

  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M 50 50 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  };

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
        {segments.map((seg, i) => (
          <path
            key={i}
            d={describeArc(seg.startAngle, seg.startAngle + seg.angle, 40)}
            fill={seg.color}
            className="transition-opacity hover:opacity-80"
          />
        ))}
        <circle cx="50" cy="50" r="20" fill="white" className="dark:fill-gray-900" />
      </svg>
      <div className="space-y-1 text-sm">
        {data.slice(0, 5).map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="truncate max-w-[100px]">{d.label}</span>
            <span className="text-muted-foreground">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PIE_COLORS = [
  "#dc2626", // red-600
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#d97706", // amber-600
  "#7c3aed", // violet-600
  "#db2777", // pink-600
  "#0891b2", // cyan-600
  "#65a30d", // lime-600
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [geoView, setGeoView] = useState<"country" | "city" | "region">("country");

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, selectedCountry]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      let url = `/api/admin/analytics?period=${period}`;
      if (selectedCountry && selectedCountry !== "all") {
        url += `&country=${selectedCountry}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  // Prepare chart data
  const timeChartData = useMemo(() => {
    if (!data?.viewsOverTime) return [];
    return data.viewsOverTime.slice(-14).map((v) => {
      // Format date label
      const date = new Date(v.date);
      const label = period === "24h"
        ? date.toLocaleTimeString([], { hour: "2-digit" })
        : date.toLocaleDateString([], { month: "short", day: "numeric" });
      return { label, value: v.count };
    });
  }, [data?.viewsOverTime, period]);

  const devicePieData = useMemo(() => {
    if (!data?.viewsByDevice) return [];
    return data.viewsByDevice.map((d, i) => ({
      label: d.device,
      value: d.count,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [data?.viewsByDevice]);

  const browserPieData = useMemo(() => {
    if (!data?.viewsByBrowser) return [];
    return data.viewsByBrowser.slice(0, 5).map((d, i) => ({
      label: d.browser,
      value: d.count,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [data?.viewsByBrowser]);

  const countryBarData = useMemo(() => {
    if (!data?.viewsByCountry) return [];
    return data.viewsByCountry.slice(0, 8).map((c) => ({
      label: countryToFlag(c.country),
      value: c.count,
    }));
  }, [data?.viewsByCountry]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load analytics data</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const maxCountryViews = Math.max(...(data.viewsByCountry.map((c) => c.count) || [0]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Detailed visitor insights and traffic analysis
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                🌍 All Countries
              </SelectItem>
              {data.viewsByCountry.map((c) => (
                <SelectItem key={c.country} value={c.country}>
                  {countryToFlag(c.country)} {countryNames[c.country] || c.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-gray-900 border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 dark:text-red-400">
              {data.totalViews.toLocaleString()}
            </div>
            {selectedCountry !== "all" && (
              <p className="text-xs text-muted-foreground mt-1">
                Filtered: {countryNames[selectedCountry] || selectedCountry}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 border-blue-200 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {data.uniqueVisitors.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-gray-900 border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
            <span className="text-2xl">
              {countryToFlag(data.viewsByCountry[0]?.country || "Unknown")}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-700 dark:text-green-400">
              {countryNames[data.viewsByCountry[0]?.country] ||
                data.viewsByCountry[0]?.country ||
                "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.viewsByCountry[0]?.count.toLocaleString() || 0} views
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-gray-900 border-amber-200 dark:border-amber-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Page</CardTitle>
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-400 truncate">
              {data.viewsByPage[0]?.path || "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.viewsByPage[0]?.count.toLocaleString() || 0} views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Views Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Views Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={timeChartData} height={250} />
        </CardContent>
      </Card>

      {/* Geographic Data */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Geographic Distribution
            </CardTitle>
            <Tabs value={geoView} onValueChange={(v) => setGeoView(v as typeof geoView)} className="w-auto">
              <TabsList>
                <TabsTrigger value="country">Countries</TabsTrigger>
                <TabsTrigger value="city">Cities</TabsTrigger>
                <TabsTrigger value="region">Regions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={geoView}>
            <TabsContent value="country" className="mt-0">
              {data.viewsByCountry.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {data.viewsByCountry.map((item, index) => (
                    <div key={item.country} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                      <span className="text-xl">{countryToFlag(item.country)}</span>
                      <span className="flex-1 font-medium">
                        {countryNames[item.country] || item.country}
                      </span>
                      <span className="font-mono text-sm font-medium">{item.count.toLocaleString()}</span>
                      <div className="w-32 bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-red-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.count / maxCountryViews) * 100}%`,
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCountry(item.country);
                          setGeoView("city");
                        }}
                        className="text-xs"
                      >
                        View Cities →
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="city" className="mt-0">
              {data.viewsByCity.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No city data available</p>
              ) : (
                <div className="space-y-3">
                  {data.viewsByCity.map((item, index) => {
                    const maxCityViews = data.viewsByCity[0]?.count || 1;
                    return (
                      <div key={`${item.city}-${item.country}`} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                        <span className="text-xl">{countryToFlag(item.country)}</span>
                        <div className="flex-1">
                          <span className="font-medium">{item.city}</span>
                          {selectedCountry === "all" && (
                            <span className="text-sm text-muted-foreground ml-2">
                              {countryNames[item.country] || item.country}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-sm font-medium">{item.count.toLocaleString()}</span>
                        <div className="w-32 bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.count / maxCityViews) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="region" className="mt-0">
              {data.viewsByRegion.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No region data available</p>
              ) : (
                <div className="space-y-3">
                  {data.viewsByRegion.map((item, index) => {
                    const maxRegionViews = data.viewsByRegion[0]?.count || 1;
                    return (
                      <div key={item.region} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                        <span className="flex-1 font-medium">{item.region}</span>
                        <span className="font-mono text-sm font-medium">{item.count.toLocaleString()}</span>
                        <div className="w-32 bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-green-600 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.count / maxRegionViews) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Country Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visitors by Country (Top 8)</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={countryBarData}
            maxValue={maxCountryViews}
            color="bg-red-600"
            height={220}
          />
        </CardContent>
      </Card>

      {/* Device & Browser Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart data={devicePieData} size={160} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart data={browserPieData} size={160} />
          </CardContent>
        </Card>
      </div>

      {/* Top Pages & OS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Views by Page */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {data.viewsByPage.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {data.viewsByPage.map((item, index) => (
                  <div key={item.path} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                    <span className="flex-1 font-mono text-sm truncate">
                      {item.path}
                    </span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operating Systems */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Systems</CardTitle>
          </CardHeader>
          <CardContent>
            {data.viewsByOS.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {data.viewsByOS.map((item, index) => {
                  const maxOSViews = data.viewsByOS[0]?.count || 1;
                  return (
                    <div key={item.os} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                      <span className="flex-1">{item.os}</span>
                      <span className="font-mono text-sm">{item.count}</span>
                      <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-violet-600 h-full rounded-full"
                          style={{
                            width: `${(item.count / maxOSViews) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Views */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentViews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No visitors yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Time</th>
                    <th className="text-left py-3 px-2 font-medium">Page</th>
                    <th className="text-left py-3 px-2 font-medium">Location</th>
                    <th className="text-left py-3 px-2 font-medium">Device</th>
                    <th className="text-left py-3 px-2 font-medium">Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentViews.map((view) => (
                    <tr key={view.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">
                        {new Date(view.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 font-mono text-xs">{view.path}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <span>{countryToFlag(view.country || "Unknown")}</span>
                          <span>
                            {view.city ? `${view.city}` : ""}
                            {view.city && view.region ? ", " : ""}
                            {view.region || ""}
                            {!view.city && !view.region ? (countryNames[view.country || ""] || view.country || "Unknown") : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 capitalize">{view.device || "Unknown"}</td>
                      <td className="py-3 px-2">{view.browser || "Unknown"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
