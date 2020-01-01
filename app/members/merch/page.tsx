"use client";

import { ShoppingBag } from "lucide-react";
import { useMemberLang } from "@/lib/members/LangContext";

export default function MembersMerchPage() {
  const { t } = useMemberLang();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold mb-2">{t("merch.title")}</h1>
      <p className="text-[#888] text-sm mb-8">{t("merch.subtitle")}</p>

      <div className="border border-[#1a1a1a] rounded-lg p-8 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-[#444] mb-4" />
        <span className="inline-block px-3 py-1 bg-[#1a1a1a] text-[#888] text-xs rounded-full mb-3">
          {t("merch.comingSoon")}
        </span>
        <p className="text-[#666] text-sm max-w-md mx-auto">
          {t("merch.comingSoonDesc")}
        </p>
      </div>
    </div>
  );
}
