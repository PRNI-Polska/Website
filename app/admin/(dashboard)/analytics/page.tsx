// file: app/admin/(dashboard)/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
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

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  viewsByCountry: { country: string; count: number }[];
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
  Unknown: "Unknown",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your website visitors and traffic
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
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
            <div className="text-2xl font-bold">{data.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
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
            <div className="text-2xl font-bold">{data.uniqueVisitors.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
            <span className="text-2xl">
              {countryToFlag(data.viewsByCountry[0]?.country || "Unknown")}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {countryNames[data.viewsByCountry[0]?.country] ||
                data.viewsByCountry[0]?.country ||
                "None"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Page</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
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
            <div className="text-lg font-bold truncate">
              {data.viewsByPage[0]?.path || "None"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Views by Country */}
        <Card>
          <CardHeader>
            <CardTitle>Visitors by Country</CardTitle>
          </CardHeader>
          <CardContent>
            {data.viewsByCountry.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {data.viewsByCountry.map((item) => (
                  <div key={item.country} className="flex items-center">
                    <span className="text-xl mr-2">{countryToFlag(item.country)}</span>
                    <span className="flex-1 font-medium">
                      {countryNames[item.country] || item.country}
                    </span>
                    <span className="font-mono text-sm">{item.count}</span>
                    <div className="w-24 ml-3 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${(item.count / data.viewsByCountry[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                {data.viewsByPage.map((item) => (
                  <div key={item.path} className="flex items-center">
                    <span className="flex-1 font-mono text-sm truncate">
                      {item.path}
                    </span>
                    <span className="font-mono text-sm ml-2">{item.count}</span>
                    <div className="w-24 ml-3 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${(item.count / data.viewsByPage[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device & Browser Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Device */}
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.viewsByDevice.map((item) => (
                <div key={item.device} className="flex items-center justify-between">
                  <span className="capitalize">{item.device}</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Browser */}
        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.viewsByBrowser.map((item) => (
                <div key={item.browser} className="flex items-center justify-between">
                  <span>{item.browser}</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* OS */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.viewsByOS.map((item) => (
                <div key={item.os} className="flex items-center justify-between">
                  <span>{item.os}</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
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
                    <th className="text-left py-2 font-medium">Time</th>
                    <th className="text-left py-2 font-medium">Page</th>
                    <th className="text-left py-2 font-medium">Location</th>
                    <th className="text-left py-2 font-medium">Device</th>
                    <th className="text-left py-2 font-medium">Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentViews.map((view) => (
                    <tr key={view.id} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">
                        {new Date(view.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 font-mono">{view.path}</td>
                      <td className="py-2">
                        <span className="mr-1">{countryToFlag(view.country || "Unknown")}</span>
                        {view.city ? `${view.city}, ` : ""}
                        {countryNames[view.country || ""] || view.country || "Unknown"}
                      </td>
                      <td className="py-2 capitalize">{view.device || "Unknown"}</td>
                      <td className="py-2">{view.browser || "Unknown"}</td>
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
