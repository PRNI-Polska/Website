// file: app/(public)/about/page.tsx
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import AboutPageClient from "./about-client";

export const metadata: Metadata = {
  title: "O Narodowym Integralizmie | About National Integralism",
  description: "Budujemy silną i suwerenną przyszłość opartą na odpowiedzialności, porządku oraz lojalności wobec wspólnoty narodowej.",
};

async function getTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: [
      { isLeadership: "desc" },
      { order: "asc" },
    ],
  });
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers();
  
  return <AboutPageClient teamMembers={teamMembers} />;
}
