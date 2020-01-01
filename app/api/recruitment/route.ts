import { NextRequest, NextResponse } from "next/server";
import { recruitmentFormSchema } from "@/lib/validations";
import { checkRateLimit, validateHoneypot } from "@/lib/utils";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface GeoInfo {
  ip: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  asn?: string;
  proxy?: boolean;
  hosting?: boolean;
  mobile?: boolean;
}

async function lookupGeo(ip: string): Promise<GeoInfo | null> {
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.") || ip === "::1") {
    return { ip, country: "Local / Unknown" };
  }

  try {
    const fields = "status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!res.ok) return { ip };
    const j = await res.json();
    if (j?.status !== "success") return { ip };

    return {
      ip: j.query || ip,
      country: j.country,
      countryCode: j.countryCode,
      region: j.regionName,
      city: j.city,
      zip: j.zip,
      lat: j.lat,
      lon: j.lon,
      timezone: j.timezone,
      isp: j.isp,
      org: j.org,
      asn: j.as,
      proxy: j.proxy,
      hosting: j.hosting,
      mobile: j.mobile,
    };
  } catch (err) {
    console.error("Geo lookup failed:", err instanceof Error ? err.message : err);
    return { ip };
  }
}

function renderGeoHtml(geo: GeoInfo | null): string {
  if (!geo) return "<p><em>Geo lookup unavailable</em></p>";
  const approxLocation = [geo.city, geo.region, geo.country].filter(Boolean).join(", ") || "Unknown";
  const mapsLink = geo.lat != null && geo.lon != null
    ? `<a href="https://www.google.com/maps?q=${geo.lat},${geo.lon}" target="_blank">View on map (${geo.lat}, ${geo.lon})</a>`
    : "<em>No coordinates</em>";
  const flags: string[] = [];
  if (geo.proxy) flags.push("VPN/Proxy");
  if (geo.hosting) flags.push("Hosting/Datacenter");
  if (geo.mobile) flags.push("Mobile network");

  return `
    <h3 style="margin-top:24px;">Submission origin (admin only)</h3>
    <table style="font-size:13px;border-collapse:collapse;">
      <tr><td style="padding:2px 8px;color:#666;">IP</td><td style="padding:2px 8px;font-family:monospace;">${escapeHtml(geo.ip)}</td></tr>
      <tr><td style="padding:2px 8px;color:#666;">Approx. location</td><td style="padding:2px 8px;"><strong>${escapeHtml(approxLocation)}</strong>${geo.zip ? " " + escapeHtml(geo.zip) : ""}</td></tr>
      <tr><td style="padding:2px 8px;color:#666;">Coordinates</td><td style="padding:2px 8px;">${mapsLink}</td></tr>
      <tr><td style="padding:2px 8px;color:#666;">Timezone</td><td style="padding:2px 8px;">${escapeHtml(geo.timezone || "—")}</td></tr>
      <tr><td style="padding:2px 8px;color:#666;">ISP</td><td style="padding:2px 8px;">${escapeHtml(geo.isp || "—")}</td></tr>
      <tr><td style="padding:2px 8px;color:#666;">Organization</td><td style="padding:2px 8px;">${escapeHtml(geo.org || "—")}</td></tr>
      <tr><td style="padding:2px 8px;color:#666;">ASN</td><td style="padding:2px 8px;">${escapeHtml(geo.asn || "—")}</td></tr>
      ${flags.length ? `<tr><td style="padding:2px 8px;color:#a00;">⚠ Flags</td><td style="padding:2px 8px;color:#a00;"><strong>${escapeHtml(flags.join(", "))}</strong></td></tr>` : ""}
    </table>
    <p style="color:#999;font-size:11px;margin-top:8px;">Private — for internal vetting only. Do not share with the applicant.</p>
  `;
}

function renderGeoText(geo: GeoInfo | null): string {
  if (!geo) return "Geo lookup unavailable";
  const approxLocation = [geo.city, geo.region, geo.country].filter(Boolean).join(", ") || "Unknown";
  const flags: string[] = [];
  if (geo.proxy) flags.push("VPN/Proxy");
  if (geo.hosting) flags.push("Hosting/Datacenter");
  if (geo.mobile) flags.push("Mobile network");
  return [
    `IP: ${geo.ip}`,
    `Approx. location: ${approxLocation}${geo.zip ? " " + geo.zip : ""}`,
    geo.lat != null && geo.lon != null ? `Coordinates: ${geo.lat}, ${geo.lon} (https://www.google.com/maps?q=${geo.lat},${geo.lon})` : "Coordinates: —",
    `Timezone: ${geo.timezone || "—"}`,
    `ISP: ${geo.isp || "—"}`,
    `Org: ${geo.org || "—"}`,
    `ASN: ${geo.asn || "—"}`,
    flags.length ? `Flags: ${flags.join(", ")}` : "",
  ].filter(Boolean).join("\n");
}

async function sendEmail(data: { name: string; email: string; location?: string; message: string; geo: GeoInfo | null }) {
  if (!process.env.RESEND_API_KEY) {
    console.log("Recruitment submission received (no email configured)", {
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const subjectBits = [
      "[PRNI Recruitment]",
      data.name,
      `(${data.email})`,
      data.location ? `— ${data.location}` : "",
    ].filter(Boolean);

    const { error } = await resend.emails.send({
      from: "PRNI Website <noreply@prni.org.pl>",
      to: process.env.CONTACT_EMAIL || "prni.official@gmail.com",
      subject: subjectBits.join(" "),
      text: `New recruitment interest:\n\nName: ${data.name}\nEmail: ${data.email}\nLocation: ${data.location || "Not provided"}\n\nMessage:\n${data.message}\n\n---\nSubmitted: ${new Date().toISOString()}\n\n--- Submission origin (admin only) ---\n${renderGeoText(data.geo)}`,
      html: `
        <h2>New recruitment interest</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        <p><strong>Location (self-reported):</strong> ${data.location ? escapeHtml(data.location) : "<em>Not provided</em>"}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="color:#666;font-size:12px;">Submitted: ${new Date().toISOString()}</p>
        ${renderGeoHtml(data.geo)}
      `,
    });

    if (error) {
      console.error("Failed to send recruitment email");
      throw new Error("Failed to send email");
    }
  } catch (emailError) {
    console.error("Recruitment email sending failed:", emailError instanceof Error ? emailError.message : "Unknown error");
    return { success: true };
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const rawIp =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const ip = rawIp.split(",")[0]?.trim() || "unknown";

    // Rate limiting: 5 requests per 15 minutes per IP
    const rateLimit = checkRateLimit(`recruitment:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateLimit.resetIn / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = recruitmentFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, location, message, website } = parsed.data;

    if (!validateHoneypot(website)) {
      console.log("Recruitment honeypot triggered, rejecting submission");
      return NextResponse.json({ success: true });
    }

    const geo = await lookupGeo(ip);

    await sendEmail({ name, email, location, message, geo });

    return NextResponse.json({
      success: true,
      message: "Your request has been sent successfully.",
    });
  } catch (error) {
    console.error("Recruitment form error:", error);
    return NextResponse.json(
      { error: "Failed to send request. Please try again." },
      { status: 500 }
    );
  }
}

