import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALL_WINGS = "ADMIN,LEADERSHIP,MAIN_WING,INTERNATIONAL";

const DEFAULT_CHANNELS = [
  { name: "Powitanie", description: "Kanał powitalny dla nowych członków", isDefault: true, allowedRoles: null },
  { name: "Ogólne", description: "Kanał ogólny dla zweryfikowanych członków", isDefault: false, allowedRoles: ALL_WINGS },
  { name: "Zarząd", description: "Kanał zarządu i kadry kierowniczej", isDefault: false, allowedRoles: "ADMIN,LEADERSHIP" },
  { name: "Skrzydło Główne", description: "Kanał dla członków skrzydła głównego", isDefault: false, allowedRoles: "ADMIN,LEADERSHIP,MAIN_WING" },
  { name: "Międzynarodowe", description: "Channel for international wing members", isDefault: false, allowedRoles: "ADMIN,LEADERSHIP,INTERNATIONAL" },
  { name: "Ogłoszenia wewnętrzne", description: "Ważne ogłoszenia dla zweryfikowanych członków", isDefault: false, allowedRoles: ALL_WINGS },
];

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const created = [];
    const updated = [];

    for (const ch of DEFAULT_CHANNELS) {
      const exists = await prisma.memberChannel.findUnique({ where: { name: ch.name } });
      if (!exists) {
        await prisma.memberChannel.create({ data: ch });
        created.push(ch.name);
      } else if (exists.allowedRoles !== ch.allowedRoles || exists.isDefault !== ch.isDefault) {
        await prisma.memberChannel.update({
          where: { name: ch.name },
          data: { allowedRoles: ch.allowedRoles, isDefault: ch.isDefault, description: ch.description },
        });
        updated.push(ch.name);
      }
    }

    return NextResponse.json({
      created,
      updated,
      message: [
        created.length > 0 ? `Created: ${created.join(", ")}` : null,
        updated.length > 0 ? `Updated: ${updated.join(", ")}` : null,
        created.length === 0 && updated.length === 0 ? "All channels up to date" : null,
      ].filter(Boolean).join(". "),
    });
  } catch {
    return NextResponse.json({ error: "Failed to setup channels" }, { status: 500 });
  }
}
