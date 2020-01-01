// file: app/api/international-join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  
  // If no API key configured, just log
  if (!process.env.RESEND_API_KEY) {
    console.log("=== International Wing Registration ===");
    console.log("Name:", data.name);
    console.log("Email:", data.email);
    console.log("Country:", data.country);
    console.log("Languages:", data.languages || "Not specified");
    console.log("Interest:", interestLabel);
    console.log("Message:", data.message || "No message");
    console.log("Timestamp:", new Date().toISOString());
    console.log("========================================");
    return { success: true };
  }

  // Send email to admin via Resend
  const { error } = await resend.emails.send({
    from: "PRNI Website <onboarding@resend.dev>",
    to: process.env.CONTACT_EMAIL || "prni.official@gmail.com",
    subject: `[PRNI International Wing] New Affiliate Registration: ${data.name} (${data.email})`,
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
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Country:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.country}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Languages:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.languages || "<em>Not specified</em>"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Interest Area:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${interestLabel}</td>
        </tr>
      </table>
      
      ${data.message ? `
        <h3 style="margin-top: 20px;">Message:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${data.message.replace(/\n/g, "<br>")}</p>
      ` : ""}
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        Submitted: ${new Date().toISOString()}<br>
        <em>This person has acknowledged that participation does not constitute party membership.</em>
      </p>
    `,
  });

  if (error) {
    console.error("Failed to send notification email:", error);
    throw new Error("Failed to send notification email");
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";

    // Rate limiting: 3 requests per 30 minutes per IP
    const rateLimit = checkRateLimit(`intl-join:${ip}`, 3, 30 * 60 * 1000);
    
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

    // Send notification email
    await sendNotificationEmail(data);

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
