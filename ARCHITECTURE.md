# Architecture Overview

## Routing Map

```
Public Routes (app/(public)/)
├── /                       → Home page (hero, announcements, events, manifesto highlights)
├── /announcements          → Paginated list with search & category filter
├── /announcements/[slug]   → Single announcement detail
├── /events                 → Calendar + list view
├── /manifesto              → Structured manifesto with TOC
├── /about                  → Party info + team cards
└── /contact                → Contact form

Admin Routes (app/admin/)
├── /admin/login            → Authentication page
├── /admin                  → Dashboard with stats
├── /admin/announcements    → CRUD list
├── /admin/announcements/new    → Create form
├── /admin/announcements/[id]   → Edit form
├── /admin/events           → CRUD list
├── /admin/events/new       → Create form
├── /admin/events/[id]      → Edit form
├── /admin/manifesto        → Section management
├── /admin/manifesto/new    → Create section
├── /admin/manifesto/[id]   → Edit section
├── /admin/team             → Team member list
├── /admin/team/new         → Add member
└── /admin/team/[id]        → Edit member

API Routes (app/api/)
├── /api/auth/[...nextauth] → NextAuth handlers
├── /api/contact            → Contact form submission
├── /api/calendar/feed      → iCal export
└── /api/admin/
    ├── announcements       → GET/POST
    ├── announcements/[id]  → GET/PATCH/DELETE
    ├── events              → GET/POST
    ├── events/[id]         → GET/PATCH/DELETE
    ├── manifesto           → GET/POST
    ├── manifesto/[id]      → GET/PATCH/DELETE
    ├── team                → GET/POST
    └── team/[id]           → GET/PATCH/DELETE
```

## Data Models

```
User
├── id: string (cuid)
├── email: string (unique)
├── passwordHash: string
├── name: string?
├── role: enum (ADMIN)
├── createdAt: datetime
└── updatedAt: datetime

Announcement
├── id: string (cuid)
├── title: string
├── slug: string (unique)
├── excerpt: string
├── content: string (markdown)
├── category: enum (NEWS, PRESS_RELEASE, POLICY, CAMPAIGN, COMMUNITY, OTHER)
├── featuredImage: string?
├── status: enum (DRAFT, PUBLISHED, ARCHIVED)
├── publishedAt: datetime?
├── authorId: string → User
├── createdAt: datetime
└── updatedAt: datetime

Event
├── id: string (cuid)
├── title: string
├── description: string (markdown)
├── startDateTime: datetime
├── endDateTime: datetime
├── location: string
├── rsvpLink: string?
├── organizerContact: string?
├── tags: string (comma-separated)
├── status: enum (DRAFT, PUBLISHED, ARCHIVED)
├── createdById: string → User
├── createdAt: datetime
└── updatedAt: datetime

ManifestoSection
├── id: string (cuid)
├── title: string
├── slug: string (unique)
├── content: string (markdown)
├── order: int
├── parentId: string? → ManifestoSection (self-referential)
├── status: enum (DRAFT, PUBLISHED, ARCHIVED)
├── createdAt: datetime
└── updatedAt: datetime

TeamMember
├── id: string (cuid)
├── name: string
├── role: string
├── bio: string
├── photoUrl: string?
├── email: string?
├── order: int
├── isLeadership: boolean
├── createdAt: datetime
└── updatedAt: datetime

AuditLog
├── id: string (cuid)
├── action: string (CREATE, UPDATE, DELETE)
├── entityType: string
├── entityId: string
├── details: string? (JSON)
├── userId: string → User
└── createdAt: datetime

SiteSettings
├── id: string (default: "default")
├── siteName: string
├── siteDescription: string
├── manifestoPdfUrl: string?
├── contactEmail: string?
├── socialLinks: string? (JSON)
└── updatedAt: datetime
```

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────>│  Middleware │────>│  NextAuth   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           │ Check JWT token    │ Verify credentials
                           │                    │
                    ┌──────▼──────┐     ┌───────▼──────┐
                    │ Protected?  │     │   Prisma DB  │
                    │ Admin route │     │  (User table)│
                    └──────┬──────┘     └──────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌────▼────┐ ┌────▼────┐
        │  Allow    │ │ Redirect│ │  401    │
        │  access   │ │ to login│ │  error  │
        └───────────┘ └─────────┘ └─────────┘
```

## Main Components

### Public
- `Header` - Navigation, mobile menu
- `Footer` - Links, contact info
- `MarkdownRenderer` - Safe markdown with sanitization
- `EventsClient` - Calendar view + event dialog

### Admin
- `AdminSidebar` - Navigation
- `AdminHeader` - User menu, logout
- `AnnouncementForm` - Create/edit with markdown preview
- `EventForm` - Date pickers, markdown editor
- `ManifestoForm` - Section management
- `TeamForm` - Member details
- `DeleteButton` - Confirmation dialog

### UI Primitives (shadcn-style)
- Button, Input, Textarea, Label
- Card, Badge, Separator
- Dialog, AlertDialog
- Select, Checkbox
- Tabs, Accordion
- Toast (notifications)
- Avatar, DropdownMenu

## Security Layers

```
┌─────────────────────────────────────────────────┐
│                   Client                         │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              Rate Limiting                       │
│     (Login: 5/15min, Contact: 5/15min)          │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              Input Validation                    │
│            (Zod schemas)                         │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│            NextAuth Middleware                   │
│       (JWT verification, CSRF)                   │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│          Server-side Authorization               │
│     (requireAdmin() on every handler)            │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              Database (Prisma)                   │
│       (Passwords hashed with bcrypt)             │
└─────────────────────────────────────────────────┘
```

## Theme Architecture

```
globals.css
├── :root (Classic theme)
│   ├── Typography tokens
│   ├── Color tokens (HSL)
│   ├── Spacing tokens
│   ├── Shadow tokens
│   └── Border radius
│
├── [data-theme="modern"]
│   └── Override all tokens
│
└── .dark (Dark mode overrides)

tailwind.config.ts
└── References CSS variables
    ├── colors: hsl(var(--primary))
    ├── borderRadius: var(--radius)
    └── fontFamily: var(--font-sans)

layout.tsx
└── Sets data-theme attribute
    └── Loads appropriate fonts
```

## File Structure Summary

```
prni/
├── app/
│   ├── (public)/        # Public pages with header/footer
│   ├── admin/           # Admin portal
│   ├── api/             # API routes
│   ├── globals.css      # Theme tokens
│   └── layout.tsx       # Root layout
├── components/
│   ├── admin/           # Admin-specific
│   ├── layout/          # Header, Footer
│   ├── ui/              # Reusable primitives
│   └── markdown-renderer.tsx
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── db.ts            # Prisma client
│   ├── utils.ts         # Helpers
│   └── validations.ts   # Zod schemas
├── prisma/
│   ├── schema.prisma    # PostgreSQL schema
│   ├── schema.sqlite.prisma  # SQLite version
│   └── seed.ts          # Sample data
├── middleware.ts        # Auth middleware
├── next.config.js
├── tailwind.config.ts
├── package.json
├── README.md
├── DESIGNER_GUIDE.md
└── ARCHITECTURE.md
```
