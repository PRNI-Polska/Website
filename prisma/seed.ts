// file: prisma/seed.ts
/**
 * Database Seed Script
 * 
 * This script creates:
 * 1. Admin user account (using env vars ADMIN_EMAIL and ADMIN_PASSWORD)
 * 2. Sample announcements
 * 3. Sample events
 * 4. Sample manifesto sections
 * 5. Sample team members
 * 6. Default site settings
 * 
 * Run with: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // 1. Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@prni.org";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123!";
  
  console.log("Creating admin user...");
  const passwordHash = await hash(adminPassword, 12);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Create Sample Announcements
  console.log("\nCreating announcements...");
  const announcements = [
    {
      title: "Welcome to PRNI",
      slug: "welcome-to-prni",
      excerpt: "We are excited to launch our new website and begin our journey towards positive change.",
      content: `# Welcome to PRNI

We are thrilled to announce the launch of our official website. This marks a new chapter in our mission to build a better future for all citizens.

## Our Commitment

- **Transparency**: Open governance and clear communication
- **Progress**: Forward-thinking policies for the 21st century
- **Community**: Putting people first in every decision

## Get Involved

Join us on this journey. Whether you want to volunteer, attend events, or simply stay informed, there's a place for you in our movement.

Contact us to learn more about how you can make a difference.`,
      category: "NEWS" as const,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
      authorId: admin.id,
    },
    {
      title: "Upcoming Community Town Hall",
      slug: "community-town-hall-announcement",
      excerpt: "Join us for an open discussion about the issues that matter most to you.",
      content: `# Community Town Hall Announcement

We're hosting a series of town hall meetings across the region to hear directly from citizens about the challenges they face.

## What to Expect

- Open Q&A sessions with party leadership
- Breakout discussions on key policy areas
- Opportunity to submit written questions
- Light refreshments provided

## Why Your Voice Matters

Policy should be shaped by the people it affects. Your input helps us understand what matters most to our community and ensures our platform reflects your needs.

See our events calendar for dates and locations near you.`,
      category: "COMMUNITY" as const,
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 86400000),
      authorId: admin.id,
    },
    {
      title: "New Economic Policy Framework Released",
      slug: "economic-policy-framework",
      excerpt: "Our comprehensive economic plan focuses on sustainable growth and opportunity for all.",
      content: `# Economic Policy Framework

Today we release our comprehensive economic policy framework, designed to create sustainable prosperity for all citizens.

## Key Pillars

### 1. Job Creation
Investment in infrastructure and green technology to create quality employment opportunities.

### 2. Small Business Support
Reduced regulatory burden and improved access to capital for entrepreneurs.

### 3. Education & Training
Workforce development programs to prepare citizens for the jobs of tomorrow.

### 4. Fiscal Responsibility
Balanced budgets with strategic investments in our future.

Read the full policy document in our manifesto section.`,
      category: "POLICY" as const,
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 172800000),
      authorId: admin.id,
    },
  ];

  for (const announcement of announcements) {
    await prisma.announcement.upsert({
      where: { slug: announcement.slug },
      update: {},
      create: announcement,
    });
  }
  console.log(`✅ Created ${announcements.length} announcements`);

  // 3. Create Sample Events
  console.log("\nCreating events...");
  const now = new Date();
  const events = [
    {
      title: "Community Town Hall - Downtown",
      description: `# Downtown Town Hall Meeting

Join us for an open community discussion.

## Agenda

- 6:00 PM - Doors Open
- 6:30 PM - Welcome & Introduction
- 7:00 PM - Open Q&A Session
- 8:30 PM - Closing Remarks

Light refreshments will be provided. All community members welcome.`,
      startDateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      location: "Downtown Community Center, 100 Main Street",
      tags: "town hall, community, Q&A",
      status: "PUBLISHED" as const,
      createdById: admin.id,
    },
    {
      title: "Volunteer Training Session",
      description: `# Volunteer Training

Learn how you can make a difference in our campaign.

## Topics Covered

- Campaign messaging and values
- Door-to-door canvassing best practices
- Phone banking techniques
- Social media engagement

No experience necessary - all are welcome!`,
      startDateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      location: "Party Headquarters, 500 Democracy Ave",
      tags: "volunteer, training, campaign",
      rsvpLink: "https://example.com/rsvp",
      status: "PUBLISHED" as const,
      createdById: admin.id,
    },
    {
      title: "Policy Forum: Education",
      description: `# Education Policy Forum

A deep dive into our education platform with expert panelists.

## Featured Speakers

- Dr. Jane Smith, Education Policy Expert
- John Doe, Former School Board President
- Mary Johnson, Parent Advocate

Bring your questions and ideas for improving our schools.`,
      startDateTime: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000),
      location: "Public Library Auditorium, 200 Knowledge Lane",
      tags: "policy, education, forum",
      status: "PUBLISHED" as const,
      createdById: admin.id,
    },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }
  console.log(`✅ Created ${events.length} events`);

  // 4. Create Manifesto Sections
  console.log("\nCreating manifesto sections...");
  const manifestoSections = [
    {
      title: "Our Vision",
      slug: "our-vision",
      order: 1,
      content: `Our vision is of a society where every citizen has the opportunity to thrive, where government serves the people with integrity, and where our shared future is built on sustainability and justice.

We believe in:

- **Equal Opportunity**: Every person deserves a fair chance to succeed
- **Responsible Governance**: Transparent, accountable, and efficient government
- **Sustainable Progress**: Economic growth that protects our environment
- **Strong Communities**: Supporting families and neighborhoods`,
      status: "PUBLISHED" as const,
    },
    {
      title: "Economic Policy",
      slug: "economic-policy",
      order: 2,
      content: `Our economic platform focuses on creating sustainable prosperity for all citizens through strategic investment, fiscal responsibility, and support for businesses of all sizes.

## Key Initiatives

1. **Infrastructure Investment**: Modernizing transportation, broadband, and utilities
2. **Small Business Support**: Reducing barriers and improving access to capital
3. **Workforce Development**: Training programs for the jobs of tomorrow
4. **Fair Taxation**: A tax system that rewards work and investment`,
      status: "PUBLISHED" as const,
    },
    {
      title: "Education",
      slug: "education",
      order: 3,
      content: `Quality education is the foundation of opportunity and the key to our collective future. We are committed to ensuring every child has access to excellent schools and every adult has pathways to lifelong learning.

## Our Priorities

- Increased funding for public schools
- Teacher recruitment and retention
- Career and technical education expansion
- Affordable higher education
- Early childhood programs`,
      status: "PUBLISHED" as const,
    },
    {
      title: "Healthcare",
      slug: "healthcare",
      order: 4,
      content: `Access to quality, affordable healthcare is a fundamental need. Our healthcare platform focuses on expanding coverage, controlling costs, and improving outcomes for all citizens.

## Key Proposals

- Expand access to preventive care
- Lower prescription drug costs
- Support for mental health services
- Protect coverage for pre-existing conditions
- Invest in rural healthcare infrastructure`,
      status: "PUBLISHED" as const,
    },
    {
      title: "Environment",
      slug: "environment",
      order: 5,
      content: `We have a responsibility to protect our environment for future generations while creating economic opportunity through clean energy and sustainable practices.

## Environmental Commitments

- Transition to renewable energy sources
- Protect public lands and waterways
- Invest in clean technology research
- Support sustainable agriculture
- Combat climate change`,
      status: "PUBLISHED" as const,
    },
  ];

  for (const section of manifestoSections) {
    await prisma.manifestoSection.upsert({
      where: { slug: section.slug },
      update: {},
      create: section,
    });
  }
  console.log(`✅ Created ${manifestoSections.length} manifesto sections`);

  // 5. Create Team Members
  console.log("\nCreating team members...");
  const teamMembers = [
    {
      name: "Sarah Mitchell",
      role: "Party Leader",
      bio: "Sarah has dedicated her career to public service, serving 12 years in local government before taking on the leadership role. She is passionate about community development and economic opportunity.",
      order: 1,
      isLeadership: true,
    },
    {
      name: "James Chen",
      role: "Deputy Leader",
      bio: "James brings 20 years of business experience and a commitment to fiscal responsibility. He leads our economic policy development and business outreach efforts.",
      order: 2,
      isLeadership: true,
    },
    {
      name: "Maria Rodriguez",
      role: "Policy Director",
      bio: "Maria oversees our policy research and development. Her background in public policy and community organizing informs our evidence-based approach to governance.",
      order: 3,
      isLeadership: true,
    },
    {
      name: "David Thompson",
      role: "Communications Director",
      bio: "David manages our messaging and media relations, ensuring our values and policies are communicated clearly to the public.",
      order: 4,
      isLeadership: false,
    },
    {
      name: "Emily Watson",
      role: "Volunteer Coordinator",
      bio: "Emily leads our grassroots organizing efforts, connecting passionate volunteers with opportunities to make a difference in their communities.",
      order: 5,
      isLeadership: false,
    },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.create({ data: member });
  }
  console.log(`✅ Created ${teamMembers.length} team members`);

  // 6. Create Site Settings
  console.log("\nCreating site settings...");
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "PRNI Political Party",
      siteDescription: "Building a better future together",
      contactEmail: "info@prni.org",
    },
  });
  console.log("✅ Site settings configured");

  console.log("\n🎉 Database seeding completed successfully!");
  console.log(`\n📋 Admin Login Credentials:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`\n⚠️  Remember to change the admin password in production!`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
