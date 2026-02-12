// file: app/admin/(dashboard)/security/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Globe,
  Clock,
  Zap,
} from "lucide-react";

// ============================================
// Types
// ============================================
interface SecurityAlert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  ipAddress: string;
  path?: string;
  userAgent?: string;
  details: string;
  metadata?: Record<string, unknown>;
  resolved: boolean;
  createdAt: string;
}

interface ThreatSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  unresolved: number;
  topIPs: { ip: string; count: number }[];
  topThreats: { type: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

interface ActiveThreat {
  ip: string;
  tracker: {
    requestCount: number;
    rateLimitHits: number;
    suspiciousHits: number;
    loginFailures: number;
    emailsAttempted: string[];
    firstSeen: number;
    lastSeen: number;
    alertsSent: number;
    blocked: boolean;
    blockExpiry: number;
  };
}

// ============================================
// Severity helpers
// ============================================
const severityConfig = {
  critical: { color: "bg-red-500/10 text-red-500 border-red-500/20", label: "Critical", icon: XCircle },
  high: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "High", icon: AlertTriangle },
  medium: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Medium", icon: Eye },
  low: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Low", icon: Activity },
};

const threatTypeLabels: Record<string, string> = {
  API_SPAM: "API Spam",
  BRUTE_FORCE: "Brute Force",
  PATH_TRAVERSAL: "Path Traversal",
  XSS_ATTEMPT: "XSS Attempt",
  SQL_INJECTION: "SQL Injection",
  SCANNER_DETECTED: "Scanner Detected",
  RATE_LIMIT_ABUSE: "Rate Limit Abuse",
  SUSPICIOUS_UA: "Suspicious User Agent",
  ADMIN_PROBE: "Admin Probe",
  ENV_FILE_ACCESS: "Env File Access",
  BOT_FLOOD: "Bot Flood",
  CREDENTIAL_STUFFING: "Credential Stuffing",
  HONEYPOT_TRIGGERED: "Honeypot Triggered",
  PAYLOAD_INJECTION: "Payload Injection",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ============================================
// Main Component
// ============================================
export default function SecurityPage() {
  const [summary, setSummary] = useState<ThreatSummary | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [activeThreats, setActiveThreats] = useState<ActiveThreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [showResolved, setShowResolved] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [summaryRes, alertsRes, threatsRes] = await Promise.all([
        fetch("/api/admin/security-alerts?action=summary"),
        fetch(`/api/admin/security-alerts?action=list&limit=100${filter !== "all" ? `&severity=${filter}` : ""}${!showResolved ? "&resolved=false" : ""}`),
        fetch("/api/admin/security-alerts?action=active-threats"),
      ]);

      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      }
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }
      if (threatsRes.ok) {
        const data = await threatsRes.json();
        setActiveThreats(data.threats || []);
      }
    } catch (error) {
      console.error("Failed to fetch security data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, showResolved]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const resolveAlert = async (alertId: string) => {
    try {
      const res = await fetch("/api/admin/security-alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", alertId }),
      });
      if (res.ok) {
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)));
        fetchData(true);
      }
    } catch (error) {
      console.error("Failed to resolve alert:", error);
    }
  };

  const resolveAllForIP = async (ipAddress: string) => {
    try {
      const res = await fetch("/api/admin/security-alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve-ip", ipAddress }),
      });
      if (res.ok) {
        fetchData(true);
      }
    } catch (error) {
      console.error("Failed to resolve alerts for IP:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <ShieldAlert className="h-7 w-7" />
            Security Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time attack detection and threat monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "border-green-500/50 text-green-600" : ""}
          >
            <Zap className="h-4 w-4 mr-1" />
            {autoRefresh ? "Live" : "Paused"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">Alerts (24h)</p>
            </CardContent>
          </Card>
          <Card className={summary.critical > 0 ? "border-red-500/50 bg-red-500/5" : ""}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-2xl font-bold text-red-500">{summary.critical}</div>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>
          <Card className={summary.high > 0 ? "border-orange-500/50 bg-orange-500/5" : ""}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-2xl font-bold text-orange-500">{summary.high}</div>
              <p className="text-xs text-muted-foreground">High</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-2xl font-bold text-yellow-500">{summary.medium}</div>
              <p className="text-xs text-muted-foreground">Medium</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-2xl font-bold text-blue-500">{summary.low}</div>
              <p className="text-xs text-muted-foreground">Low</p>
            </CardContent>
          </Card>
          <Card className={summary.unresolved > 0 ? "border-yellow-500/50 bg-yellow-500/5" : "border-green-500/50 bg-green-500/5"}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-2xl font-bold">{summary.unresolved}</div>
              <p className="text-xs text-muted-foreground">Unresolved</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            Alerts {alerts.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{alerts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active">
            Active Threats {activeThreats.length > 0 && <Badge variant="destructive" className="ml-1 text-xs">{activeThreats.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="intelligence">Threat Intel</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "critical", "high", "medium", "low"] as const).map((sev) => (
              <Button
                key={sev}
                variant={filter === sev ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(sev)}
              >
                {sev === "all" ? "All" : sev.charAt(0).toUpperCase() + sev.slice(1)}
              </Button>
            ))}
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResolved(!showResolved)}
              >
                {showResolved ? "Hide Resolved" : "Show Resolved"}
              </Button>
            </div>
          </div>

          {/* Alert List */}
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold">All Clear</h3>
                <p className="text-muted-foreground mt-1">
                  No {filter !== "all" ? filter : ""} security alerts{!showResolved ? " (unresolved)" : ""}.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => {
                const config = severityConfig[alert.severity];
                const Icon = config.icon;
                return (
                  <Card
                    key={alert.id}
                    className={`${alert.resolved ? "opacity-60" : ""} ${
                      alert.severity === "critical" ? "border-red-500/30" :
                      alert.severity === "high" ? "border-orange-500/30" : ""
                    }`}
                  >
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          alert.severity === "critical" ? "text-red-500" :
                          alert.severity === "high" ? "text-orange-500" :
                          alert.severity === "medium" ? "text-yellow-500" :
                          "text-blue-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={config.color}>
                              {config.label}
                            </Badge>
                            <Badge variant="secondary">
                              {threatTypeLabels[alert.type] || alert.type}
                            </Badge>
                            {alert.resolved && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Resolved
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeAgo(alert.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{alert.details}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {alert.ipAddress}
                            </span>
                            {alert.metadata && "country" in alert.metadata ? (
                              <span className="flex items-center gap-1 font-medium text-foreground/70">
                                {alert.metadata.city ? `${String(alert.metadata.city)}, ` : ""}
                                {alert.metadata.region ? `${String(alert.metadata.region)}, ` : ""}
                                {String(alert.metadata.country)}
                              </span>
                            ) : null}
                            {alert.path && (
                              <span className="font-mono">{alert.path}</span>
                            )}
                          </div>
                        </div>
                        {!alert.resolved && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                              title="Mark as resolved"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveAllForIP(alert.ipAddress)}
                              title="Resolve all from this IP"
                            >
                              <Ban className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Active Threats Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeThreats.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold">No Active Threats</h3>
                <p className="text-muted-foreground mt-1">
                  No IPs are currently being tracked as threats.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeThreats.map((threat) => (
                <Card
                  key={threat.ip}
                  className={threat.tracker.blocked ? "border-red-500/50 bg-red-500/5" : ""}
                >
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg">{threat.ip}</span>
                          {threat.tracker.blocked && (
                            <Badge variant="destructive">BLOCKED</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Requests:</span>{" "}
                            <span className="font-semibold">{threat.tracker.requestCount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rate Limit Hits:</span>{" "}
                            <span className={`font-semibold ${threat.tracker.rateLimitHits > 0 ? "text-orange-500" : ""}`}>
                              {threat.tracker.rateLimitHits}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Suspicious:</span>{" "}
                            <span className={`font-semibold ${threat.tracker.suspiciousHits > 0 ? "text-red-500" : ""}`}>
                              {threat.tracker.suspiciousHits}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Login Failures:</span>{" "}
                            <span className={`font-semibold ${threat.tracker.loginFailures > 0 ? "text-red-500" : ""}`}>
                              {threat.tracker.loginFailures}
                            </span>
                          </div>
                        </div>
                        {threat.tracker.emailsAttempted.length > 0 && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Emails tried:</span>{" "}
                            <span className="font-mono text-xs">
                              {threat.tracker.emailsAttempted.join(", ")}
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          First seen: {new Date(threat.tracker.firstSeen).toLocaleTimeString()} |
                          Last seen: {new Date(threat.tracker.lastSeen).toLocaleTimeString()} |
                          Alerts sent: {threat.tracker.alertsSent}
                          {threat.tracker.blocked && (
                            <> | Blocked until: {new Date(threat.tracker.blockExpiry).toLocaleTimeString()}</>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveAllForIP(threat.ip)}
                      >
                        Resolve All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Threat Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Top Offending IPs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Ban className="h-4 w-4" />
                  Top Offending IPs (7 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.topIPs && summary.topIPs.length > 0 ? (
                  <div className="space-y-2">
                    {summary.topIPs.map((item, i) => (
                      <div key={item.ip} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-5">{i + 1}.</span>
                          <code className="font-mono">{item.ip}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.count} alerts</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => resolveAllForIP(item.ip)}
                            title="Resolve all from this IP"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Top Threat Types */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Top Threat Types (7 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.topThreats && summary.topThreats.length > 0 ? (
                  <div className="space-y-2">
                    {summary.topThreats.map((item, i) => (
                      <div key={item.type} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-5">{i + 1}.</span>
                          <span>{threatTypeLabels[item.type] || item.type}</span>
                        </div>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Over Time */}
          {summary?.recentActivity && summary.recentActivity.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Alert Activity (7 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-32">
                  {summary.recentActivity.map((day) => {
                    const maxCount = Math.max(...summary.recentActivity.map((d) => d.count));
                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">{day.count}</span>
                        <div
                          className="w-full bg-primary/20 rounded-t transition-all"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Security Configuration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Rate limiting active (middleware)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Security headers (HSTS, CSP, X-Frame-Options)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Suspicious request detection
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Brute force protection (progressive lockout)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Input validation (Zod + XSS patterns)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  HTML email injection protection
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Honeypot bot detection
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Security alert monitoring (this page)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Audit logging (persisted to DB)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Secure cookies (httpOnly, sameSite, secure)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  API endpoint rate limiting (all routes)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Attack pattern auto-blocking
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
