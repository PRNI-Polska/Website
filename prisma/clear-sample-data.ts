// file: prisma/clear-sample-data.ts
/**
 * Script to clear sample announcements and events from database
 * Run with: npx tsx prisma/clear-sample-data.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing sample data...\n");

  // Delete all announcements
  const deletedAnnouncements = await prisma.announcement.deleteMany({});
  console.log(`✅ Deleted ${deletedAnnouncements.count} announcements`);

  // Delete all events
  const deletedEvents = await prisma.event.deleteMany({});
  console.log(`✅ Deleted ${deletedEvents.count} events`);

  // Delete all team members (sample data)
  const deletedTeamMembers = await prisma.teamMember.deleteMany({});
  console.log(`✅ Deleted ${deletedTeamMembers.count} team members`);

  // Delete all manifesto sections (sample data)
  const deletedManifesto = await prisma.manifestoSection.deleteMany({});
  console.log(`✅ Deleted ${deletedManifesto.count} manifesto sections`);

  console.log("\n🎉 Sample data cleared successfully!");
}

main()
  .catch((e) => {
    console.error("Error clearing data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
