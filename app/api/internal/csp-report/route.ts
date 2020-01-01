// file: app/api/internal/csp-report/route.ts
// CSP Violation Reporting Endpoint
//
// Receives Content-Security-Policy violation reports from browsers.
// Reports are logged to console and (in production) persisted to the
// security alerts table for the admin dashboard.
//
// Browsers send reports as either:
//   - application/csp-report  (report-uri directive, older)
//   - application/reports+json (report-to directive, newer)

import { NextRequest, NextResponse } from "next/server";

// Rate-limit CSP reports in memory to prevent log flooding
const reportCounts = new Map<string, { count: number; resetAt: number }>();
const MAX_REPORTS_PER_IP = 20; // per minute
const REPORT_WINDOW = 60_000;

function isReportAllowed(ip: string): boolean {
  const now = Date.now();
  const entry = reportCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    reportCounts.set(ip, { count: 1, resetAt: now + REPORT_WINDOW });
    return true;
  }

  if (entry.count >= MAX_REPORTS_PER_IP) return false;
  entry.count++;
  return true;
}

// Periodic cleanup
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of reportCounts.entries()) {
      if (now > entry.resetAt) reportCounts.delete(ip);
    }
  }, 60_000);
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!isReportAllowed(ip)) {
      return new NextResponse(null, { status: 429 });
    }

    const contentType = request.headers.get("content-type") || "";
    let report: Record<string, unknown> | null = null;

    if (contentType.includes("application/csp-report")) {
      // Legacy report-uri format: { "csp-report": { ... } }
      const body = await request.json();
      report = body["csp-report"] || body;
    } else if (contentType.includes("application/reports+json")) {
      // Modern report-to format: array of reports
      const body = await request.json();
      report = Array.isArray(body) ? body[0]?.body || body[0] : body;
    } else {
      // Try parsing as JSON anyway
      try {
        const body = await request.json();
        report = body["csp-report"] || body;
      } catch {
        return new NextResponse(null, { status: 400 });
      }
    }

    if (!report) {
      return new NextResponse(null, { status: 400 });
    }

    // Log to console (structured for log aggregation)
    console.log(
      JSON.stringify({
        type: "CSP_VIOLATION",
        timestamp: new Date().toISOString(),
        ip,
        blockedUri: report["blocked-uri"] || report.blockedURL || "unknown",
        violatedDirective: report["violated-directive"] || report.effectiveDirective || "unknown",
        documentUri: report["document-uri"] || report.documentURL || "unknown",
        sourceFile: report["source-file"] || report.sourceFile || null,
        lineNumber: report["line-number"] || report.lineNumber || null,
        originalPolicy: typeof report["original-policy"] === "string"
          ? report["original-policy"].slice(0, 200)
          : null,
      }),
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CSP-REPORT] Error processing report:", error);
    return new NextResponse(null, { status: 500 });
  }
}

// Only POST is allowed
export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
