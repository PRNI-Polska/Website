"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Check, X } from "lucide-react";
import { useMemberLang } from "@/lib/members/LangContext";
import type { MemberLang } from "@/lib/members/i18n";

export default function MemberRegisterPage() {
  const { t, lang, setLang } = useMemberLang();
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
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
  const strengthLabel = passwordStrength <= 1 ? t("register.weak") : passwordStrength <= 2 ? t("register.fair") : passwordStrength <= 3 ? t("register.good") : t("register.strong");
  const strengthColor = passwordStrength <= 1 ? "bg-red-500" : passwordStrength <= 2 ? "bg-orange-500" : passwordStrength <= 3 ? "bg-yellow-500" : "bg-green-500";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError(t("register.passwordMismatch")); return; }
    if (!passwordChecks.length) { setError(t("register.minChars")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/members/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode, email, password, displayName, fullName, location }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t("register.error")); return; }
      setSuccess(true);
    } catch { setError(t("register.genericError")); }
    finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="PRNI" className="w-16 h-16 mx-auto mb-5 opacity-80" />
          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-7 w-7 text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-[#e8e8e8] mb-2 font-[var(--font-heading)]">{t("register.success")}</h1>
          <p className="text-[#666] text-sm mb-6">{t("register.successMsg")}</p>
          <Link href="/members/login" className="inline-block bg-white text-black font-semibold text-sm rounded-xl px-6 py-3 hover:bg-white/90 transition">
            {t("register.goToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-[#080808] border border-[#1a1a1a] rounded-xl px-4 py-3 text-[#e8e8e8] text-sm placeholder-[#333] focus:outline-none focus:border-[#333] transition";

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-0 border border-[#1a1a1a] rounded overflow-hidden">
            {(["pl", "en", "de"] as MemberLang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${lang === l ? "bg-white text-black" : "text-[#555] hover:text-white hover:bg-[#151515]"}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="PRNI" className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-xl font-bold text-[#e8e8e8] tracking-wide font-[var(--font-heading)]">{t("register.title")}</h1>
          <p className="text-[#555] text-xs mt-2">{t("register.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/15 text-red-400 text-sm rounded-xl px-4 py-3 text-center">{error}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="inviteCode" className="text-xs font-medium text-[#888] block uppercase tracking-wider">{t("register.inviteCode")}</label>
            <input id="inviteCode" type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} required
              className={`${inputClass} font-mono tracking-[0.3em] text-center`} placeholder="XXXXXXXX" maxLength={20} />
          </div>

          <div className="space-y-2">
            <label htmlFor="displayName" className="text-xs font-medium text-[#888] block uppercase tracking-wider">{t("register.displayName")}</label>
            <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className={inputClass} placeholder={t("register.yourName")} />
          </div>

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-xs font-medium text-[#888] block uppercase tracking-wider">{t("register.fullName")}</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} placeholder={t("register.fullNamePlaceholder")} />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-xs font-medium text-[#888] block uppercase tracking-wider">{t("register.location")}</label>
            <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className={inputClass} placeholder={t("register.locationPlaceholder")} />
          </div>

          <div className="space-y-2">
            <label htmlFor="reg-email" className="text-xs font-medium text-[#888] block uppercase tracking-wider">{t("register.email")}</label>
            <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={inputClass} placeholder={t("register.yourEmail")} />
          </div>

          <div className="space-y-2">
            <label htmlFor="reg-password" className="text-xs font-medium text-[#888] block uppercase tracking-wider">{t("register.password")}</label>
            <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" className={inputClass} placeholder={t("register.minChars")} />
            {password.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColor : "bg-[#1a1a1a]"}`} />
                  ))}
                </div>
                <p className="text-[10px] text-[#555]">{strengthLabel}</p>
                <div className="space-y-1">
                  {[
                    { key: "length", label: t("register.minChars") },
                    { key: "hasUpper", label: t("register.uppercase") },
                    { key: "hasLower", label: t("register.lowercase") },
                    { key: "hasNumber", label: t("register.number") },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2 text-[11px]">
                      {passwordChecks[key as keyof typeof passwordChecks] ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <X className="h-3 w-3 text-[#333]" />
                      )}
                      <span className={passwordChecks[key as keyof typeof passwordChecks] ? "text-[#888]" : "text-[#444]"}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-xs font-medium text-[#888] block uppercase tracking-wider">{t("register.confirmPassword")}</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className={inputClass} placeholder={t("register.repeatPassword")} />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-[11px] text-red-400">{t("register.passwordMismatch")}</p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-white text-black font-semibold text-sm rounded-xl px-4 py-3 hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t("register.loading") : t("register.submit")}
          </button>
        </form>

        <p className="text-center text-[#444] text-xs mt-8">
          {t("register.hasAccount")}{" "}
          <Link href="/members/login" className="text-[#888] hover:text-white transition">{t("register.login")}</Link>
        </p>
      </div>
    </div>
  );
}
