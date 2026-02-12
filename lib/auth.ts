// file: lib/auth.ts
// SECURITY-HARDENED AUTH FOR POLITICAL WEBSITE
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { loginSchema } from "./validations";
import { trackLoginFailure } from "./security-alerts";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    };
  }
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  }
}

// ============================================
// STRICT RATE LIMITING FOR LOGIN ATTEMPTS
// ============================================
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blocked: boolean;
  blockExpiry: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes base lockout
const PROGRESSIVE_LOCKOUT = true; // Doubles each time: 5min → 10min → 20min → 30min (capped)

function checkLoginRateLimit(email: string): { allowed: boolean; remainingAttempts: number; lockoutRemaining?: number } {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase();
  const record = loginAttempts.get(normalizedEmail);

  if (!record) {
    loginAttempts.set(normalizedEmail, { 
      count: 1, 
      lastAttempt: now, 
      blocked: false, 
      blockExpiry: 0 
    });
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
  }

  // Check if currently blocked
  if (record.blocked && now < record.blockExpiry) {
    const lockoutRemaining = Math.ceil((record.blockExpiry - now) / 1000 / 60);
    return { allowed: false, remainingAttempts: 0, lockoutRemaining };
  }

  // Reset if block has expired
  if (record.blocked && now >= record.blockExpiry) {
    record.blocked = false;
    record.count = 1;
    record.lastAttempt = now;
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
  }

  // Reset if enough time has passed (1 hour)
  if (now - record.lastAttempt > 60 * 60 * 1000) {
    record.count = 1;
    record.lastAttempt = now;
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
  }

  // Check if exceeded attempts
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    // Apply progressive lockout: 5min → 10min → 20min → 30min (capped)
    const lockoutMultiplier = PROGRESSIVE_LOCKOUT ? Math.pow(2, Math.min(record.count - MAX_LOGIN_ATTEMPTS, 3)) : 1;
    const lockoutMs = Math.min(LOCKOUT_DURATION * lockoutMultiplier, 30 * 60 * 1000);
    record.blocked = true;
    record.blockExpiry = now + lockoutMs;
    const lockoutRemaining = Math.ceil((record.blockExpiry - now) / 1000 / 60);
    
    logSecurityEvent("LOGIN_LOCKOUT", { 
      email: normalizedEmail, 
      attempts: record.count,
      lockoutMinutes: lockoutRemaining 
    });
    
    return { allowed: false, remainingAttempts: 0, lockoutRemaining };
  }

  record.count++;
  record.lastAttempt = now;
  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - record.count };
}

function resetLoginAttempts(email: string): void {
  loginAttempts.delete(email.toLowerCase());
}

function recordFailedLogin(email: string): void {
  const normalizedEmail = email.toLowerCase();
  const record = loginAttempts.get(normalizedEmail);
  if (record) {
    record.count++;
    record.lastAttempt = Date.now();
  }
}

// ============================================
// SECURITY LOGGING
// ============================================
function logSecurityEvent(type: string, details: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    type: `AUTH:${type}`,
    timestamp,
    ...details,
  }));
}

// ============================================
// AUDIT LOGGING TO DATABASE
// ============================================
async function logAuthAudit(
  action: string,
  email: string,
  success: boolean,
  details?: string
): Promise<void> {
  try {
    // Find user to get ID (might not exist for failed logins)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (user) {
      await prisma.auditLog.create({
        data: {
          action: `AUTH_${action}`,
          entityType: "User",
          entityId: user.id,
          userId: user.id,
          details: JSON.stringify({
            success,
            email,
            details,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    }
  } catch (error) {
    // Don't fail auth if audit logging fails
    console.error("Failed to log auth audit:", error);
  }
}

// ============================================
// AUTH OPTIONS
// ============================================
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            logSecurityEvent("INVALID_CREDENTIALS_FORMAT", { 
              errors: parsed.error.flatten() 
            });
            throw new Error("Invalid credentials format");
          }

          const { email, password } = parsed.data;
          const normalizedEmail = email.toLowerCase();

          // Check if this is a 2FA challenge token login
          // (password field contains the challengeToken after 2FA verification)
          const challengeToken = (credentials as Record<string, string>)?.challengeToken;
          
          if (challengeToken) {
            // Verify the 2FA challenge token
            const challenge = await prisma.twoFactorCode.findUnique({
              where: { challengeToken },
            });

            if (!challenge || !challenge.verified || challenge.used || new Date() > challenge.expiresAt) {
              throw new Error("Invalid or expired verification. Please log in again.");
            }

            if (challenge.email !== normalizedEmail) {
              throw new Error("Invalid verification");
            }

            // Mark as used
            await prisma.twoFactorCode.update({
              where: { id: challenge.id },
              data: { used: true },
            });

            // Find the user
            const user = await prisma.user.findUnique({
              where: { email: normalizedEmail },
            });

            if (!user || user.role !== "ADMIN") {
              throw new Error("Access denied");
            }

            // Success via 2FA
            resetLoginAttempts(normalizedEmail);
            logSecurityEvent("LOGIN_SUCCESS_2FA", { email: normalizedEmail, userId: user.id });
            await logAuthAudit("LOGIN_SUCCESS", normalizedEmail, true, "2FA verified");

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }

          // Regular password login (should not be used directly anymore,
          // but kept as fallback)
          const rateLimit = checkLoginRateLimit(normalizedEmail);
          if (!rateLimit.allowed) {
            logSecurityEvent("LOGIN_RATE_LIMITED", { 
              email: normalizedEmail,
              lockoutRemaining: rateLimit.lockoutRemaining 
            });
            throw new Error(`Account temporarily locked. Try again in ${rateLimit.lockoutRemaining} minutes.`);
          }

          // Find user
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!user) {
            logSecurityEvent("LOGIN_USER_NOT_FOUND", { email: normalizedEmail });
            recordFailedLogin(normalizedEmail);
            trackLoginFailure("unknown", normalizedEmail);
            throw new Error("Invalid email or password");
          }

          // Verify password
          const isValidPassword = await compare(password, user.passwordHash);
          if (!isValidPassword) {
            logSecurityEvent("LOGIN_INVALID_PASSWORD", { 
              email: normalizedEmail,
              remainingAttempts: rateLimit.remainingAttempts - 1 
            });
            recordFailedLogin(normalizedEmail);
            trackLoginFailure("unknown", normalizedEmail);
            await logAuthAudit("LOGIN_FAILED", normalizedEmail, false, "Invalid password");
            throw new Error("Invalid email or password");
          }

          if (user.role !== "ADMIN") {
            logSecurityEvent("LOGIN_NON_ADMIN", { email: normalizedEmail, role: user.role });
            await logAuthAudit("LOGIN_DENIED", normalizedEmail, false, "Non-admin user");
            throw new Error("Access denied");
          }

          // Direct password login without 2FA - block it, require 2FA
          throw new Error("Two-factor authentication required");
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
      };
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes (stricter for political site)
  },
  jwt: {
    maxAge: 30 * 60, // 30 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Additional security options
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },
};

/**
 * Get the current session on the server
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Check if the current user is authenticated as admin
 * Throws an error if not authenticated
 */
export async function requireAdmin() {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error("Unauthorized: Not authenticated");
  }
  
  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  
  return session.user;
}

/**
 * Check if user is authenticated (for route handlers)
 * Returns null if not authenticated instead of throwing
 */
export async function getAuthenticatedUser() {
  const session = await getSession();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  
  return session.user;
}
