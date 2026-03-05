// file: lib/auth.ts
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { loginSchema } from "./validations";

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

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkLoginRateLimit(email: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const record = loginAttempts.get(email);

  if (!record) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
  }

  // Reset if lockout duration has passed
  if (now - record.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
  }

  // Check if locked out
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    return { allowed: false, remainingAttempts: 0 };
  }

  record.count++;
  record.lastAttempt = now;
  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - record.count };
}

function resetLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}

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
            throw new Error("Invalid credentials format");
          }

          const { email, password } = parsed.data;

          // Check rate limiting
          const rateLimit = checkLoginRateLimit(email);
          if (!rateLimit.allowed) {
            throw new Error("Too many login attempts. Please try again later.");
          }

          // Find user
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Verify password
          const isValidPassword = await compare(password, user.passwordHash);
          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          // Reset rate limit on successful login
          resetLoginAttempts(email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
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
    maxAge: 60 * 60, // 1 hour (security hardening)
  },
  jwt: {
    maxAge: 60 * 60, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
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
