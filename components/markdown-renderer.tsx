// file: components/markdown-renderer.tsx
/**
 * Safe Markdown Renderer
 * 
 * This component renders Markdown content with strict sanitization to prevent XSS attacks.
 * 
 * SECURITY NOTES:
 * - Uses rehype-sanitize to remove all HTML tags by default
 * - Only allows safe Markdown constructs (headings, lists, links, emphasis, code)
 * - Links are rendered with rel="noopener noreferrer" and target="_blank"
 * - Images use next/image when possible for optimization
 * 
 * ALLOWED ELEMENTS:
 * - Headings (h1-h6)
 * - Paragraphs
 * - Lists (ordered and unordered)
 * - Links (external only, with security attributes)
 * - Emphasis (bold, italic)
 * - Code (inline and blocks)
 * - Blockquotes
 * - Horizontal rules
 * - Tables (with GFM support)
 * 
 * DISALLOWED:
 * - Raw HTML tags
 * - Scripts
 * - iframes
 * - Style tags/attributes
 * - Event handlers
 */
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { cn } from "@/lib/utils";

// Strict sanitization schema - only allows safe elements
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "a",
    "strong", "em", "del", "s",
    "code", "pre",
    "blockquote",
    "table", "thead", "tbody", "tr", "th", "td",
    "img", // Allow images but sanitize attributes
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title"],
    img: ["src", "alt", "title"],
    code: ["className"], // For syntax highlighting class
    // Remove all other attributes
  },
  protocols: {
    href: ["http", "https", "mailto"],
    src: ["http", "https"],
  },
  // Strip all other HTML
  strip: ["script", "style", "iframe", "object", "embed", "form", "input"],
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose-custom", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={{
          // Add security attributes to links
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              {...props}
            >
              {children}
            </a>
          ),
          // Style headings with proper hierarchy
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-5 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium mt-4 mb-2">{children}</h4>
          ),
          // Style code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={cn("font-mono text-sm", className)} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted border border-border rounded-lg p-4 overflow-x-auto my-4">
              {children}
            </pre>
          ),
          // Style blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
              {children}
            </blockquote>
          ),
          // Style lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-4 space-y-1">{children}</ol>
          ),
          // Style paragraphs
          p: ({ children }) => (
            <p className="my-4 leading-relaxed">{children}</p>
          ),
          // Style tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">{children}</td>
          ),
          // Style images
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ""}
              className="max-w-full h-auto rounded-lg my-4"
              loading="lazy"
            />
          ),
          // Style horizontal rules
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
