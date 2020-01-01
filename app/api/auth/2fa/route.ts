// file: app/api/auth/2fa/route.ts
// Two-factor authentication API (SECURITY HARDENED)
//
// POST with action "request" — validates password, sends 6-digit code to email
// POST with action "verify"  — verifies the code, marks challenge as verified
//
// Security improvements:
//  - 2FA codes are SHA-256 hashed before storage (never plaintext in DB)
//  - Code comparison uses crypto.timingSafeEqual (prevents timing attacks)
//  - Console logging of codes suppressed in production
//  - Expired codes are automatically cleaned up
//  - Code format validated (must be exactly 6 digits)

import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

// ============================================
// CRYPTO HELPERS
// ============================================

/** Generate a cryptographically random 6-digit code. */
function generateCode(): string {
  const num = parseInt(randomBytes(4).toString("hex"), 16) % 1000000;
  return num.toString().padStart(6, "0");
}

/** Generate a challenge token (64-char hex string). */
function generateChallengeToken(): string {
  return randomBytes(32).toString("hex");
}

/** Hash a 2FA code with SHA-256 for safe storage. */
function hashCode(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

/** Timing-safe comparison of a user-supplied code against a stored hash. */
function verifyCodeHash(inputCode: string, storedHash: string): boolean {
  const inputHash = hashCode(inputCode);
  try {
    return timingSafeEqual(
      Buffer.from(inputHash, "utf8"),
      Buffer.from(storedHash, "utf8"),
    );
  } catch {
    // Buffer length mismatch means the stored value isn't a valid SHA-256 hash
    return false;
  }
}

// ============================================
// CLEANUP EXPIRED CODES
// ============================================
async function cleanupExpiredCodes(): Promise<void> {
  try {
    const result = await prisma.twoFactorCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      console.log(`[2FA] Cleaned up ${result.count} expired codes`);
    }
  } catch {
    // Non-critical — don't fail the request
  }
}

// ============================================
// EMAIL SENDING
// ============================================
async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    // SECURITY: Only log codes in development, NEVER in production
    if (process.env.NODE_ENV !== "production") {
      console.log(`[2FA-DEV] Code for ${email}: ${code}`);
    } else {
      console.log(
        `[2FA] Verification code generated for ${email} (no email service configured — code NOT logged)`,
      );
    }
    return true;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // SECURITY: Do NOT include the code in the subject line (visible in notifications/logs)
    const { error } = await resend.emails.send({
      from: "PRNI Security <noreply@prni.org.pl>",
      to: process.env.CONTACT_EMAIL || email,
      subject: `[PRNI] Your login verification code`,
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

// ============================================
// ROUTE HANDLER
// ============================================
export async function POST(request: NextRequest) {
  try {
    // Periodically clean up expired codes (fire-and-forget, non-blocking)
    cleanupExpiredCodes();

    const body = await request.json();
    const { action } = body;

    // ========================================
    // ACTION: REQUEST — Validate password & send code
    // ========================================
    if (action === "request") {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password required" },
          { status: 400 },
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        // Generic error to prevent user enumeration
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 },
        );
      }

      // Verify password
      const isValid = await compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 },
        );
      }

      // Check admin role
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 },
        );
      }

      // Generate code and challenge token
      const code = generateCode();
      const challengeToken = generateChallengeToken();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Clean up old codes for this email
      await prisma.twoFactorCode.deleteMany({
        where: { email: normalizedEmail },
      });

      // Store HASHED code in database (never plaintext)
      await prisma.twoFactorCode.create({
        data: {
          email: normalizedEmail,
          code: hashCode(code),
          challengeToken,
          expiresAt,
        },
      });

      // Send the plaintext code via email (only way the user sees it)
      const sent = await sendVerificationEmail(normalizedEmail, code);
      if (!sent) {
        return NextResponse.json(
          { error: "Failed to send verification code" },
          { status: 500 },
        );
      }

      console.log(`[2FA] Verification initiated for ${normalizedEmail}`);

      return NextResponse.json({
        success: true,
        challengeToken,
        message: "Verification code sent to your email",
      });
    }

    // ========================================
    // ACTION: VERIFY — Check the code
    // ========================================
    if (action === "verify") {
      const { challengeToken, code } = body;

      if (!challengeToken || !code) {
        return NextResponse.json(
          { error: "Challenge token and code required" },
          { status: 400 },
        );
      }

      // Validate code format (must be exactly 6 digits)
      if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
        return NextResponse.json(
          { error: "Invalid code format" },
          { status: 400 },
        );
      }

      // Find the pending 2FA challenge
      const challenge = await prisma.twoFactorCode.findUnique({
        where: { challengeToken },
      });

      if (!challenge) {
        return NextResponse.json(
          { error: "Invalid or expired verification" },
          { status: 401 },
        );
      }

      // Check expiry
      if (new Date() > challenge.expiresAt) {
        await prisma.twoFactorCode.delete({ where: { id: challenge.id } });
        return NextResponse.json(
          { error: "Code expired. Please try again." },
          { status: 401 },
        );
      }

      // Check if already used
      if (challenge.used) {
        return NextResponse.json(
          { error: "Code already used" },
          { status: 401 },
        );
      }

      // Timing-safe comparison against the stored SHA-256 hash
      const codeMatch = verifyCodeHash(code, challenge.code);
      if (!codeMatch) {
        return NextResponse.json(
          { error: "Invalid code" },
          { status: 401 },
        );
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
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 },
    );
  }
}
