// file: lib/types.ts
// Shared type definitions that mirror the Prisma schema string fields

export type AnnouncementCategory = 
  | "NEWS" 
  | "PRESS_RELEASE" 
  | "POLICY" 
  | "CAMPAIGN" 
  | "COMMUNITY" 
  | "OTHER";

export type ContentStatus = 
  | "DRAFT" 
  | "PUBLISHED" 
  | "ARCHIVED";

export const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = [
  "NEWS",
  "PRESS_RELEASE",
  "POLICY",
  "CAMPAIGN",
  "COMMUNITY",
  "OTHER",
];

export const CONTENT_STATUSES: ContentStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];
