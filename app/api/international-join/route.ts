// file: app/api/international-join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { escapeHtml } from "@/lib/security-alerts";
import { rateLimit, getClientIP, validateOrigin, RATE_LIMITS } from "@/lib/rate-limit";

interface InternationalJoinData {
  name: string;
  email: string;
  country: string;
  languages?: string;
  interest: string;
  message?: string;
  consent: boolean;
}

const INTEREST_LABELS: Record<string, string> = {
  translation: "Translation & Localization",
  outreach: "Outreach & Social Media",
  events: "Events & Coordination",
  research: "Research & Analysis",
  other: "Other",
};

async function sendNotificationEmail(data: InternationalJoinData) {
  const interestLabel = INTEREST_LABELS[data.interest] || data.interest;
  
  // If no API key configured, log minimally
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      console.log("International Wing registration received (no email service configured)");
    } else {
      console.log("=== International Wing Registration (no email configured) ===");
      console.log("Name:", data.name);
      console.log("Email:", data.email);
      console.log("Country:", data.country);
      console.log("Interest:", interestLabel);
      console.log("Timestamp:", new Date().toISOString());
      console.log("==============================================================");
    }
    return { success: true, emailSent: false };
  }

  try {
    // Dynamic import to avoid issues if resend isn't installed
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "PRNI Website <noreply@prni.org.pl>",
      to: process.env.CONTACT_EMAIL || "prni.official@gmail.com",
      subject: `[PRNI International Wing] New Registration: ${data.name.replace(/[\r\n]/g, "").slice(0, 50)}`,
      text: `New International Wing Registration

Name: ${data.name}
Email: ${data.email}
Country: ${data.country}
Languages: ${data.languages || "Not specified"}
Area of Interest: ${interestLabel}

Message:
${data.message || "No message provided"}

---
Submitted: ${new Date().toISOString()}
Note: This person has acknowledged that participation does not constitute party membership.`,
      html: `
        <h2>New International Wing Registration</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Country:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.country)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Languages:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.languages ? escapeHtml(data.languages) : "<em>Not specified</em>"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Interest Area:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(interestLabel)}</td>
          </tr>
        </table>
        
        ${data.message ? `
          <h3 style="margin-top: 20px;">Message:</h3>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
        ` : ""}
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Submitted: ${new Date().toISOString()}<br>
          <em>This person has acknowledged that participation does not constitute party membership.</em>
        </p>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      // Don't throw - log registration minimally
      if (process.env.NODE_ENV !== "production") {
        console.log("=== International Wing Registration (email failed) ===");
        console.log("Name:", data.name);
        console.log("Country:", data.country);
        console.log("=======================================================");
      }
      return { success: true, emailSent: false };
    }

    return { success: true, emailSent: true };
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
    // Log registration minimally
    if (process.env.NODE_ENV !== "production") {
      console.log("=== International Wing Registration (email exception) ===");
      console.log("Name:", data.name);
      console.log("Country:", data.country);
      console.log("=========================================================");
    }
    return { success: true, emailSent: false };
  }
}

// SECURITY: Hide this route from browsers — return 404 for non-POST
export async function GET() {
  return NextResponse.json(null, { status: 404 });
}

export async function POST(request: NextRequest) {
  try {
    // Origin validation (CSRF protection)
    if (!validateOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get client IP for rate limiting
    const ip = getClientIP(request);

    // Rate limiting: 2 requests per hour per IP (Redis-backed)
    const rl = await rateLimit(ip, "intl-join", RATE_LIMITS.internationalJoin.maxRequests, RATE_LIMITS.internationalJoin.windowMs, RATE_LIMITS.internationalJoin.blockDuration);
    
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rl.resetIn / 1000).toString(),
          },
        }
      );
    }

    const data: InternationalJoinData = await request.json();

    // Validate required fields
    if (!data.name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!data.email?.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!data.country?.trim()) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 }
      );
    }

    if (!data.interest?.trim()) {
      return NextResponse.json(
        { error: "Area of interest is required" },
        { status: 400 }
      );
    }

    // Validate consent
    if (!data.consent) {
      return NextResponse.json(
        { error: "Consent is required" },
        { status: 400 }
      );
    }

    // Send notification email (won't fail even if email fails)
    const result = await sendNotificationEmail(data);
    
    if (process.env.NODE_ENV !== "production") {
      console.log("Registration processed:", {
        name: data.name,
        country: data.country,
        emailSent: result.emailSent,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Registration received successfully",
    });
  } catch (error) {
    console.error("International join error:", error);
    return NextResponse.json(
      { error: "Failed to process registration. Please try again." },
      { status: 500 }
    );
  }
}
