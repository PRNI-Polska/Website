import { NextRequest, NextResponse } from "next/server";
import { recruitmentFormSchema } from "@/lib/validations";
import { checkRateLimit, validateHoneypot } from "@/lib/utils";

async function sendEmail(data: { name: string; email: string; location?: string; message: string }) {
  // If no API key configured, just log
  if (!process.env.RESEND_API_KEY) {
    console.log("Recruitment submission (no email configured):", {
      from: `${data.name} <${data.email}>`,
      location: data.location || "",
      message: data.message,
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
      text: `New recruitment interest:\n\nName: ${data.name}\nEmail: ${data.email}\nLocation: ${data.location || "Not provided"}\n\nMessage:\n${data.message}\n\n---\nSubmitted: ${new Date().toISOString()}`,
      html: `
        <h2>New recruitment interest</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Location:</strong> ${data.location ? data.location : "<em>Not provided</em>"}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="color:#666;font-size:12px;">Submitted: ${new Date().toISOString()}</p>
      `,
    });

    if (error) {
      console.error("Failed to send recruitment email:", error);
      throw new Error("Failed to send email");
    }
  } catch (emailError) {
    console.error("Recruitment email sending failed:", emailError);
    // Don't throw: still allow the form to succeed
    console.log("Recruitment submission (email exception):", {
      from: `${data.name} <${data.email}>`,
      location: data.location || "",
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

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
      console.log("Recruitment honeypot triggered, rejecting submission from:", email);
      return NextResponse.json({ success: true });
    }

    await sendEmail({ name, email, location, message });

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

