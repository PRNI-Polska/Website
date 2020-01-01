"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Loader2, Shield, Hash, MessageCircle, FileText } from "lucide-react";

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
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#e8e8e8]">
      {/* Prevent indexing of private member area */}
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      <meta name="googlebot" content="noindex, nofollow" />
      <header className="border-b border-[#1a1a1a] bg-[#090909]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-6">
            <Link href="/members" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#888]" />
              <span className="font-semibold text-sm tracking-wide">PRNI</span>
            </Link>
            <nav className="flex items-center gap-1">
              {[
                { href: "/members", icon: FileText, label: "Dokumenty" },
                { href: "/members/channels", icon: Hash, label: "Kanały" },
                { href: "/members/messages", icon: MessageCircle, label: "Wiadomości" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                    pathname === item.href || (item.href !== "/members" && pathname.startsWith(item.href))
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
              <span className="text-sm text-[#888]">
                {member.displayName}
              </span>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#e8e8e8] transition disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className={pathname.startsWith("/members/channels") || pathname.startsWith("/members/messages") ? "" : "max-w-6xl mx-auto px-6 py-8"}>{children}</main>
    </div>
  );
}
