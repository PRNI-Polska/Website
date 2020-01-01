"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, UserPlus, Check, X } from "lucide-react";

export default function MemberRegisterPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const strengthLabel =
    passwordStrength <= 1
      ? "Weak"
      : passwordStrength <= 2
        ? "Fair"
        : passwordStrength <= 3
          ? "Good"
          : "Strong";

  const strengthColor =
    passwordStrength <= 1
      ? "bg-red-500"
      : passwordStrength <= 2
        ? "bg-orange-500"
        : passwordStrength <= 3
          ? "bg-yellow-500"
          : "bg-green-500";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordChecks.length) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/members/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode, email, password, displayName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 mb-4">
            <Check className="h-7 w-7 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-[#e8e8e8] mb-2">
            Account Created
          </h1>
          <p className="text-[#888] text-sm mb-6">
            Your account has been created successfully. Please sign in.
          </p>
          <Link
            href="/members/login"
            className="inline-block bg-white text-black font-medium text-sm rounded-lg px-6 py-2.5 hover:bg-white/90 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-4">
            <UserPlus className="h-7 w-7 text-[#e8e8e8]" />
          </div>
          <h1 className="text-2xl font-bold text-[#e8e8e8] tracking-tight">
            Register
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Create your account with an invite code
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="inviteCode"
              className="text-sm font-medium text-[#ccc] block"
            >
              Invite Code
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 text-[#e8e8e8] text-sm placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition font-mono tracking-widest"
              placeholder="XXXXXXXX"
              maxLength={8}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="displayName"
              className="text-sm font-medium text-[#ccc] block"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 text-[#e8e8e8] text-sm placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="reg-email"
              className="text-sm font-medium text-[#ccc] block"
            >
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 text-[#e8e8e8] text-sm placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="reg-password"
              className="text-sm font-medium text-[#ccc] block"
            >
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 text-[#e8e8e8] text-sm placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
              placeholder="Min. 8 characters"
            />
            {password.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= passwordStrength ? strengthColor : "bg-[#222]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#666]">{strengthLabel}</p>
                <div className="space-y-1">
                  {[
                    { key: "length", label: "At least 8 characters" },
                    { key: "hasUpper", label: "One uppercase letter" },
                    { key: "hasLower", label: "One lowercase letter" },
                    { key: "hasNumber", label: "One number" },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 text-xs"
                    >
                      {passwordChecks[
                        key as keyof typeof passwordChecks
                      ] ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <X className="h-3 w-3 text-[#555]" />
                      )}
                      <span
                        className={
                          passwordChecks[
                            key as keyof typeof passwordChecks
                          ]
                            ? "text-[#888]"
                            : "text-[#555]"
                        }
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-[#ccc] block"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 text-[#e8e8e8] text-sm placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
              placeholder="Repeat password"
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium text-sm rounded-lg px-4 py-2.5 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[#555] text-sm mt-6">
          Already have an account?{" "}
          <Link
            href="/members/login"
            className="text-[#aaa] hover:text-white transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
