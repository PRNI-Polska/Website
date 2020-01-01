// file: lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 * This ensures Tailwind classes are properly merged without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * Format a date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text to a specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/**
 * Create an excerpt from Markdown content
 */
export function createExcerpt(markdown: string, length: number = 160): string {
  // Remove Markdown formatting
  const plain = markdown
    .replace(/#{1,6}\s+/g, "") // Headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold
    .replace(/\*([^*]+)\*/g, "$1") // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/>\s+/g, "") // Blockquotes
    .replace(/[-*+]\s+/g, "") // List items
    .replace(/\n+/g, " ") // Newlines
    .trim();
  
  return truncate(plain, length);
}

/**
 * Validate honeypot field (should be empty)
 */
export function validateHoneypot(value: string | undefined | null): boolean {
  return !value || value.trim() === "";
}
