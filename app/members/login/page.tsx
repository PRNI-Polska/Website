"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function MemberLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/members/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/members");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090909] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-4">
            <Lock className="h-7 w-7 text-[#e8e8e8]" />
          </div>
          <h1 className="text-2xl font-bold text-[#e8e8e8] tracking-tight">
            Members Area
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Sign in to access private content
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
              htmlFor="email"
              className="text-sm font-medium text-[#ccc] block"
            >
              Email
            </label>
            <input
              id="email"
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
              htmlFor="password"
              className="text-sm font-medium text-[#ccc] block"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 text-[#e8e8e8] text-sm placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium text-sm rounded-lg px-4 py-2.5 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-[#555] text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/members/register"
            className="text-[#aaa] hover:text-white transition"
          >
            Register with invite code
          </Link>
        </p>
      </div>
    </div>
  );
}
