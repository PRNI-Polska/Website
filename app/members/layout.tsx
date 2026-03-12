"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Loader2, Hash, MessageCircle, FileText, Newspaper, Bell, BellOff } from "lucide-react";
import { MemberLangProvider, useMemberLang } from "@/lib/members/LangContext";
import type { MemberLang } from "@/lib/members/i18n";

interface MemberInfo {
  id: string;
  displayName: string;
  email: string;
  role: string;
}

const PUBLIC_PATHS = ["/members/login", "/members/register"];

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublicPath) {
      setChecking(false);
      return;
    }

    async function checkSession() {
      try {
        const res = await fetch("/api/members/me");
        if (res.ok) {
          const data = await res.json();
          setMember(data.member);
        } else {
          router.replace("/members/login");
          return;
        }
      } catch {
        router.replace("/members/login");
        return;
      } finally {
        setChecking(false);
      }
    }

    checkSession();
  }, [isPublicPath, pathname, router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/members/auth/logout", { method: "POST" });
      router.replace("/members/login");
    } catch {
      setLoggingOut(false);
    }
  }

  if (isPublicPath) {
    return <MemberLangProvider>{children}</MemberLangProvider>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  return (
    <MemberLangProvider>
    <MembersLayoutInner member={member} loggingOut={loggingOut} handleLogout={handleLogout} pathname={pathname}>{children}</MembersLayoutInner>
    </MemberLangProvider>
  );
}

function MembersLayoutInner({ member, loggingOut, handleLogout, pathname, children }: { member: MemberInfo | null; loggingOut: boolean; handleLogout: () => void; pathname: string; children: React.ReactNode }) {
  const { t, lang, setLang } = useMemberLang();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setPushEnabled(!!sub);
    }).catch(() => {});
  }, []);

  async function togglePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (pushEnabled) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) { await sub.unsubscribe(); await fetch("/api/members/push/subscribe", { method: "DELETE" }); }
        setPushEnabled(false);
      } else {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        });
        await fetch("/api/members/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        });
        setPushEnabled(true);
      }
    } catch { /* ignore */ }
    finally { setPushLoading(false); }
  }

  return (
    <div className="h-screen flex flex-col bg-[#090909] text-[#e8e8e8]" style={{ height: "100dvh" }}>
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      <meta name="googlebot" content="noindex, nofollow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, interactive-widget=resizes-content" />
      <header className="border-b border-[#1a1a1a] bg-[#090909] shrink-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-12 sm:h-14">
          <div className="flex items-center gap-6">
            <Link href="/members" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="PRNI" className="w-7 h-7 opacity-80" />
              <span className="font-semibold text-sm tracking-wide hidden sm:inline">PRNI</span>
            </Link>
            <nav className="flex items-center gap-1">
              {[
                { href: "/members", icon: Newspaper, label: t("nav.news"), exact: true },
                { href: "/members/channels", icon: Hash, label: t("nav.channels") },
                { href: "/members/messages", icon: MessageCircle, label: t("nav.messages") },
                { href: "/members/documents", icon: FileText, label: t("nav.documents") },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                    (item as {exact?:boolean}).exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href))
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#666] hover:text-[#e8e8e8] hover:bg-[#111]"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          {member && (
            <div className="flex items-center gap-4">
              <button onClick={togglePush} disabled={pushLoading} title={pushEnabled ? "Disable notifications" : "Enable notifications"}
                className={`p-1.5 rounded-lg transition mr-1 ${pushEnabled ? "text-[#e8e8e8] hover:bg-[#1a1a1a]" : "text-[#444] hover:text-[#888] hover:bg-[#1a1a1a]"}`}>
                {pushLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : pushEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </button>
              <div className="flex items-center gap-0 border border-[#1a1a1a] rounded overflow-hidden mr-2">
                {(["pl", "en", "de"] as MemberLang[]).map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`px-2 py-1 text-[10px] font-semibold transition-all ${lang === l ? "bg-white text-black" : "text-[#555] hover:text-white hover:bg-[#151515]"}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <Link href="/members/profile" className="text-sm text-[#888] hover:text-white hidden sm:inline transition">
                {member.displayName}
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#e8e8e8] transition disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav.logout")}</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className={`flex-1 overflow-hidden ${pathname.startsWith("/members/channels") || pathname.startsWith("/members/messages") ? "" : "overflow-y-auto"}`}>
        <div className={pathname.startsWith("/members/channels") || pathname.startsWith("/members/messages") ? "h-full" : "max-w-4xl mx-auto px-6 py-8"}>
          {children}
        </div>
      </main>
    </div>
  );
}
