// file: app/api/admin/change-password/route.ts
// Admin password change endpoint.
//
// SECURITY:
//  - Requires valid admin session
//  - Verifies current password before accepting the new one
//  - Enforces strong password policy (12+ chars, mixed case, number, symbol)
//  - Revokes all existing sessions after password change
//  - Logs the event to the audit trail

import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revokeAllSessions } from "@/lib/auth";
import { passwordChangeSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const parsed = passwordChangeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          ...(process.env.NODE_ENV !== "production" && { details: parsed.error.flatten() }),
        },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Fetch the current password hash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isValid = await compare(currentPassword, dbUser.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    // Prevent reusing the same password
    const isSame = await compare(newPassword, dbUser.passwordHash);
    if (isSame) {
      return NextResponse.json(
        { error: "New password must be different from the current password" },
        { status: 400 },
      );
    }

    // Hash and save the new password (bcrypt with 12 rounds)
    const newHash = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "PASSWORD_CHANGE",
        entityType: "User",
        entityId: user.id,
        userId: user.id,
        details: JSON.stringify({
          timestamp: new Date().toISOString(),
          note: "Password changed by admin",
        }),
      },
    });

    // Revoke all existing sessions so the new password takes effect
    const revoked = await revokeAllSessions();

    console.log(
      `[AUTH] Password changed for ${user.email}. Sessions revoked: ${revoked}`,
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully. All sessions have been revoked — you will need to log in again.",
      sessionsRevoked: revoked,
    });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      {
        error: "Failed to change password",
        ...(error instanceof Error && error.message.includes("Unauthorized")
          ? { status: 401 }
          : {}),
      },
      {
        status:
          error instanceof Error && error.message.includes("Unauthorized")
            ? 401
            : 500,
      },
    );
  }
}
