"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageCircle } from "lucide-react";
import { useMemberLang } from "@/lib/members/LangContext";

interface PublicProfile {
  id: string;
  displayName: string;
  bio: string | null;
  photoUrl: string | null;
  role: string;
  createdAt: string;
}

export default function MemberProfilePage() {
  const { t } = useMemberLang();
  const { memberId } = useParams<{ memberId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: t("role.ADMIN"),
    LEADERSHIP: t("role.LEADERSHIP"),
    MAIN_WING: t("role.MAIN_WING"),
    INTERNATIONAL: t("role.INTERNATIONAL"),
    FEMALE_WING: t("role.FEMALE_WING"),
    MEMBER: t("role.MEMBER"),
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/members/profile/${memberId}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        setProfile(data.profile);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    if (memberId) fetchProfile();
  }, [memberId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="text-center py-20">
        <p className="text-[#666] text-sm">Member not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="flex items-center gap-5">
        {profile.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.photoUrl} alt={profile.displayName} className="w-20 h-20 rounded-full object-cover border border-[#1a1a1a]" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#252525] flex items-center justify-center text-2xl font-semibold text-[#888]">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e8e8e8]">{profile.displayName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] uppercase tracking-wider font-medium text-blue-400/70 bg-blue-400/10 px-2 py-0.5 rounded">
              {ROLE_LABELS[profile.role] || profile.role}
            </span>
          </div>
          <p className="text-xs text-[#555] mt-1.5">
            {t("profile.memberSince")} {new Date(profile.createdAt).toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {profile.bio && (
        <div className="border border-[#1a1a1a] rounded-xl p-5 bg-[#0c0c0c]">
          <h2 className="text-sm font-medium text-[#888] mb-2">{t("profile.bio")}</h2>
          <p className="text-sm text-[#ccc] whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
        </div>
      )}

      <Link
        href="/members/messages"
        className="inline-flex items-center gap-2 bg-[#151515] border border-[#1a1a1a] hover:border-[#333] text-[#e8e8e8] px-5 py-2.5 rounded-lg text-sm font-medium transition"
      >
        <MessageCircle className="h-4 w-4" />
        {t("profile.sendMessage")}
      </Link>
    </div>
  );
}
