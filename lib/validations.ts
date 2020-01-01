// file: lib/validations.ts
import { z } from "zod";

// ============================================================================
// SECURITY HELPERS
// ============================================================================

// Patterns to detect potential XSS/injection attempts.
// SECURITY: Patterns are intentionally simple to avoid ReDoS (catastrophic
// backtracking).  Complex nested quantifiers have been replaced with safe
// linear-time alternatives.
const DANGEROUS_PATTERNS = [
  /<script/gi,       // Opening script tag (simple, no backtracking)
  /javascript:/gi,
  /on\w+\s*=/gi,     // onclick=, onerror=, etc.
  /data:\s*text\/html/gi,
  /vbscript:/gi,
];

// Check for dangerous content
function containsDangerousContent(value: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0; // Reset stateful regexes (global flag)
    return pattern.test(value);
  });
}

// Safe string refinement — applies XSS pattern check
const safeString = (schema: z.ZodString) =>
  schema.refine(
    (val) => !containsDangerousContent(val),
    { message: "Input contains potentially dangerous content" }
  );

// Sanitize string by removing null bytes and control characters
const sanitizedString = z.string().transform((val) =>
  val.replace(/\x00/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
);

// ============================================================================
// ANNOUNCEMENT SCHEMAS
// ============================================================================
export const announcementCategoryEnum = z.enum([
  "NEWS",
  "PRESS_RELEASE",
  "POLICY",
  "CAMPAIGN",
  "COMMUNITY",
  "OTHER",
]);

export const contentStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createAnnouncementSchema = z.object({
  title: safeString(
    z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters")
  ),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug must be less than 200 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: safeString(
    z
      .string()
      .min(1, "Excerpt is required")
      .max(500, "Excerpt must be less than 500 characters")
  ),
  content: z.string().min(1, "Content is required")
    .refine((val) => !containsDangerousContent(val), {
      message: "Content contains potentially dangerous elements",
    }),
  category: announcementCategoryEnum,
  featuredImage: z.string().url().optional().or(z.literal("")),
  status: contentStatusEnum.default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

// ============================================================================
// EVENT SCHEMAS
// ============================================================================
export const createEventSchema = z.object({
  title: safeString(
    z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters")
  ),
  description: z.string().min(1, "Description is required")
    .refine((val) => !containsDangerousContent(val), {
      message: "Description contains potentially dangerous elements",
    }),
  startDateTime: z.string().datetime("Invalid start date/time"),
  endDateTime: z.string().datetime("Invalid end date/time"),
  location: safeString(
    z
      .string()
      .min(1, "Location is required")
      .max(500, "Location must be less than 500 characters")
  ),
  rsvpLink: z.string().url().optional().or(z.literal("")),
  organizerContact: z.string().max(200).optional().or(z.literal("")),
  tags: safeString(
    z.string().max(500, "Tags must be less than 500 characters")
  ),
  status: contentStatusEnum.default("DRAFT"),
}).refine((data) => new Date(data.endDateTime) > new Date(data.startDateTime), {
  message: "End date must be after start date",
  path: ["endDateTime"],
});

export const updateEventSchema = z.object({
  id: z.string().cuid(),
  title: safeString(z.string().min(1).max(200)).optional(),
  description: z.string().min(1)
    .refine((val) => !containsDangerousContent(val), {
      message: "Description contains potentially dangerous elements",
    }).optional(),
  startDateTime: z.string().datetime().optional(),
  endDateTime: z.string().datetime().optional(),
  location: safeString(z.string().min(1).max(500)).optional(),
  rsvpLink: z.string().url().optional().or(z.literal("")),
  organizerContact: z.string().max(200).optional().or(z.literal("")),
  tags: safeString(z.string().max(500)).optional(),
  status: contentStatusEnum.optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// ============================================================================
// MANIFESTO SECTION SCHEMAS
// ============================================================================
export const createManifestoSectionSchema = z.object({
  title: safeString(
    z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters")
  ),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug must be less than 200 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  content: z.string().min(1, "Content is required")
    .refine((val) => !containsDangerousContent(val), {
      message: "Content contains potentially dangerous elements",
    }),
  order: z.number().int().min(0),
  parentId: z.string().cuid().optional().nullable(),
  status: contentStatusEnum.default("DRAFT"),
});

export const updateManifestoSectionSchema = createManifestoSectionSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateManifestoSectionInput = z.infer<typeof createManifestoSectionSchema>;
export type UpdateManifestoSectionInput = z.infer<typeof updateManifestoSectionSchema>;

// ============================================================================
// TEAM MEMBER SCHEMAS
// ============================================================================
export const createTeamMemberSchema = z.object({
  name: safeString(
    z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
  ),
  role: safeString(
    z
      .string()
      .min(1, "Role is required")
      .max(100, "Role must be less than 100 characters")
  ),
  bio: safeString(
    z
      .string()
      .min(1, "Bio is required")
      .max(1000, "Bio must be less than 1000 characters")
  ),
  photoUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  order: z.number().int().min(0),
  isLeadership: z.boolean().default(false),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;

// ============================================================================
// CONTACT FORM SCHEMA (Enhanced Security)
// ============================================================================

// Blocked email domains (disposable / temporary email services used for spam)
// This is a curated list of the most common ones; for comprehensive coverage
// consider using a package like `disposable-email-domains` from npm.
const BLOCKED_EMAIL_DOMAINS = [
  // Major disposable providers
  "tempmail.com",
  "throwaway.email",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.de",
  "10minutemail.com",
  "10minutemail.net",
  "mailinator.com",
  "yopmail.com",
  "yopmail.fr",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "sharklasers.com",
  "guerrillamailblock.com",
  "grr.la",
  "dispostable.com",
  "mailnesia.com",
  "maildrop.cc",
  "discard.email",
  "mohmal.com",
  "fakeinbox.com",
  "tempail.com",
  "temp-mail.org",
  "temp-mail.io",
  "emailondeck.com",
  "getnada.com",
  "burnermail.io",
  "inboxbear.com",
  "mailsac.com",
  "harakirimail.com",
  "throwaway.email",
  "mailcatch.com",
  "mytemp.email",
  "tempinbox.com",
  "getairmail.com",
  "tmail.ws",
  "spamgourmet.com",
  "mailnull.com",
  "jetable.org",
  "mintemail.com",
  "nowmymail.com",
  "spamfree24.org",
  "trashymail.com",
  "binkmail.com",
  "bobmail.info",
  "chammy.info",
  "devnullmail.com",
  "filzmail.com",
  "letthemeatspam.com",
  "mailexpire.com",
  "mailzilla.com",
  "tempmail.net",
  "tempr.email",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wh4f.org",
];

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-'.]+$/, "Name contains invalid characters")
    .transform((val) => val.trim()),
  email: z
    .string()
    .email("Invalid email address")
    .max(254, "Email too long")
    .transform((val) => val.toLowerCase().trim())
    .refine(
      (email) => {
        const domain = email.split("@")[1];
        return !BLOCKED_EMAIL_DOMAINS.includes(domain);
      },
      { message: "Please use a valid email address" }
    ),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters")
    .transform((val) => val.trim())
    .refine((val) => !containsDangerousContent(val), {
      message: "Subject contains invalid content",
    }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters")
    .transform((val) => val.trim())
    .refine((val) => !containsDangerousContent(val), {
      message: "Message contains invalid content",
    }),
  // Honeypot field - should always be empty
  website: z.string().optional(),
  // Optional: timestamp to detect automated submissions
  timestamp: z.number().optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ============================================================================
// RECRUITMENT FORM SCHEMA (Similar to Contact)
// ============================================================================
export const recruitmentFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-'.]+$/, "Name contains invalid characters")
    .transform((val) => val.trim()),
  email: z
    .string()
    .email("Invalid email address")
    .max(254, "Email too long")
    .transform((val) => val.toLowerCase().trim())
    .refine(
      (email) => {
        const domain = email.split("@")[1];
        return !BLOCKED_EMAIL_DOMAINS.includes(domain);
      },
      { message: "Please use a valid email address" }
    ),
  location: z
    .string()
    .max(120, "Location must be less than 120 characters")
    .optional()
    .transform((val) => (val ?? "").trim())
    .refine((val) => !containsDangerousContent(val), {
      message: "Location contains invalid content",
    }),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(5000, "Message must be less than 5000 characters")
    .transform((val) => val.trim())
    .refine((val) => !containsDangerousContent(val), {
      message: "Message contains invalid content",
    }),
  // Honeypot field - should always be empty
  website: z.string().optional(),
  timestamp: z.number().optional(),
});

export type RecruitmentFormInput = z.infer<typeof recruitmentFormSchema>;

// ============================================================================
// AUTH SCHEMAS
// ============================================================================
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(254, "Email too long")
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password too long"), // Prevent DoS via very long passwords
});

export type LoginInput = z.infer<typeof loginSchema>;

// For admin password changes (enforces VERY strong passwords)
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(20, "Password must be at least 20 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/[A-Z].*[A-Z]/, "Password must contain at least 2 uppercase letters")
    .regex(/[a-z].*[a-z]/, "Password must contain at least 2 lowercase letters")
    .regex(/[0-9].*[0-9]/, "Password must contain at least 2 numbers")
    .regex(/[^A-Za-z0-9].*[^A-Za-z0-9]/, "Password must contain at least 2 special characters")
    .refine(
      (val) => {
        // Reject passwords with 3+ repeating characters (e.g. "aaa", "111")
        return !/(.)\1{2,}/.test(val);
      },
      { message: "Password must not contain 3 or more repeating characters" }
    )
    .refine(
      (val) => {
        // Reject common keyboard patterns
        const patterns = ["qwerty", "asdfgh", "zxcvbn", "123456", "abcdef", "password", "admin"];
        const lower = val.toLowerCase();
        return !patterns.some((p) => lower.includes(p));
      },
      { message: "Password contains a common pattern and is too predictable" }
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
