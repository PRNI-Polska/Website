// file: app/api/auth/2fa/route.ts
// Two-factor authentication API
// POST with action "request" - validates password, sends 6-digit code to email
// POST with action "verify" - verifies the code, marks challenge as verified

import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

// Generate a 6-digit code
function generateCode(): string {
  const num = parseInt(randomBytes(4).toString("hex"), 16) % 1000000;
  return num.toString().padStart(6, "0");
}

// Generate a challenge token
function generateChallengeToken(): string {
  return randomBytes(32).toString("hex");
}

async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[2FA] Code for ${email}: ${code} (no email configured)`);
    return true;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "PRNI Security <noreply@prni.org.pl>",
      to: process.env.CONTACT_EMAIL || email,
      subject: `[PRNI] Your login verification code: ${code}`,
      text: `Your verification code is: ${code}\n\nThis code expires in 5 minutes.\n\nIf you did not request this, someone may be trying to access your account.`,
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; text-align: center;">
          <div style="background: #18181b; color: white; padding: 24px; border-radius: 12px;">
            <h2 style="margin: 0 0 8px;">Login Verification</h2>
            <p style="margin: 0 0 24px; opacity: 0.7; font-size: 14px;">Enter this code to complete your login</p>
            <div style="background: #27272a; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">${code}</span>
            </div>
            <p style="margin: 0; font-size: 13px; opacity: 0.5;">Expires in 5 minutes</p>
          </div>
          <p style="margin-top: 16px; font-size: 12px; color: #666;">
            If you didn't request this code, someone may be trying to access your account.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[2FA] Email send error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[2FA] Email send failed:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // ========================================
    // ACTION: REQUEST - Validate password & send code
    // ========================================
    if (action === "request") {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: "Email and password required" }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        // Generic error to prevent user enumeration
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // Verify password
      const isValid = await compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // Check admin role
      if (user.role !== "ADMIN") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // Generate code and challenge token
      const code = generateCode();
      const challengeToken = generateChallengeToken();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Clean up old codes for this email
      await prisma.twoFactorCode.deleteMany({
        where: { email: normalizedEmail },
      });

      // Store in database
      await prisma.twoFactorCode.create({
        data: {
          email: normalizedEmail,
          code,
          challengeToken,
          expiresAt,
        },
      });

      // Send email
      const sent = await sendVerificationEmail(normalizedEmail, code);
      if (!sent) {
        return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
      }

      console.log(`[2FA] Code sent to ${normalizedEmail}`);

      return NextResponse.json({
        success: true,
        challengeToken,
        message: "Verification code sent to your email",
      });
    }

    // ========================================
    // ACTION: VERIFY - Check the code
    // ========================================
    if (action === "verify") {
      const { challengeToken, code } = body;

      if (!challengeToken || !code) {
        return NextResponse.json({ error: "Challenge token and code required" }, { status: 400 });
      }

      // Find the pending 2FA challenge
      const challenge = await prisma.twoFactorCode.findUnique({
        where: { challengeToken },
      });

      if (!challenge) {
        return NextResponse.json({ error: "Invalid or expired verification" }, { status: 401 });
      }

      // Check expiry
      if (new Date() > challenge.expiresAt) {
        await prisma.twoFactorCode.delete({ where: { id: challenge.id } });
        return NextResponse.json({ error: "Code expired. Please try again." }, { status: 401 });
      }

      // Check if already used
      if (challenge.used) {
        return NextResponse.json({ error: "Code already used" }, { status: 401 });
      }

      // Verify code (constant-time comparison isn't critical here but good practice)
      const codeMatch = challenge.code === code.trim();
      if (!codeMatch) {
        return NextResponse.json({ error: "Invalid code" }, { status: 401 });
      }

      // Mark as verified
      await prisma.twoFactorCode.update({
        where: { id: challenge.id },
        data: { verified: true },
      });

      console.log(`[2FA] Code verified for ${challenge.email}`);

      return NextResponse.json({
        success: true,
        message: "Code verified",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[2FA] Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
