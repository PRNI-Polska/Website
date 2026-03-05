import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

const DEFAULT_CHANNELS = [
  { name: "Ogólne", description: "Kanał ogólny dla wszystkich członków", isDefault: true, allowedRoles: null },
  { name: "Zarząd", description: "Kanał zarządu i kadry kierowniczej", isDefault: false, allowedRoles: "ADMIN,LEADERSHIP" },
  { name: "Skrzydło Główne", description: "Kanał dla członków skrzydła głównego", isDefault: false, allowedRoles: "ADMIN,LEADERSHIP,MAIN_WING" },
  { name: "Międzynarodowe", description: "Channel for international wing members", isDefault: false, allowedRoles: "ADMIN,LEADERSHIP,INTERNATIONAL" },
  { name: "Skrzydło Kobiece", description: "Kanał dla członkiń skrzydła kobiecego", isDefault: false, allowedRoles: "ADMIN,LEADERSHIP,FEMALE_WING" },
  { name: "Ogłoszenia wewnętrzne", description: "Ważne ogłoszenia dla wszystkich członków", isDefault: false, allowedRoles: null },
];

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const created = [];
    for (const ch of DEFAULT_CHANNELS) {
      const exists = await prisma.memberChannel.findUnique({ where: { name: ch.name } });
      if (!exists) {
        const channel = await prisma.memberChannel.create({ data: ch });
        created.push(channel.name);
      }
    }

    return NextResponse.json({
      created,
      message: created.length > 0 ? `Created ${created.length} channels` : "All channels already exist",
    });
  } catch {
    return NextResponse.json({ error: "Failed to setup channels" }, { status: 500 });
  }
}
