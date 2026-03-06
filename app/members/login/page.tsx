"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMemberLang } from "@/lib/members/LangContext";

export default function MemberLoginPage() {
  const router = useRouter();
  const { t } = useMemberLang();
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
      if (!res.ok) { setError(data.error || t("login.error")); return; }
      router.push("/members");
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="PRNI" className="w-20 h-20 mx-auto mb-5 opacity-90" />
          <h1 className="text-xl font-bold text-[#e8e8e8] tracking-wide font-[var(--font-heading)]">
            {t("login.title")}
          </h1>
          <p className="text-[#555] text-xs mt-2 tracking-wider uppercase">
            {t("login.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/15 text-red-400 text-sm rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-medium text-[#888] block uppercase tracking-wider">{t("login.email")}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[#080808] border border-[#1a1a1a] rounded-xl px-4 py-3 text-[#e8e8e8] text-sm placeholder-[#333] focus:outline-none focus:border-[#333] transition"
              placeholder="twoj@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-medium text-[#888] block uppercase tracking-wider">{t("login.password")}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-[#080808] border border-[#1a1a1a] rounded-xl px-4 py-3 text-[#e8e8e8] text-sm placeholder-[#333] focus:outline-none focus:border-[#333] transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold text-sm rounded-xl px-4 py-3 hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t("login.loading") : t("login.submit")}
          </button>
        </form>

        <p className="text-center text-[#444] text-xs mt-8">
          {t("login.noAccount")}{" "}
          <Link href="/members/register" className="text-[#888] hover:text-white transition">
            {t("login.register")}
          </Link>
        </p>

        <div className="text-center mt-6">
          <a href="/" className="text-[10px] text-[#333] hover:text-[#666] transition tracking-wider uppercase">prni.org.pl</a>
        </div>
      </div>
    </div>
  );
}
