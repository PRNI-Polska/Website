"use client";

import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { useMemberLang } from "@/lib/members/LangContext";

interface Profile {
  id: string;
  displayName: string;
  bio: string | null;
  photoUrl: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { t } = useMemberLang();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

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
        const res = await fetch("/api/members/profile");
        if (!res.ok) return;
        const data = await res.json();
        setProfile(data.profile);
        setDisplayName(data.profile.displayName);
        setBio(data.profile.bio || "");
        setPhotoUrl(data.profile.photoUrl || "");
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    fetchProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/members/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim() || null,
          photoUrl: photoUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("common.error"));
        return;
      }

      const data = await res.json();
      setProfile(data.profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="text-[#555] text-sm mt-1">
          {ROLE_LABELS[profile.role] || profile.role} · {t("profile.memberSince")} {new Date(profile.createdAt).toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={displayName} className="w-16 h-16 rounded-full object-cover border border-[#1a1a1a]" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#252525] flex items-center justify-center text-xl font-semibold text-[#888]">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-[#e8e8e8]">{profile.displayName}</p>
          <p className="text-xs text-[#555]">{profile.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#888] mb-1.5">{t("profile.name")}</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-sm text-[#e8e8e8] placeholder-[#444] outline-none focus:border-[#333] transition"
            minLength={2}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#888] mb-1.5">{t("profile.bio")}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            placeholder={t("profile.bioPlaceholder")}
            rows={4}
            className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-sm text-[#e8e8e8] placeholder-[#444] outline-none focus:border-[#333] transition resize-none"
          />
          <p className="text-[10px] text-[#444] mt-1 text-right">{bio.length}/500</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#888] mb-1.5">{t("profile.photo")}</label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-sm text-[#e8e8e8] placeholder-[#444] outline-none focus:border-[#333] transition"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#e0e0e0] transition disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              {t("profile.saved")}
            </>
          ) : (
            t("profile.save")
          )}
        </button>
      </form>
    </div>
  );
}
