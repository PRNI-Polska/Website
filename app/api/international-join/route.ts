// file: app/api/international-join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, validateHoneypot } from "@/lib/utils";
import { internationalJoinSchema } from "@/lib/validations";

interface InternationalJoinData {
  name: string;
  email: string;
  country: string;
  languages?: string;
  interest: string;
  message?: string;
  consent: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  
  // If no API key configured, just log
  if (!process.env.RESEND_API_KEY) {
    console.log("International wing registration received (no email configured)", {
      timestamp: new Date().toISOString(),
    });
    return { success: true, emailSent: false };
  }

  try {
    // Dynamic import to avoid issues if resend isn't installed
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "PRNI Website <noreply@prni.org.pl>",
      to: process.env.CONTACT_EMAIL || "prni.official@gmail.com",
      subject: `[PRNI International Wing] New Registration: ${data.name} (${data.email})`,
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
      console.error("International wing registration email failed");
      return { success: true, emailSent: false };
    }

    return { success: true, emailSent: true };
  } catch (emailError) {
    console.error("International wing email sending failed:", emailError instanceof Error ? emailError.message : "Unknown error");
    return { success: true, emailSent: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";

    // Rate limiting: 5 requests per 30 minutes per IP
    const rateLimit = checkRateLimit(`intl-join:${ip}`, 5, 30 * 60 * 1000);
    
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

    const parsed = internationalJoinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data as InternationalJoinData;

    if (!validateHoneypot((body as Record<string, unknown>).website as string)) {
      console.log("International join honeypot triggered, rejecting submission");
      return NextResponse.json({ success: true });
    }

    const result = await sendNotificationEmail(data);
    
    console.log("International wing registration processed:", {
      emailSent: result.emailSent,
      timestamp: new Date().toISOString(),
    });

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
