"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  ip: string;
  details: string;
  resolved: boolean;
  createdAt: string;
}

interface SecurityData {
  stats: {
    events24h: number;
    events7d: number;
    unresolvedCount: number;
    criticalCount: number;
  };
  recentEvents: SecurityEvent[];
  eventsByType: Array<{ type: string; count: number }>;
  topIPs: Array<{ ip: string; count: number }>;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const TYPE_LABELS: Record<string, string> = {
  brute_force: "Brute Force",
  auth_failure: "Auth Failure",
  csrf_failure: "CSRF Failure",
  rate_limit_exceeded: "Rate Limited",
  ip_blocked: "IP Blocked",
  suspicious_request: "Suspicious",
};

export default function SecurityDashboardPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/security");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError("Failed to load security data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function resolveEvent(eventId: string) {
    await fetch("/api/admin/security", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve", eventId }),
    });
    fetchData();
  }

  async function resolveAll() {
    await fetch("/api/admin/security", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve_all" }),
    });
    fetchData();
  }

  if (loading && !data) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-heading font-bold">Security Monitor</h1>
          <p className="text-muted-foreground">Loading security data...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-heading font-bold">Security Monitor</h1>
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchData} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const unresolvedEvents = data.recentEvents.filter((e) => !e.resolved);
  const resolvedEvents = data.recentEvents.filter((e) => e.resolved);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" /> Security Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time security events and threat monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          {data.stats.unresolvedCount > 0 && (
            <Button onClick={resolveAll} variant="outline" size="sm">
              <CheckCircle className="mr-2 h-4 w-4" /> Resolve All
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.events24h}</div>
            <p className="text-xs text-muted-foreground">Security events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.events7d}</div>
            <p className="text-xs text-muted-foreground">Security events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.stats.unresolvedCount > 0 ? "text-orange-400" : ""}`}>
              {data.stats.unresolvedCount}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.stats.criticalCount > 0 ? "text-red-400" : ""}`}>
              {data.stats.criticalCount}
            </div>
            <p className="text-xs text-muted-foreground">Critical unresolved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Events by Type (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.eventsByType.length > 0 ? (
              <div className="space-y-3">
                {data.eventsByType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-sm">{TYPE_LABELS[item.type] || item.type}</span>
                    <span className="text-sm font-mono font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events in the last 7 days</p>
            )}
          </CardContent>
        </Card>

        {/* Top IPs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top IPs (24h)</CardTitle>
            <CardDescription>IPs with the most security events</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topIPs.length > 0 ? (
              <div className="space-y-3">
                {data.topIPs.map((item) => (
                  <div key={item.ip} className="flex items-center justify-between">
                    <code className="text-sm bg-muted px-2 py-0.5 rounded">{item.ip}</code>
                    <span className="text-sm font-mono font-bold">{item.count} events</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events in the last 24 hours</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unresolved Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Unresolved Events ({unresolvedEvents.length})
          </CardTitle>
          <CardDescription>Security events requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          {unresolvedEvents.length > 0 ? (
            <div className="space-y-3">
              {unresolvedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-start justify-between p-3 rounded-lg border ${SEVERITY_STYLES[event.severity] || "bg-muted"}`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold uppercase">{event.severity}</span>
                      <span className="text-xs opacity-75">
                        {TYPE_LABELS[event.type] || event.type}
                      </span>
                      <code className="text-xs opacity-75">{event.ip}</code>
                    </div>
                    <p className="text-sm truncate">{event.details}</p>
                    <p className="text-xs opacity-60">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resolveEvent(event.id)}
                    className="ml-2 shrink-0"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">All clear — no unresolved security events</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Resolved */}
      {resolvedEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recently Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resolvedEvents.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm opacity-60"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs uppercase font-semibold">{event.severity}</span>
                    <span className="truncate">{event.details}</span>
                  </div>
                  <span className="text-xs shrink-0 ml-2">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
