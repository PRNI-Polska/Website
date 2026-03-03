"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { createMeeting, type CreatedMeeting } from "@/lib/calls/api";
import { useCallsLang } from "@/lib/calls/LangContext";
import { LangSwitcher } from "@/components/calls/LangSwitcher";

export default function CallsAdminPage() {
  const { t } = useCallsLang();
  const [adminSecret, setAdminSecret] = useState("");
  const [title, setTitle] = useState("Spotkanie PRNI");
  const [duration, setDuration] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedMeeting | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [keyLoaded, setKeyLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageKey = params.get("key");
    if (!pageKey) return;
    const apiBase = process.env.NEXT_PUBLIC_CALLS_API_URL ?? "/api";
    fetch(`${apiBase}/admin/bootstrap?key=${pageKey}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.adminSecret) { setAdminSecret(data.adminSecret); setKeyLoaded(true); } })
      .catch(() => {});
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!adminSecret) return;
    setLoading(true); setError(null); setResult(null);
    try { setResult(await createMeeting(adminSecret, title, duration)); }
    catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  }, [adminSecret, title, duration]);

  const copy = (val: string, field: string) => { navigator.clipboard.writeText(val); setCopied(field); setTimeout(() => setCopied(null), 2000); };

  const copyAll = () => {
    if (!result) return;
    const text = `${result.meeting.title}\n\n${t("roomCodeLabel")}: ${result.meeting.roomCode}\n${t("passwordLabel")}: ${result.password}\n\n${t("speakerPinLabel")}: ${result.speakerPin}\n${t("adminPinLabel")}: ${result.adminPin}`;
    navigator.clipboard.writeText(text); setCopied("all"); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="PRNI" className="w-10 h-10" />
            <div>
              <p className="text-xs text-neutral-600">{t("adminPagePanel")}</p>
              <h1 className="text-lg font-semibold tracking-wide font-[var(--font-heading)]">{t("adminPageTitle")}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            <a href="/calls" className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors border border-[#252525] px-3 py-1.5 rounded hover:border-neutral-500">{t("back")}</a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-6 space-y-5 mb-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-400">{t("apiKey")}</label>
              {keyLoaded && <span className="text-xs text-emerald-600">{t("autoLoaded")}</span>}
            </div>
            <input type={keyLoaded?"password":"text"} value={adminSecret} onChange={(e)=>setAdminSecret(e.target.value)}
              placeholder={t("pasteApiKey")}
              className="w-full px-4 py-3 bg-[#090909] border border-[#1a1a1a] rounded text-white font-[var(--font-mono)] text-xs focus:outline-none focus:border-neutral-600 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">{t("meetingName")}</label>
              <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#090909] border border-[#1a1a1a] rounded text-white text-sm focus:outline-none focus:border-neutral-600 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">{t("durationMin")}</label>
              <input type="number" min={5} max={1440} value={duration} onChange={(e)=>setDuration(parseInt(e.target.value)||60)}
                className="w-full px-4 py-3 bg-[#090909] border border-[#1a1a1a] rounded text-white text-sm focus:outline-none focus:border-neutral-600 transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={loading||!adminSecret}
            className="w-full py-3.5 bg-white text-black rounded font-semibold text-sm hover:bg-neutral-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
            {loading?t("creating"):t("createMeeting")}
          </button>
        </form>

        {error && <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 rounded text-red-400 text-sm">{error}</div>}

        {result && (
          <div className="calls-animate-fade-up space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold font-[var(--font-heading)]">{result.meeting.title}</h2>
              <button onClick={copyAll}
                className={`text-sm px-4 py-2 rounded font-medium transition-all ${copied==="all"?"bg-emerald-900/30 text-emerald-400 border border-emerald-800/40":"bg-[#151515] border border-[#252525] text-neutral-400 hover:bg-white hover:text-black"}`}>
                {copied==="all"?t("copiedAll"):t("copyAll")}
              </button>
            </div>
            {([
              { label: t("roomCodeLabel"), sub: t("forEveryone"), value: result.meeting.roomCode, key: "room", big: true },
              { label: t("passwordLabel"), sub: t("requiredFromAll"), value: result.password, key: "pw", big: true },
              { label: t("speakerPinLabel"), sub: t("speakersOnly"), value: result.speakerPin, key: "pin", big: false },
              { label: t("adminPinLabel"), sub: t("hostOnly"), value: result.adminPin, key: "admin", big: false },
            ] as const).map((c) => (
              <div key={c.key} className="group bg-[#0c0c0c] border border-[#1a1a1a] rounded-lg hover:border-[#333] transition-colors">
                <div className="flex items-center justify-between p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-neutral-500 font-medium">{c.label}</span>
                      <span className="text-xs text-neutral-700">{c.sub}</span>
                    </div>
                    <p className={`font-[var(--font-mono)] font-bold tracking-widest text-white ${c.big?"text-xl":"text-lg"}`}>{c.value}</p>
                  </div>
                  <button onClick={()=>copy(c.value,c.key)}
                    className={`shrink-0 ml-4 text-sm px-4 py-2 rounded font-medium transition-all ${copied===c.key?"text-emerald-400":"bg-[#151515] border border-[#222] text-neutral-500 hover:bg-white hover:text-black hover:border-white"}`}>
                    {copied===c.key?t("copied"):t("copy")}
                  </button>
                </div>
              </div>
            ))}
            <p className="text-sm text-neutral-700 pt-2">{t("dataShownOnce")}</p>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-[#141414] flex items-center justify-between">
          <p className="text-sm text-neutral-800 italic font-[var(--font-heading)]">&ldquo;{t("slogan")}&rdquo;</p>
          <p className="text-xs text-neutral-800">PRNI</p>
        </div>
      </div>
    </main>
  );
}
